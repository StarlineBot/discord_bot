const getDate = function (date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, 0)
  const day = String(date.getDate()).padStart(2, 0)
  const hours = String(date.getHours()).padStart(2, 0)
  const min = String(date.getMinutes()).padStart(2, 0)
  const sec = String(date.getSeconds()).padStart(2, 0)
  return `${year}-${month}-${day} ${hours}:${min}:${sec}`
}

// 파티모집 본문/메시지에서 "라벨: 값" 한 줄의 값만 추출(여러 줄·여러 콜론에도 안전).
// 예: extractField(content, '출발시간') → "10월 02일 금요일 20시 00분"
const extractField = function (content, label) {
  const m = (content || '').match(new RegExp(label + ':\\s*([^\\n]+)'))
  return m ? m[1].trim() : null
}

module.exports = { getDate, extractField }
