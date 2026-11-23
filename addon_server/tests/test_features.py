"""기능 사용 값 추출(bundle.extract_features) — featureUsage(새 앱) / enabled 불값(옛 앱)."""
from app.bundle import MAX_USAGE, extract_features
from conftest import auth, login, make_bundle


def test_feature_usage_only_when_present():
    cfg = {
        "featureUsage": {"buffTracker": "2026-11-18", "halo": "2026-11-10"},
        "blackbox": {"enabled": True},      # featureUsage가 있으면 enabled는 무시
        "voiceEnabled": True,
    }
    assert extract_features(cfg) == {"buffTracker": "2026-11-18", "halo": "2026-11-10"}


def test_feature_usage_drops_bad_values():
    cfg = {"featureUsage": {
        "ok": "2026-11-18",
        "noDate": "어제", "badFormat": "2026/11/18", "noPad": "2026-1-8", "notReal": "2026-02-30",
        "number": 20261118, "bool": True, "none": None, "list": ["2026-11-18"],
        "": "2026-11-18", "k" * 65: "2026-11-18", "k" * 64: "2026-11-17",
    }}
    assert extract_features(cfg) == {"ok": "2026-11-18", "k" * 64: "2026-11-17"}


def test_feature_usage_limit_and_empty():
    usage = {f"f{i}": "2026-11-18" for i in range(MAX_USAGE + 10)}
    assert len(extract_features({"featureUsage": usage})) == MAX_USAGE
    # 빈 featureUsage = 새 앱인데 아직 쓴 기능 없음 → 옛 규칙으로 돌아가지 않는다
    assert extract_features({"featureUsage": {}, "blackbox": {"enabled": True}}) == {}


def test_legacy_rules_without_feature_usage():
    cfg = {"blackbox": {"enabled": True}, "cursorFx": {"enabled": False}, "autofindV2": {"enabled": True},
           "voiceEnabled": True, "theme": "dark", "featureUsage": "이상한 값"}
    assert extract_features(cfg) == {"blackbox": True, "cursorFx": False, "voiceEnabled": True}


def test_upload_with_feature_usage_saved(client):
    token, _ = login(client)
    data = make_bundle({"featureUsage": {"bossPattern": "2026-11-18", "bad": "x"}, "blackbox": {"enabled": True}})
    r = client.put("/settings", content=data,
                   headers={**auth(token), "If-Match": "0", "Content-Type": "application/zip"})
    assert r.status_code == 200, r.text
    assert client.app.state.db.get_settings("111")["features"] == {"bossPattern": "2026-11-18"}
