const getDate = function (date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, 0)
  const day = String(date.getDate()).padStart(2, 0)
  const hours = String(date.getHours()).padStart(2, 0)
  const min = String(date.getMinutes()).padStart(2, 0)
  const sec = String(date.getSeconds()).padStart(2, 0)
  return `${year}-${month}-${day} ${hours}:${min}:${sec}`
}

module.exports = { getDate }