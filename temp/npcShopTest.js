const axios = require('axios')
const nexonApiKey = 'live_10adcd4d2e0a6f843628b1777510b03107c362eabd7c0b4118f0e8c78680148eefe8d04e6d233bd35cf2fabdeb93fb0d'
const mainUrl = 'https://open.api.nexon.com'

const npcShopTest = async function () {
  const map = new Map()
  // let sellers = ["카디", "상인 네루", "상인 에루", "상인 베루", "상인 세누", "테일로", "데위", "얼리", "귀넥", "켄", "상인 메루", "상인 누누", "리나", "상인 아루", "모락", "상인 피루", "상인 라누"];
  const sellers = ['카디']
  const maxChannel = 2
  for (let channel = 1; channel <= maxChannel; channel++) {
    for (const seller of sellers) {
      console.log(channel, seller)
      const getBody = await axios({
        method: 'GET',
        url: mainUrl + `/mabinogi/v1/npcshop/list?server_name=하프&channel=${channel}&npc_name=${seller}`,
        headers: {
          'x-nxopen-api-key': nexonApiKey
        }
      })

      const tab = getBody.data.shop.find(getShop => getShop.tab_name === '주머니')
      const itemList = tab.item
      // console.log(itemList);
      for (const item of itemList) {
        if (!map.has(item.item_display_name)) {
          map.set(item.item_display_name, new Map())
        }
        const subMap = map.get(item.item_display_name)
        if (!subMap.has(seller)) {
          subMap.set(seller, [])
        }
        const list = subMap.get(seller)
        list.push(item.image_url)
        const set = new Set(list)
        subMap.set(seller, [...set])
        map.set(item.item_display_name, subMap)
      }
    }
  }

  console.log(map)
}
npcShopTest()
