const axios = require("axios")
const fs = require("fs");
const mainUrl = "";

const test = async function () {
  let userMessageCounts = {
    "1126803872925634581": {}
  }
  console.log(userMessageCounts)

  let userTextRank = Object.entries(userMessageCounts["1126803872925634581"]).sort((a,b) => b[1] - a[1])
  console.log(userTextRank.length === 0)
  userTextRank.forEach(([key, value], index) => {
    console.log(keu, value, index)
  })
  /*
  await axios({
    method: "GET",
    url: mainUrl + "/profile/wow/character/{realmSlug}/{characterName}",
    headers: {

    }
  })
  */
}

test();