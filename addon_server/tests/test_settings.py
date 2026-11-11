import io
import zipfile

from conftest import auth, login, make_bundle


def put(client, token, data, rev="0", **params):
    return client.put("/settings", content=data, params=params,
                      headers={**auth(token), "If-Match": rev, "Content-Type": "application/zip"})


def test_empty_then_upload_and_download(client):
    token, _ = login(client)
    assert client.get("/settings", headers=auth(token)).json() == {"exists": False, "rev": 0}
    assert client.get("/settings/blob", headers=auth(token)).status_code == 404
    data = make_bundle(extra={"userdata/buffs/a.png": b"\x89PNG"})
    r = put(client, token, data, device="내 컴퓨터", resolution="2560x1440")
    assert r.status_code == 200, r.text
    assert r.json()["rev"] == 1 and r.json()["size"] == len(data)
    meta = client.get("/settings", headers=auth(token)).json()
    assert meta["exists"] and meta["rev"] == 1 and meta["device"] == "내 컴퓨터" and meta["resolution"] == "2560x1440"
    blob = client.get("/settings/blob", headers=auth(token))
    assert blob.content == data and blob.headers["X-Settings-Rev"] == "1"
    # 봇 보기용 기능 사용 값
    saved = client.app.state.db.get_settings("111")
    assert saved["features"] == {"blackbox": True, "cursorFx": False, "voiceEnabled": True}


def test_rev_conflict_409(client):
    token, _ = login(client)
    assert put(client, token, make_bundle(), rev="0").json()["rev"] == 1
    r = put(client, token, make_bundle(), rev="0")  # 옛 rev로 올림
    assert r.status_code == 409 and r.json()["rev"] == 1
    assert put(client, token, make_bundle(), rev='"1"').json()["rev"] == 2  # 따옴표 ETag 형식도 허용


def test_if_match_required(client):
    token, _ = login(client)
    r = client.put("/settings", content=make_bundle(), headers=auth(token))
    assert r.status_code == 428
    assert put(client, token, make_bundle(), rev="abc").status_code == 400


def test_size_limit_2mb(client):
    token, _ = login(client)
    big = make_bundle(extra={"userdata/big.bin": __import__("os").urandom(2 * 1024 * 1024 + 10)})
    assert put(client, token, big).status_code == 413
    assert client.get("/settings", headers=auth(token)).json()["exists"] is False


def test_rejects_non_zip_and_bad_bundles(client):
    token, _ = login(client)
    assert put(client, token, b"not a zip").status_code == 422
    assert put(client, token, b"").status_code == 422
    # config.json 없음
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        z.writestr("other.txt", "x")
    assert put(client, token, buf.getvalue()).status_code == 422
    # JSON 아님 / 객체 아님
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        z.writestr("config.json", "{oops")
    assert put(client, token, buf.getvalue()).status_code == 422
    assert put(client, token, make_bundle(cfg=[1, 2])).status_code == 422
    # 경로 탈출
    assert put(client, token, make_bundle(extra={"../evil.png": b"x"})).status_code == 422
    # 비밀값 포함
    assert put(client, token, make_bundle(cfg={"nexonApiKey": "secret"})).status_code == 422
    assert client.get("/settings", headers=auth(token)).json()["exists"] is False


def test_zip_bomb_declared_size_rejected(client):
    token, _ = login(client)
    big_config = make_bundle(cfg={"pad": "x" * (1024 * 1024 + 10)})  # 1MB 넘는 config.json(압축하면 작음)
    assert put(client, token, big_config).status_code == 413


def test_bad_resolution_ignored(client):
    token, _ = login(client)
    put(client, token, make_bundle(), resolution="<script>")
    assert client.get("/settings", headers=auth(token)).json()["resolution"] is None


def test_users_isolated(client):
    a, _ = login(client, code="code-user")
    b, _ = login(client, code="code-creator")
    put(client, a, make_bundle(cfg={"memo": {"enabled": True}}))
    assert client.get("/settings", headers=auth(b)).json()["exists"] is False
    assert client.get("/settings/blob", headers=auth(b)).status_code == 404
