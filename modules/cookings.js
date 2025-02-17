const cookings = [
  {
    originName: 'Cornbread',
    localName: '옥수수 식빵',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Cornbread Dough(75%) Egg(15%) Yeast(10%)',
    localRecipe: '옥수수 빵 반죽(75%) 달걀(15%) 이스트(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/3f/Cornbread.png',
    status: [
      {
        name: '생명력',
        value: 30
      },
      {
        name: '체력',
        value: 16
      },
      {
        name: '지력',
        value: 12
      },
      {
        name: '솜씨',
        value: 8
      },
      {
        name: '의지',
        value: 8
      }
    ],
    index: 0,
    isCatering: true
  },
  {
    originName: 'Amatriciana',
    localName: '아마트리치아나',
    originCookingType: 'Pasta Making',
    localCookingType: '파스타 만들기',
    originRecipe: 'Short Pasta(80%) Tomato Sauce(18%) Spicy Pepper(2%)',
    localRecipe: '쇼트파스타(80%) 토마토소스(18%) 매운 고추(2%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/b/b4/Amatriciana.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '스태미나',
        value: -8
      }
    ],
    index: 1,
    isCatering: true
  },
  {
    originName: 'Coleslaw',
    localName: '코울슬로',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Cabbage(70%) Mayonnaise(12%) Vinegar(18%)',
    localRecipe: '양배추(70%) 마요네즈(12%) 식초(18%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e1/Coleslaw.png',
    status: [
      {
        name: '체력',
        value: 25
      },
      {
        name: '의지',
        value: 10
      },
      {
        name: '행운',
        value: 25
      }
    ],
    index: 2,
    isCatering: true
  },
  {
    originName: 'Coq Au Vin',
    localName: '코 코 뱅',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Chicken Wings(50%) Emain Macha Wine(40%) Thyme(10%)',
    localRecipe: '닭날개(50%) 이멘 마하산 와인(40%) 타임(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/4/42/Coq_Au_Vin.png',
    status: [
      {
        name: '생명력',
        value: 20
      },
      {
        name: '체력',
        value: 3
      },
      {
        name: '솜씨',
        value: 10
      },
      {
        name: '의지',
        value: 8
      }
    ],
    index: 3,
    isCatering: true
  },
  {
    originName: 'Assorted Sashimi Bibimbap',
    localName: '모둠회덮밥',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Assorted Sashimi(46%) Steamed Rice(18%) Mixed Vegetables(36%)',
    localRecipe: '모둠생선회(46%) 밥(18%) 야채 모둠(36%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/b/b4/Assorted_Sashimi_Bibimbap.png',
    status: [
      {
        name: '생명력',
        value: 35
      },
      {
        name: '마나',
        value: 25
      },
      {
        name: '최대대미지',
        value: 2
      },
      {
        name: '마법공격력',
        value: 2
      }
    ],
    index: 4,
    isCatering: true
  },
  {
    originName: 'Curry Bread',
    localName: '카레빵',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Bread(71%) Curry Powder(14%) Sliced Meat(15%)',
    localRecipe: '빵(71%) 카레가루(14%) 고기 조각(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/02/Curry_Bread.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '체력',
        value: 8
      }
    ],
    index: 5,
    isCatering: true
  },
  {
    originName: 'Halloween Ghost Jelly',
    localName: '할로윈 유령 젤리',
    originCookingType: 'Jam Making',
    localCookingType: '잼 만들기',
    originRecipe: 'Gelatin(85%) Lemon(15%)',
    localRecipe: '젤라틴(85%) 레몬(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/75/Halloween_Ghost_Jelly.png',
    status: [
      {
        name: '지력',
        value: 10
      }
    ],
    index: 6,
    isCatering: true
  },
  {
    originName: 'Corn Soup',
    localName: '옥수수 수프',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Whipped Cream(55%) Fried Vegetables(25%) Corn(20%)',
    localRecipe: '생크림(55%) 야채볶음(25%) 옥수수(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/2d/Corn_Soup.png',
    status: [
      {
        name: '생명력',
        value: 40
      },
      {
        name: '체력',
        value: 8
      },
      {
        name: '지력',
        value: 8
      },
      {
        name: '솜씨',
        value: 10
      },
      {
        name: '의지',
        value: 10
      }
    ],
    index: 7,
    isCatering: true
  },
  {
    originName: 'Blueberry Jam',
    localName: '블루베리잼',
    originCookingType: 'Jam Making',
    localCookingType: '잼 만들기',
    originRecipe: 'Blueberry(70%) Sugar(30%)',
    localRecipe: '블루베리(70%) 설탕(30%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/3d/Blueberry_Jam.png',
    status: [
      {
        name: '생명력',
        value: 18
      },
      {
        name: '체력',
        value: 8
      }
    ],
    index: 8,
    isCatering: true
  },
  {
    originName: 'Croffle',
    localName: '크로플',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Croissant(65%) Whipped Cream(25%) Blueberry(10%)',
    localRecipe: '크루아상(65%) 생크림(25%) 블루베리(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/4/40/Croffle.png',
    status: [
      {
        name: '생명력',
        value: 50
      },
      {
        name: '마나',
        value: 50
      },
      {
        name: '체력',
        value: 10
      }
    ],
    index: 9,
    isCatering: true
  },
  {
    originName: 'Cheeseburger',
    localName: '치즈버거',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Bread(50%) Cabbage(25%) Slice of Cheese(25%)',
    localRecipe: '빵(50%) 양배추(25%) 치즈 조각(25%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/11/Cheeseburger.png',
    status: [
      {
        name: '생명력',
        value: 50
      },
      {
        name: '마나',
        value: 50
      },
      {
        name: '스태미나',
        value: 60
      }
    ],
    index: 10,
    isCatering: true
  },
  {
    originName: 'Grilled Mackerel with Curry',
    localName: '고등어 카레 구이',
    originCookingType: 'Sous Vide',
    localCookingType: '수비드',
    originRecipe: 'Mackerel(81%) Curry Powder(12%) Wheat Flour(7%)',
    localRecipe: '고등어(81%) 카레가루(12%) 밀가루(7%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/c/ce/Grilled_Mackerel_with_Curry.png',
    status: [
      {
        name: '스태미나',
        value: 45
      },
      {
        name: '지력',
        value: 30
      },
      {
        name: '솜씨',
        value: 15
      }
    ],
    index: 11,
    isCatering: true
  },
  {
    originName: 'Cheese Tteok-bokki',
    localName: '치즈떡볶이',
    originCookingType: 'Stir-frying',
    localCookingType: '볶기',
    originRecipe: 'White Rice Cake(54%) Gochujang(28%) Slice of Cheese(18%)',
    localRecipe: '하얀 떡(54%) 고추장(28%) 치즈 조각(18%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/9a/Cheese_Tteok-bokki.png',
    status: [
      {
        name: '스태미나',
        value: 40
      },
      {
        name: '솜씨',
        value: 20
      }
    ],
    index: 12,
    isCatering: true
  },
  {
    originName: 'Bossam',
    localName: '돼지 보쌈',
    originCookingType: 'Sous Vide',
    localCookingType: '수비드',
    originRecipe: 'Large Meat(80%) Leek(12%) Cabbage(8%)',
    localRecipe: '커다란 고기덩어리(80%) 부추(12%) 양배추(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/d0/Bossam.png',
    status: [
      {
        name: '생명력',
        value: 35
      },
      {
        name: '마나',
        value: 15
      },
      {
        name: '방어',
        value: 1
      },
      {
        name: '마법방어',
        value: 2
      }
    ],
    index: 13,
    isCatering: true
  },
  {
    originName: 'Almond Pie',
    localName: '아몬드 파이',
    originCookingType: 'Pie Making',
    localCookingType: '파이 만들기',
    originRecipe: 'Pan Pie Crust(50%) Almond(45%) Egg(5%)',
    localRecipe: '파이 틀(50%) 아몬드(45%) 달걀(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/7f/Almond_Pie.png',
    status: [
      {
        name: '마나',
        value: 10
      },
      {
        name: '지력',
        value: 7
      }
    ],
    index: 14,
    isCatering: true
  },
  {
    originName: 'Cannele',
    localName: '까눌레',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Egg(55%) Milk(40%) Wax(5%)',
    localRecipe: '달걀(55%) 우유(40%) 밀랍(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f4/Cannele.png',
    status: [
      {
        name: '스태미나',
        value: 30
      },
      {
        name: '솜씨',
        value: 20
      }
    ],
    index: 15,
    isCatering: true
  },
  {
    originName: 'Curry-Roasted Black Sea Bream',
    localName: '감성돔 카레구이',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Black Sea Bream(78%) Curry Powder(15%) Salt(7%)',
    localRecipe: '감성돔(78%) 카레가루(15%) 소금(7%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/7e/Curry-Roasted_Black_Sea_Bream.png',
    status: [
      {
        name: '체력',
        value: 20
      },
      {
        name: '의지',
        value: 20
      }
    ],
    index: 16,
    isCatering: true
  },
  {
    originName: 'Curry Udon',
    localName: '카레우동',
    originCookingType: 'Noodle Making',
    localCookingType: '면 만들기',
    originRecipe: 'Noodle(60%) Curry Powder(5%) Water(35%)',
    localRecipe: '누들(60%) 카레가루(5%) 물이 든 병(35%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/d1/Curry_Udon.png',
    status: [
      {
        name: '생명력',
        value: 22
      },
      {
        name: '솜씨',
        value: 3
      }
    ],
    index: 17,
    isCatering: true
  },
  {
    originName: 'Chicken Soup',
    localName: '삼계탕',
    originCookingType: 'Simmering',
    localCookingType: '삶기',
    originRecipe: 'Chicken(50%) Water(40%) Rice(10%)',
    localRecipe: '닭고기(50%) 물이 든 병(40%) 쌀(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/4/40/Chicken_Soup.png',
    status: [
      {
        name: '체력',
        value: 28
      },
      {
        name: '솜씨',
        value: -15
      },
      {
        name: '행운',
        value: 15
      }
    ],
    index: 18,
    isCatering: true
  },
  {
    originName: 'Curry-Roasted Red Sea Bream',
    localName: '참돔 카레구이',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Red Sea Bream(78%) Curry Powder(15%) Salt(7%)',
    localRecipe: '참돔(78%) 카레가루(15%) 소금(7%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/4/4a/Curry-Roasted_Red_Sea_Bream.png',
    status: [
      {
        name: '솜씨',
        value: 20
      },
      {
        name: '행운',
        value: 20
      }
    ],
    index: 19,
    isCatering: true
  },
  {
    originName: 'Blueberry Whipped Cream Crepe',
    localName: '블루베리 생크림 크레이프',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Crepe(45%) Blueberry(30%) Whipped Cream(25%)',
    localRecipe: '크레이프(45%) 블루베리(30%) 생크림(25%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/7c/Blueberry_Whipped_Cream_Crepe.png',
    status: [
      {
        name: '마나',
        value: 20
      },
      {
        name: '스태미나',
        value: 35
      },
      {
        name: '솜씨',
        value: 30
      }
    ],
    index: 20,
    isCatering: true
  },
  {
    originName: 'Almond Strawberry Jam Tart',
    localName: '아몬드 딸기잼 타르트',
    originCookingType: 'Pie Making',
    localCookingType: '파이 만들기',
    originRecipe: 'Tart Crust(50%) Strawberry Jam(40%) Almond(10%)',
    localRecipe: '타르트 틀(50%) 딸기잼(40%) 아몬드(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/d4/Almond_Strawberry_Jam_Tart.png',
    status: [
      {
        name: '스태미나',
        value: 15
      },
      {
        name: '솜씨',
        value: 10
      }
    ],
    index: 21,
    isCatering: true
  },
  {
    originName: 'Grilled Corn',
    localName: '옥수수 구이',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Corn(95%) Butter(5%)',
    localRecipe: '옥수수(95%) 버터(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/12/Grilled_Corn.png',
    status: [
      {
        name: '생명력',
        value: 15
      }
    ],
    index: 22,
    isCatering: true
  },
  {
    originName: 'Abb Neagh Carp Stew',
    localName: '아브 네아 잉어 스튜',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Abb Neagh Carp(50%) Rice(30%) Water(20%)',
    localRecipe: '아브 네아 잉어(50%) 쌀(30%) 물이 든 병(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/7c/Abb_Neagh_Carp_Stew.png',
    status: [
      {
        name: '생명력',
        value: 25
      },
      {
        name: '체력',
        value: 10
      },
      {
        name: '의지',
        value: 5
      },
      {
        name: '행운',
        value: 20
      }
    ],
    index: 23,
    isCatering: true
  },
  {
    originName: 'Burrito',
    localName: '부리토',
    originCookingType: 'Julienning',
    localCookingType: '저미기',
    originRecipe: 'Handmade Sirloin Ham(60%) Mixed Vegetables(20%) Tortilla(20%)',
    localRecipe: '수제 등심 햄(60%) 야채 모둠(20%) 토르티야(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e0/Burrito.png',
    status: [
      {
        name: '스태미나',
        value: 50
      },
      {
        name: '체력',
        value: 25
      },
      {
        name: '방어',
        value: 4
      }
    ],
    index: 24,
    isCatering: true
  },
  {
    originName: 'Corn Tea',
    localName: '옥수수차',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Water(70%) Steamed Corn(30%)',
    localRecipe: '물이 든 병(70%) 찐 옥수수(30%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/86/Corn_Tea.png',
    status: [
      {
        name: '솜씨',
        value: -5
      },
      {
        name: '행운',
        value: 20
      }
    ],
    index: 25,
    isCatering: true
  },
  {
    originName: 'Broiled Brifne Carp',
    localName: '브리흐네 잉어 구이',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Brifne Carp(84%) Olive Oil(11%) Salt(5%)',
    localRecipe: '브리흐네 잉어(84%) 올리브유(11%) 소금(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/da/Broiled_Brifne_Carp.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '의지',
        value: 4
      }
    ],
    index: 26,
    isCatering: true
  },
  {
    originName: 'Beltfish Sashimi Noodles',
    localName: '갈치회 국수',
    originCookingType: 'Noodle Making',
    localCookingType: '면 만들기',
    originRecipe: 'Beltfish Sashimi(35%) Somen Noodles(55%) Cabbage(10%)',
    localRecipe: '갈치회(35%) 소면(55%) 양배추(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/26/Beltfish_Sashimi_Noodles.png',
    status: [
      {
        name: '생명력',
        value: 30
      },
      {
        name: '솜씨',
        value: 40
      },
      {
        name: '행운',
        value: 25
      }
    ],
    index: 27,
    isCatering: true
  },
  {
    originName: 'Grilled Silk-Striped Marlin',
    localName: '비단 청새치구이',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Silk-Striped Marlin(85%) Olive Oil(10%) Salt(5%)',
    localRecipe: '비단 청새치(85%) 올리브유(10%) 소금(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/6d/Grilled_Silk-Striped_Marlin.png',
    status: [
      {
        name: '생명력',
        value: 12
      },
      {
        name: '의지',
        value: 5
      }
    ],
    index: 28,
    isCatering: true
  },
  {
    originName: 'Espresso',
    localName: '에스프레소',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Roasted Coffee(20%) Water(80%)',
    localRecipe: '볶은 커피(20%) 물이 든 병(80%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/ad/Espresso.png',
    status: [
      {
        name: '솜씨',
        value: 5
      },
      {
        name: '의지',
        value: 15
      },
      {
        name: '행운',
        value: 15
      }
    ],
    index: 29,
    isCatering: true
  },
  {
    originName: 'Focaccia',
    localName: '포카치아',
    originCookingType: 'Pizza Making',
    localCookingType: '피자 만들기',
    originRecipe: 'Flour Dough(66%)Thyme(19%)Olive Oil(15%)',
    localRecipe: '밀가루 빵 반죽(66%)타임(19%)올리브유(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e9/Focaccia.png',
    status: [
      {
        name: '생명력',
        value: 55
      },
      {
        name: '행운',
        value: 30
      }
    ],
    index: 30,
    isCatering: true
  },
  {
    originName: 'Giant Star Candy',
    localName: '거대 별사탕',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Sugar(65%) Water(10%) Cooking Potion(25%)',
    localRecipe: '설탕(65%) 물이 든 병(10%) 쿠킹 포션(25%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/d0/Star_Candy.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '솜씨',
        value: 7
      },
      {
        name: '행운',
        value: 5
      }
    ],
    index: 31,
    isCatering: true
  },
  {
    originName: 'Butter Grilled Reef Lobster',
    localName: '버터구이 랍스터',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Reef Lobster(50%) Butter(37%) Garlic(13%)',
    localRecipe: '바닷가재(50%) 버터(37%) 마늘(13%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/67/Butter_Grilled_Reef_Lobster.png',
    status: [
      {
        name: '체력',
        value: -10
      },
      {
        name: '솜씨',
        value: 40
      }
    ],
    index: 32,
    isCatering: true
  },
  {
    originName: 'Assorted Sashimi Noodles',
    localName: '모둠회국수',
    originCookingType: 'Noodle Making',
    localCookingType: '면 만들기',
    originRecipe: 'Assorted Sashimi(48%) Somen Noodles(31%) Meat Broth(21%)',
    localRecipe: '모둠생선회(48%) 소면(31%) 육수(21%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/02/Assorted_Sashimi_Noodles.png',
    status: [
      {
        name: '체력',
        value: 55
      },
      {
        name: '지력',
        value: 35
      },
      {
        name: '방어',
        value: 8
      },
      {
        name: '보호',
        value: 1
      }
    ],
    index: 33,
    isCatering: true
  },
  {
    originName: 'Calzone',
    localName: '칼초네',
    originCookingType: 'Pizza Making',
    localCookingType: '피자 만들기',
    originRecipe: 'Red Sauce Pizza Dough(41%) Bacon(32%) Slice of Cheese(27%)',
    localRecipe: '토마토 소스 피자 도우(41%) 베이컨(32%) 치즈 조각(27%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/4/4b/Calzone.png',
    status: [
      {
        name: '생명력',
        value: 40
      },
      {
        name: '마나',
        value: 15
      },
      {
        name: '체력',
        value: 35
      }
    ],
    index: 34,
    isCatering: true
  },
  {
    originName: 'Chocolate Crepe Cake',
    localName: '초코 크레이프 케이크',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Crepe(47%) Baking Chocolate(27%) Whipped Cream(26%)',
    localRecipe: '크레이프(47%) 재료 초콜릿(27%) 생크림(26%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/33/Chocolate_Crepe_Cake.png',
    status: [
      {
        name: '마나',
        value: 30
      },
      {
        name: '스태미나',
        value: 20
      },
      {
        name: '의지',
        value: 30
      }
    ],
    index: 35,
    isCatering: true
  },
  {
    originName: 'Grilled Catfish',
    localName: '메기구이',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Catfish(80%) Cabbage(20%)',
    localRecipe: '메기(80%) 양배추(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/5/5b/Grilled_Catfish.png',
    status: [
      {
        name: '생명력',
        value: 26
      },
      {
        name: '체력',
        value: 10
      },
      {
        name: '행운',
        value: 20
      }
    ],
    index: 36,
    isCatering: true
  },
  {
    originName: 'Beltfish Sashimi',
    localName: '갈치회',
    originCookingType: 'Julienning',
    localCookingType: '저미기',
    originRecipe: 'Beltfish(92%) Chojang(8%)',
    localRecipe: '갈치(92%) 초장(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e5/Beltfish_Sashimi.png',
    status: [
      {
        name: '마나',
        value: 45
      },
      {
        name: '행운',
        value: 10
      },
      {
        name: '마법방어',
        value: 2
      }
    ],
    index: 37,
    isCatering: true
  },
  {
    originName: 'Fried Dumplings',
    localName: '군만두',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Wheat Flour(50%) Sliced Meat(35%) Leek(15%)',
    localRecipe: '밀가루(50%) 고기 조각(35%) 부추(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/9a/Fried_Dumplings.png',
    status: [
      {
        name: '지력',
        value: 8
      }
    ],
    index: 38,
    isCatering: true
  },
  {
    originName: 'Birthday Cake',
    localName: '생일 케이크',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Strawberry(5%) Whipped Cream(20%) Flour Dough(75%)',
    localRecipe: '딸기(5%) 생크림(20%) 밀가루 빵 반죽(75%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e3/Birthday_Cake.png',
    status: [
      {
        name: '행운',
        value: 10
      },
      {
        name: '최대대미지',
        value: 1
      },
      {
        name: '보호',
        value: 1
      }
    ],
    index: 39,
    isCatering: true
  },
  {
    originName: 'Egg Sandwich',
    localName: '계란 샌드위치',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Fried Egg(15%) Sliced Bread(85%)',
    localRecipe: '계란프라이(15%) 식빵(85%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/81/Egg_Sandwich.png',
    status: [
      {
        name: '의지',
        value: 4
      },
      {
        name: '행운',
        value: 2
      }
    ],
    index: 40,
    isCatering: true
  },
  {
    originName: 'Croissant',
    localName: '크루아상',
    originCookingType: 'Pie Making',
    localCookingType: '파이 만들기',
    originRecipe: 'Flour Dough(66%) Butter(12%) Milk(22%)',
    localRecipe: '밀가루 빵 반죽(66%) 버터(12%) 우유(22%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/a0/Croissant.png',
    status: [
      {
        name: '생명력',
        value: 25
      },
      {
        name: '체력',
        value: 15
      },
      {
        name: '방어',
        value: 3
      }
    ],
    index: 41,
    isCatering: true
  },
  {
    originName: 'Assorted Shellfish Sashimi',
    localName: '모듬 조개회',
    originCookingType: 'Julienning',
    localCookingType: '저미기',
    originRecipe: 'Scallop(45%) Fan Mussel(45%) Chojang(10%)',
    localRecipe: '가리비(45%) 키조개(45%) 초장(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/0a/Assorted_Shellfish_Sashimi.png',
    status: [
      {
        name: '최대대미지',
        value: 1
      },
      {
        name: '방어',
        value: 1
      },
      {
        name: '보호',
        value: 1
      }
    ],
    index: 42,
    isCatering: true
  },
  {
    originName: 'Festive Noodles',
    localName: '잔치국수',
    originCookingType: 'Noodle Making',
    localCookingType: '면 만들기',
    originRecipe: 'Somen Noodles(50%) Meat Broth(40%) Mixed Vegetables(10%)',
    localRecipe: '소면(50%) 육수(40%) 야채 모둠(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/7e/Festive_Noodles.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '솜씨',
        value: 2
      },
      {
        name: '의지',
        value: 8
      }
    ],
    index: 43,
    isCatering: true
  },
  {
    originName: 'Dragon T-Bone Steak',
    localName: '드래곤 티본 스테이크',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Dragon Flesh Lump(70%) Dragon Bone(30%)',
    localRecipe: '드래곤의 살덩어리(70%) 드래곤의 뼈(30%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/62/T-Bone_Steak.png',
    status: [
      {
        name: '생명력',
        value: 200
      },
      {
        name: '체력',
        value: 100
      }
    ],
    index: 44,
    isCatering: true
  },
  {
    originName: 'Celery Salad',
    localName: '셀러리 샐러드',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Celery(35%) Carrot(27%) Cabbage(38%)',
    localRecipe: '셀러리(35%) 당근(27%) 양배추(38%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/4/47/Celery_Salad.png',
    status: [
      {
        name: '스태미나',
        value: 12
      },
      {
        name: '지력',
        value: -15
      },
      {
        name: '의지',
        value: 7
      }
    ],
    index: 45,
    isCatering: true
  },
  {
    originName: 'Grilled Pineapple',
    localName: '구운 파인애플',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Pineapple(94%) Sugar(6%)',
    localRecipe: '파인애플(94%) 설탕(6%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f0/Grilled_Pineapple.png',
    status: [
      {
        name: '행운',
        value: 10
      }
    ],
    index: 46,
    isCatering: true
  },
  {
    originName: 'Assorted Sashimi',
    localName: '모둠생선회',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Salmon Sashimi(40%) Eel Sashimi(30%) Tuna Sashimi(30%)',
    localRecipe: '연어회(40%) 장어회(30%) 참치회(30%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/81/Assorted_Sashimi.png',
    status: [
      {
        name: '스태미나',
        value: 20
      },
      {
        name: '최대대미지',
        value: 1
      },
      {
        name: '마법공격력',
        value: 1
      },
      {
        name: '보호',
        value: 1
      }
    ],
    index: 47,
    isCatering: true
  },
  {
    originName: 'Egg and Mayo Toast',
    localName: '계란 마요 토스트',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Toast(66%) Egg(24%) Mayonnaise(10%)',
    localRecipe: '토스트(66%) 달걀(24%) 마요네즈(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f3/Egg_and_Mayo_Toast.png',
    status: [
      {
        name: '체력',
        value: 15
      },
      {
        name: '의지',
        value: 15
      },
      {
        name: '방어',
        value: 5
      }
    ],
    index: 48,
    isCatering: true
  },
  {
    originName: 'Fried Poulp',
    localName: '낙지 볶음',
    originCookingType: 'Stir-frying',
    localCookingType: '볶기',
    originRecipe: 'Poulp(75%) Cabbage(15%) Red Pepper Powder(10%)',
    localRecipe: '낙지(75%) 양배추(15%) 고춧가루(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/1d/Fried_Poulp.png',
    status: [
      {
        name: '마나',
        value: 15
      },
      {
        name: '방어',
        value: 1
      }
    ],
    index: 49,
    isCatering: true
  },
  {
    originName: 'Chocolate Cake',
    localName: '초코 케이크',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Wheat Flour(65%) Baking Chocolate(25%) Whipped Cream(10%)',
    localRecipe: '밀가루(65%) 재료 초콜릿(25%) 생크림(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/87/Chocolate_Cake.png',
    status: [
      {
        name: '생명력',
        value: 5
      },
      {
        name: '지력',
        value: -10
      },
      {
        name: '행운',
        value: 10
      }
    ],
    index: 50,
    isCatering: true
  },
  {
    originName: 'Blowfish Sashimi',
    localName: '복어회',
    originCookingType: 'Julienning',
    localCookingType: '저미기',
    originRecipe: 'Blowfish(82%) Antidote Potion(10%) Water(8%)',
    localRecipe: '복어(82%) 해독 포션(10%) 물이 든 병(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/08/Blowfish_Sashimi.png',
    status: [
      {
        name: '마나',
        value: 40
      },
      {
        name: '의지',
        value: 30
      },
      {
        name: '보호',
        value: 1
      }
    ],
    index: 51,
    isCatering: true
  },
  {
    originName: 'Fish and Chips',
    localName: '피쉬 앤 칩스',
    originCookingType: 'Deep-frying',
    localCookingType: '튀기기',
    originRecipe: 'Taitinn Carp(50%) Potato(41%) Fry Batter(9%)',
    localRecipe: '은붕어(50%) 감자(41%) 튀김옷(9%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/ea/Fish_and_Chips.png',
    status: [
      {
        name: '생명력',
        value: 18
      },
      {
        name: '솜씨',
        value: 5
      },
      {
        name: '의지',
        value: 5
      }
    ],
    index: 52,
    isCatering: true
  },
  {
    originName: 'Afternoon Tea Set',
    localName: '애프터눈 티 세트',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Black Tea Honey Scone(35%) Macaron(35%) Panna Cotta(35%)',
    localRecipe: '홍차 벌꿀 스콘(35%) 마카롱(35%) 판나코타(35%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/96/Afternoon_Tea_Set.png',
    status: [
      {
        name: '체력',
        value: -30
      },
      {
        name: '의지',
        value: -50
      },
      {
        name: '최대대미지',
        value: -3
      },
      {
        name: '마법보호',
        value: -2
      }
    ],
    index: 53,
    isCatering: true
  },
  {
    originName: 'Curry and Rice',
    localName: '카레 라이스',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Steamed Rice(52%) Curry Paste(36%) Butter(12%)',
    localRecipe: '밥(52%) 카레 페이스트(36%) 버터(12%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f6/Curry_and_Rice.png',
    status: [
      {
        name: '생명력',
        value: 20
      },
      {
        name: '체력',
        value: 5
      },
      {
        name: '행운',
        value: 5
      }
    ],
    index: 54,
    isCatering: true
  },
  {
    originName: 'Braised Catfish and Clams',
    localName: '메기 조개 찜',
    originCookingType: 'Steaming',
    localCookingType: '찌기',
    originRecipe: 'Catfish(50%) Shellfish(40%) Garlic(10%)',
    localRecipe: '메기(50%) 조개(40%) 마늘(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/b/b8/Braised_Catfish_and_Clams.png',
    status: [
      {
        name: '생명력',
        value: 33
      },
      {
        name: '의지',
        value: 35
      }
    ],
    index: 55,
    isCatering: true
  },
  {
    originName: 'Fried Onion',
    localName: '양파볶음',
    originCookingType: 'Stir-frying',
    localCookingType: '볶기',
    originRecipe: 'Onion(47%) Garlic(40%) Salt(13%) / Onion(55%) Garlic(45%)',
    localRecipe: '양파(47%) 마늘(40%) 소금(13%) / 양파(55%) 마늘(45%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e7/Fried_Onion.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '솜씨',
        value: 12
      }
    ],
    index: 56,
    isCatering: true
  },
  {
    originName: 'Dragon Blood Red Wine',
    localName: '드래곤 블러드 레드 와인',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Black Dragon Blood(94%) Dragon Flesh Lump(6%)',
    localRecipe: '블랙 드래곤의 피(94%) 드래곤의 살덩어리(6%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/05/E.O._Grand_Blago.png',
    status: [
      {
        name: '스태미나',
        value: 300
      },
      {
        name: '체력',
        value: 100
      },
      {
        name: '의지',
        value: 100
      },
      {
        name: '행운',
        value: 100
      }
    ],
    index: 57,
    isCatering: true
  },
  {
    originName: 'Halloween Hat Cookie',
    localName: '할로윈 모자 쿠키',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Wheat Flour(70%) Butter(25%) Hat Cookie Cutter(5%)',
    localRecipe: '밀가루(70%) 버터(25%) 모자 모양 틀(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/0f/Halloween_Hat_Cookie.png',
    status: [
      {
        name: '의지',
        value: 10
      }
    ],
    index: 58,
    isCatering: true
  },
  {
    originName: 'Cheese Fondue',
    localName: '치즈 퐁듀',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Slice of Cheese(45%) Potato(27%) Sliced Meat(28%)',
    localRecipe: '치즈 조각(45%) 감자(27%) 고기 조각(28%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/3a/Cheese_Fondue.png',
    status: [
      {
        name: '생명력',
        value: 28
      },
      {
        name: '지력',
        value: 8
      },
      {
        name: '솜씨',
        value: 5
      },
      {
        name: '의지',
        value: 5
      }
    ],
    index: 59,
    isCatering: true
  },
  {
    originName: 'Gochujang Pork Bulgogi',
    localName: '고추장 돼지불고기',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Sliced Meat(81%) Gochujang(11%) Onion(8%)',
    localRecipe: '고기 조각(81%) 고추장(11%) 양파(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/5/56/Gochujang_Pork_Bulgogi.png',
    status: [
      {
        name: '마나',
        value: 30
      },
      {
        name: '지력',
        value: 15
      },
      {
        name: '의지',
        value: 50
      }
    ],
    index: 60,
    isCatering: true
  },
  {
    originName: 'Bacon Burger',
    localName: '베이컨 버거',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Bread(50%) Bacon(25%) Cabbage(25%)',
    localRecipe: '빵(50%) 베이컨(25%) 양배추(25%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/8f/Bacon_Burger.png',
    status: [
      {
        name: '생명력',
        value: 50
      },
      {
        name: '마나',
        value: 50
      },
      {
        name: '스태미나',
        value: 60
      }
    ],
    index: 61,
    isCatering: true
  },
  {
    originName: 'Egg Caviar',
    localName: '에그 캐비어',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Fried Egg(45%) Sturgeon(30%) Slice of Cheese(25%)',
    localRecipe: '계란프라이(45%) 철갑상어(30%) 치즈 조각(25%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/ae/Egg_Caviar.png',
    status: [
      {
        name: '생명력',
        value: 17
      },
      {
        name: '체력',
        value: 10
      },
      {
        name: '의지',
        value: 11
      }
    ],
    index: 62,
    isCatering: true
  },
  {
    originName: 'Carbonara',
    localName: '까르보나라',
    originCookingType: 'Pasta Making',
    localCookingType: '파스타 만들기',
    originRecipe: 'Long Pasta(80%) Pasta Ingredients(17%) Whipped Cream(3%)',
    localRecipe: '롱 파스타(80%) 파스타 재료 모둠(17%) 생크림(3%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/15/Carbonara.png',
    status: [
      {
        name: '마나',
        value: -10
      },
      {
        name: '스태미나',
        value: 15
      }
    ],
    index: 63,
    isCatering: true
  },
  {
    originName: 'Fried Shrimp',
    localName: '새우튀김',
    originCookingType: 'Deep-frying',
    localCookingType: '튀기기',
    originRecipe: 'Shrimp(65%) Fry Batter(35%)',
    localRecipe: '새우(65%) 튀김옷(35%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/c/c6/Fried_Shrimp.png',
    status: [
      {
        name: '생명력',
        value: 11
      },
      {
        name: '의지',
        value: 14
      }
    ],
    index: 64,
    isCatering: true
  },
  {
    originName: 'Fried Egg',
    localName: '계란프라이',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Egg(90%) Salt(10%) OR Egg(82%) Salt(10%) Pepper(8%)',
    localRecipe: '달걀(90%) 소금(10%) OR 달걀(82%) 소금(10%) 후추(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/18/Fried_Egg.png',
    status: [
      {
        name: '생명력',
        value: 15
      }
    ],
    index: 65,
    isCatering: true
  },
  {
    originName: 'Cheese Bread',
    localName: '치즈 빵',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Bread(75%) Slice of Cheese(21%) Salt(4%) / Bread(79%) Slice of Cheese(21%)',
    localRecipe: '빵(75%) 치즈 조각(21%) 소금(4%) / 빵(79%) 치즈 조각(21%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/d6/Cheese_Bread.png',
    status: [
      {
        name: '생명력',
        value: 14
      }
    ],
    index: 66,
    isCatering: true
  },
  {
    originName: 'Grilled Salted Herring',
    localName: '청어 소금 구이',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Herring(88%) Salt(7%) Lemon Juice(5%)',
    localRecipe: '청어(88%) 소금(7%) 레몬즙(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/5/50/Grilled_Salted_Herring.png',
    status: [
      {
        name: '스태미나',
        value: 35
      },
      {
        name: '솜씨',
        value: 15
      }
    ],
    index: 67,
    isCatering: true
  },
  {
    originName: 'Fried Abb Neagh Carp',
    localName: '아브 네아 잉어 튀김',
    originCookingType: 'Deep-frying',
    localCookingType: '튀기기',
    originRecipe: 'Abb Neagh Carp(65%) Fry Batter(30%) Salt or Pepper(5%) / Abb Neagh Carp(69%) Fry Batter(31%)',
    localRecipe: '아브 네아 잉어(65%) 튀김옷(30%) 소금 또는 후추(5%) / 아브 네아 잉어(69%) 튀김옷(31%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/ec/Fried_Abb_Neagh_Carp.png',
    status: [
      {
        name: '생명력',
        value: 20
      },
      {
        name: '체력',
        value: 40
      },
      {
        name: '지력',
        value: -20
      },
      {
        name: '솜씨',
        value: -20
      },
      {
        name: '의지',
        value: 30
      }
    ],
    index: 68,
    isCatering: true
  },
  {
    originName: 'Crepe Cake',
    localName: '크레이프 케이크',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Crepe(74%) Whipped Cream(19%) Fresh Honey(7%)',
    localRecipe: '크레이프(74%) 생크림(19%) 신선한 벌꿀(7%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/fd/Crepe_Cake.png',
    status: [
      {
        name: '생명력',
        value: 30
      },
      {
        name: '마나',
        value: 20
      },
      {
        name: '체력',
        value: 30
      }
    ],
    index: 69,
    isCatering: true
  },
  {
    originName: 'Grilled White Dragon Heart',
    localName: '하얗게 구워진 드래곤 심장',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'White Dragon Heart(75%) White Dragon Blood(7%) Dragon Flesh Lump(18%)',
    localRecipe: '화이트 드래곤 심장(75%) 화이트 드래곤의 피(7%) 드래곤의 살덩어리(18%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/09/Grilled_Black_Dragon_Heart.png',
    status: [
      {
        name: '체력',
        value: 150
      },
      {
        name: '지력',
        value: 150
      },
      {
        name: '솜씨',
        value: 150
      },
      {
        name: '의지',
        value: 150
      },
      {
        name: '행운',
        value: 150
      }
    ],
    index: 70,
    isCatering: true
  },
  {
    originName: 'Braised Spicy Chicken',
    localName: '닭볶음탕',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Chicken(60%) Potato(22%) Gochujang(18%)',
    localRecipe: '닭고기(60%) 감자(22%) 고추장(18%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/fd/Braised_Spicy_Chicken.png',
    status: [
      {
        name: '스태미나',
        value: 20
      },
      {
        name: '의지',
        value: 15
      },
      {
        name: '행운',
        value: 20
      }
    ],
    index: 71,
    isCatering: true
  },
  {
    originName: 'Grilled Scallop with Cheese',
    localName: '가리비 치즈구이',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Scallop(70%) Slice of Cheese(20%) Bell Pepper(10%)',
    localRecipe: '가리비(70%) 치즈 조각(20%) 파프리카(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/a3/Grilled_Scallop_with_Cheese.png',
    status: [
      {
        name: '지력',
        value: 15
      },
      {
        name: '행운',
        value: 10
      },
      {
        name: '최소대미지',
        value: 1
      }
    ],
    index: 72,
    isCatering: true
  },
  {
    originName: 'Fried Vegetables',
    localName: '야채볶음',
    originCookingType: 'Stir-frying',
    localCookingType: '볶기',
    originRecipe: 'Cabbage(45%) Carrot(30%) Onion(25%)',
    localRecipe: '양배추(45%) 당근(30%) 양파(25%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/c/c0/Fried_Vegetables.png',
    status: [
      {
        name: '생명력',
        value: 6
      },
      {
        name: '지력',
        value: 10
      },
      {
        name: '솜씨',
        value: 10
      }
    ],
    index: 73,
    isCatering: true
  },
  {
    originName: 'Beltfish Stew',
    localName: '갈치스튜',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Beltfish(47%) Potato(30%) Garlic(23%)',
    localRecipe: '갈치(47%) 감자(30%) 마늘(23%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/29/Beltfish_Stew.png',
    status: [
      {
        name: '지력',
        value: 40
      },
      {
        name: '행운',
        value: -10
      }
    ],
    index: 74,
    isCatering: true
  },
  {
    originName: 'Eel Sashimi',
    localName: '장어회',
    originCookingType: 'Julienning',
    localCookingType: '저미기',
    originRecipe: 'Belvast Eel(88%) Chojang(12%)',
    localRecipe: '벨바스트 장어(88%) 초장(12%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/b/b8/Eel_Sashimi.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '스태미나',
        value: 55
      },
      {
        name: '솜씨',
        value: 10
      }
    ],
    index: 75,
    isCatering: true
  },
  {
    originName: 'Black Tea',
    localName: '홍차',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Tea Leaves(25%) Bottled Water(75%)',
    localRecipe: '찻잎(25%) 물이 든 병(75%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/b/b5/Black_Tea.png',
    status: [
      {
        name: '생명력',
        value: -30
      },
      {
        name: '행운',
        value: -25
      }
    ],
    index: 76,
    isCatering: true
  },
  {
    originName: 'Grilled Shellfish',
    localName: '조개구이',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Shellfish(90%) Salt or Pepper(10%) / Shellfish(100%)',
    localRecipe: '조개(90%) 소금 또는 후추(10%) / 조개(100%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/4/4f/Grilled_Shellfish.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '의지',
        value: 5
      }
    ],
    index: 77,
    isCatering: true
  },
  {
    originName: 'Croque Monsieur',
    localName: '크로크 무슈',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Sliced Bread(45%) Sliced Meat(28%) Slice of Cheese(27%)',
    localRecipe: '식빵(45%) 고기 조각(28%) 치즈 조각(27%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/c/c6/Croque_Monsieur.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '지력',
        value: 5
      }
    ],
    index: 78,
    isCatering: true
  },
  {
    originName: 'Apple Souffle',
    localName: '사과 수플레',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Flour Dough(60%) Egg(30%) Apple(10%)',
    localRecipe: '밀가루 빵 반죽(60%) 달걀(30%) 사과(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/3c/Apple_Souffle.png',
    status: [
      {
        name: '마나',
        value: 20
      },
      {
        name: '지력',
        value: 20
      },
      {
        name: '솜씨',
        value: 30
      }
    ],
    index: 79,
    isCatering: true
  },
  {
    originName: 'Blueberry Yogurt',
    localName: '블루베리 요거트',
    originCookingType: 'Fermenting',
    localCookingType: '발효',
    originRecipe: 'Milk(77%) Blueberry Jam(23%)',
    localRecipe: '우유(77%) 블루베리잼(23%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/14/Blueberry_Yogurt.png',
    status: [
      {
        name: '마나',
        value: 65
      },
      {
        name: '솜씨',
        value: 25
      },
      {
        name: '방어',
        value: 2
      }
    ],
    index: 80,
    isCatering: true
  },
  {
    originName: 'Chicken Chow Mein',
    localName: '닭고기 볶음면',
    originCookingType: 'Noodle Making',
    localCookingType: '면 만들기',
    originRecipe: 'Noodle(65%) Chicken(27%) Bell Pepper(8%)',
    localRecipe: '누들(65%) 닭고기(27%) 파프리카(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/12/Chicken_Chow_Mein.png',
    status: [
      {
        name: '스태미나',
        value: -12
      },
      {
        name: '체력',
        value: 20
      },
      {
        name: '의지',
        value: 10
      }
    ],
    index: 81,
    isCatering: true
  },
  {
    originName: 'Chicken Breast Salad',
    localName: '닭가슴살 샐러드',
    originCookingType: 'Sous Vide',
    localCookingType: '수비드',
    originRecipe: 'Chicken(65%) Celery Salad(29%) Wine Vinegar(6%)',
    localRecipe: '치킨(65%) 셀러리 샐러드(29%) 와인 식초(6%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/6d/Chicken_Breast_Salad.png',
    status: [
      {
        name: '마나',
        value: 50
      },
      {
        name: '지력',
        value: 25
      },
      {
        name: '마법보호',
        value: 1
      }
    ],
    index: 82,
    isCatering: true
  },
  {
    originName: 'Fragrant Mushroom Pizza',
    localName: '향긋한 버섯 피자',
    originCookingType: 'Pizza Making',
    localCookingType: '피자 만들기',
    originRecipe: 'Red Sauce Pizza Dough(44%) Hazelnut Mushroom(39%) Slice of Cheese(17%)',
    localRecipe: '토마토 소스 피자 도우(44%) 개암버섯(39%) 치즈 조각(17%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e6/Fragrant_Mushroom_Pizza.png',
    status: [
      {
        name: '행운',
        value: 30
      },
      {
        name: '마법방어',
        value: 3
      }
    ],
    index: 83,
    isCatering: true
  },
  {
    originName: 'Bacon and Potato Dog Food',
    localName: '베이컨과 감자 개밥',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Potato(60%) Bacon(40%)',
    localRecipe: '감자(60%) 베이컨(40%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/0a/Bacon_and_Potato_Dog_Food.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '체력',
        value: 6
      },
      {
        name: '솜씨',
        value: -6
      }
    ],
    index: 84,
    isCatering: true
  },
  {
    originName: 'Full Kraken Meal',
    localName: '크라켄 한상 차림',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Spicy Kraken Stew(50%) Kraken Stirfry(50%)',
    localRecipe: '크라켄 매운탕(50%) 크라켄 볶음 모둠(50%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/19/Full_Kraken_Meal.png',
    status: [
      {
        name: '생명력',
        value: 300
      },
      {
        name: '마나',
        value: 300
      },
      {
        name: '스태미나',
        value: 300
      },
      {
        name: '체력',
        value: 70
      },
      {
        name: '지력',
        value: 70
      },
      {
        name: '솜씨',
        value: 70
      },
      {
        name: '의지',
        value: 70
      },
      {
        name: '행운',
        value: 70
      },
      {
        name: '방어',
        value: 30
      },
      {
        name: '보호',
        value: 5
      },
      {
        name: '마법방어',
        value: 30
      },
      {
        name: '마법보호',
        value: 5
      }
    ],
    index: 85,
    isCatering: false
  },
  {
    originName: 'Fried Smelt',
    localName: '빙어튀김',
    originCookingType: 'Deep-frying',
    localCookingType: '튀기기',
    originRecipe: 'Smelt(70%) Fry Batter(25%) Salt(5%)',
    localRecipe: '빙어(70%) 튀김옷(25%) 소금(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/d8/Fried_Smelt.png',
    status: [
      {
        name: '생명력',
        value: 30
      },
      {
        name: '체력',
        value: 15
      }
    ],
    index: 86,
    isCatering: true
  },
  {
    originName: 'Green Plum Tea',
    localName: '매실차',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Bottled Water(86%) Green Plum Syrup(14%)',
    localRecipe: '물이 든 병(86%) 매실청(14%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/d5/Green_Plum_Tea.png',
    status: [
      {
        name: '생명력',
        value: 35
      },
      {
        name: '지력',
        value: 35
      }
    ],
    index: 87,
    isCatering: true
  },
  {
    originName: 'Chicken Burger',
    localName: '치킨 버거',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Bread(50%) Chicken(25%) Cabbage(25%)',
    localRecipe: '빵(50%) 닭고기(25%) 양배추(25%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/5/5f/Chicken_Burger.png',
    status: [
      {
        name: '생명력',
        value: 50
      },
      {
        name: '마나',
        value: 50
      },
      {
        name: '스태미나',
        value: 60
      }
    ],
    index: 88,
    isCatering: true
  },
  {
    originName: 'Corn Chip',
    localName: '콘칩',
    originCookingType: 'Deep-frying',
    localCookingType: '튀기기',
    originRecipe: 'Cornbread Dough(80%) Salt(20%)',
    localRecipe: '옥수수 빵 반죽(80%) 소금(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/ac/Corn_Chip.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '체력',
        value: 8
      },
      {
        name: '지력',
        value: 8
      },
      {
        name: '솜씨',
        value: 12
      },
      {
        name: '의지',
        value: 12
      }
    ],
    index: 89,
    isCatering: true
  },
  {
    originName: 'Corn Scone',
    localName: '옥수수 스콘',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Flour Dough(60%) Corn(31%) Whipped Cream(9%)',
    localRecipe: '밀가루 빵 반죽(60%) 옥수수(31%) 생크림(9%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/62/Corn_Scone.png',
    status: [
      {
        name: '생명력',
        value: 30
      },
      {
        name: '체력',
        value: 15
      },
      {
        name: '지력',
        value: 8
      },
      {
        name: '솜씨',
        value: 15
      },
      {
        name: '의지',
        value: 10
      }
    ],
    index: 90,
    isCatering: true
  },
  {
    originName: 'Courcle Pizza',
    localName: '쿠르클레 피자',
    originCookingType: 'Pizza Making',
    localCookingType: '피자 만들기',
    originRecipe: 'Red Sauce Pizza Dough(37%) Pineapple(26%) Handmade Sirloin Ham(37%)',
    localRecipe: '토마토 소스 피자 도우(37%) 파인애플(26%) 수제 등심 햄(37%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/94/Courcle_Pizza.png',
    status: [
      {
        name: '생명력',
        value: 20
      },
      {
        name: '체력',
        value: 40
      },
      {
        name: '행운',
        value: 10
      },
      {
        name: '방어',
        value: 5
      }
    ],
    index: 91,
    isCatering: true
  },
  {
    originName: 'Egg Tart',
    localName: '에그 타르트',
    originCookingType: 'Pie Making',
    localCookingType: '파이 만들기',
    originRecipe: 'Tart Crust(40%) Egg(30%) Water(30%)',
    localRecipe: '타르트 틀(40%) 달걀(30%) 물이 든 병(30%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/8e/Egg_Tart.png',
    status: [
      {
        name: '생명력',
        value: 30
      }
    ],
    index: 92,
    isCatering: true
  },
  {
    originName: 'Fried Eggplants',
    localName: '가지 볶음',
    originCookingType: 'Stir-frying',
    localCookingType: '볶기',
    originRecipe: 'Eggplant(80%) Onion(10%) Salt(10%)',
    localRecipe: '가지(80%) 양파(10%) 소금(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/c/c1/Fried_Eggplants.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '방어',
        value: 1
      }
    ],
    index: 93,
    isCatering: true
  },
  {
    originName: 'Barley Tea',
    localName: '보리차',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Water(70%) Barley Flour(30%)',
    localRecipe: '물이 든 병(70%) 보릿가루(30%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/4/4f/Barley_Tea.png',
    status: [
      {
        name: '솜씨',
        value: 3
      },
      {
        name: '행운',
        value: 12
      }
    ],
    index: 94,
    isCatering: true
  },
  {
    originName: 'Garlic Bread',
    localName: '마늘 빵',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Bread(84%) Garlic(16%)',
    localRecipe: '빵(84%) 마늘(16%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/7f/Garlic_Bread.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '체력',
        value: 3
      }
    ],
    index: 95,
    isCatering: true
  },
  {
    originName: 'Gochujang Jjigae',
    localName: '고추장 찌개',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Gochujang(28%) Potato(27%) Meat Broth(45%)',
    localRecipe: '고추장(28%) 감자(27%) 육수(45%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/0b/Gochujang_Jjigae.png',
    status: [
      {
        name: '생명력',
        value: 40
      },
      {
        name: '체력',
        value: 35
      },
      {
        name: '방어',
        value: 1
      }
    ],
    index: 96,
    isCatering: true
  },
  {
    originName: 'Ebi Sushi',
    localName: '새우 초밥',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Shrimp Sashimi(50%) Steamed Rice(40%) Vinegar(10%)',
    localRecipe: '새우회(50%) 밥(40%) 식초(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/87/Ebi_Sushi.png',
    status: [
      {
        name: '생명력',
        value: 45
      },
      {
        name: '스태미나',
        value: 50
      },
      {
        name: '최소대미지',
        value: 1
      }
    ],
    index: 97,
    isCatering: true
  },
  {
    originName: 'Butter Biscuit',
    localName: '버터 비스킷',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Wheat Flour(46%) Butter(27%) Sugar(27%)',
    localRecipe: '밀가루(46%) 버터(27%) 설탕(27%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/69/Butter_Biscuit.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '지력',
        value: 5
      },
      {
        name: '솜씨',
        value: 3
      }
    ],
    index: 98,
    isCatering: true
  },
  {
    originName: 'Gelatinous Custard Pudding',
    localName: '탱글탱글 커스터드 푸딩',
    originCookingType: 'Sous Vide',
    localCookingType: '수비드',
    originRecipe: 'Egg(68%) Milk(20%) Whipped Cream(12%)',
    localRecipe: '달걀(68%) 우유(20%) 생크림(12%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/2a/Gelatinous_Custard_Pudding.png',
    status: [
      {
        name: '마나',
        value: 10
      },
      {
        name: '스태미나',
        value: 30
      },
      {
        name: '지력',
        value: 20
      },
      {
        name: '솜씨',
        value: 30
      }
    ],
    index: 99,
    isCatering: true
  },
  {
    originName: 'Chocolate Pizza',
    localName: '초콜릿 피자',
    originCookingType: 'Pizza Making',
    localCookingType: '피자 만들기',
    originRecipe: 'Plain Pizza Dough(40%)Baking Chocolate(41%)Marshmallow(19%)',
    localRecipe: '담백한 피자 도우(40%) 재료 초콜릿(41%) 마시멜로(19%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/5/55/Chocolate_Pizza.png',
    status: [
      {
        name: '생명력',
        value: 50
      },
      {
        name: '체력',
        value: 15
      },
      {
        name: '최소대미지',
        value: 1
      }
    ],
    index: 100,
    isCatering: true
  },
  {
    originName: 'Glazed Sweet Potatoes',
    localName: '고구마 맛탕',
    originCookingType: 'Deep-frying',
    localCookingType: '튀기기',
    originRecipe: 'Sweet Potato(85%) Sugar(15%)',
    localRecipe: '고구마(85%) 설탕(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f4/Glazed_Sweet_Potatoes.png',
    status: [
      {
        name: '생명력',
        value: 11
      },
      {
        name: '의지',
        value: 5
      }
    ],
    index: 101,
    isCatering: true
  },
  {
    originName: 'Dragon Blood White Wine',
    localName: '드래곤 블러드 화이트 와인',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'White Dragon Blood(94%) Dragon Flesh Lump(6%)',
    localRecipe: '화이트 드래곤의 피(94%) 드래곤의 살덩어리(6%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/a2/Dragon_Blood_White_Wine.png',
    status: [
      {
        name: '마나',
        value: 300
      },
      {
        name: '지력',
        value: 100
      },
      {
        name: '솜씨',
        value: 100
      },
      {
        name: '행운',
        value: 100
      }
    ],
    index: 102,
    isCatering: true
  },
  {
    originName: 'Black Tea Honey Scone',
    localName: '홍차 벌꿀 스콘',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Flour Dough(53%) Black Tea(32%) Fresh Honey(15%)',
    localRecipe: '밀가루 빵 반죽(53%) 홍차(32%) 신선한 벌꿀(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/ae/Black_Tea_Honey_Scone.png',
    status: [
      {
        name: '생명력',
        value: 50
      },
      {
        name: '마나',
        value: 50
      },
      {
        name: '보호',
        value: 1
      }
    ],
    index: 103,
    isCatering: true
  },
  {
    originName: 'Camellia Sling',
    localName: '카멜리아 슬링',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Vales Whiskey(60%) Camellia Seed(30%) Water(10%)',
    localRecipe: '발레스 위스키(60%) 동백 열매(30%) 물이 든 병(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/d2/Camellia_Sling.png',
    status: [
      {
        name: '생명력',
        value: 17
      },
      {
        name: '체력',
        value: 9
      },
      {
        name: '지력',
        value: -2
      },
      {
        name: '솜씨',
        value: -2
      },
      {
        name: '행운',
        value: 9
      }
    ],
    index: 104,
    isCatering: true
  },
  {
    originName: 'Chocolate Souffle',
    localName: '초콜릿 수플레',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Wheat Flour(45%) Baking Chocolate(50%) Milk(5%)',
    localRecipe: '밀가루(45%) 재료 초콜릿(50%) 우유(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e2/Chocolate_Souffle.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '체력',
        value: -5
      }
    ],
    index: 105,
    isCatering: true
  },
  {
    originName: 'Bacon Wrapped Tuna',
    localName: '참치 베이컨 말이',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Bluefin Tuna(60%) Bacon(36%) Pepper(4%)',
    localRecipe: '참다랑어(60%) 베이컨(36%) 후추(4%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/2d/Roasted_Bacon.png',
    status: [
      {
        name: '생명력',
        value: 20
      },
      {
        name: '체력',
        value: 20
      },
      {
        name: '의지',
        value: 5
      }
    ],
    index: 106,
    isCatering: true
  },
  {
    originName: 'Club Sandwich',
    localName: '클럽 샌드위치',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Sliced Bread(50%) Tomato(20%) Cabbage(30%)',
    localRecipe: '식빵(50%) 토마토(20%) 양배추(30%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/11/Club_Sandwich.png',
    status: [
      {
        name: '솜씨',
        value: 35
      }
    ],
    index: 107,
    isCatering: true
  },
  {
    originName: 'Chicken Breast Yurinki',
    localName: '닭가슴살 유린기',
    originCookingType: 'Sous Vide',
    localCookingType: '수비드',
    originRecipe: 'Chicken(77%) Spicy Pepper(8%) Cabbage(15%)',
    localRecipe: '닭고기(77%) 매운 고추(8%) 양배추(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/c/c8/Chicken_Breast_Yurinki.png',
    status: [
      {
        name: '행운',
        value: 20
      },
      {
        name: '방어',
        value: 3
      }
    ],
    index: 108,
    isCatering: true
  },
  {
    originName: 'Cookies and Cream Cake',
    localName: '쿠키 케이크',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Chocolate Chip Cookie(5%) Whipped Cream(20%) Flour Dough(75%)',
    localRecipe: '초코칩 쿠키(5%) 생크림(20%) 밀가루 빵 반죽(75%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e8/Cookies_and_Cream_Cake.png',
    status: [
      {
        name: '행운',
        value: 10
      },
      {
        name: '최대대미지',
        value: 1
      },
      {
        name: '보호',
        value: 1
      }
    ],
    index: 109,
    isCatering: true
  },
  {
    originName: 'Grilled Black Dragon Heart',
    localName: '까맣게 구워진 드래곤의 심장',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Black Dragon Heart(75%) Black Dragon Blood(7%) Dragon Flesh Lump(18%)',
    localRecipe: '블랙 드래곤의 심장(75%) 블랙 드래곤의 피(7%) 드래곤의 살덩어리(18%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/09/Grilled_Black_Dragon_Heart.png',
    status: [
      {
        name: '생명력',
        value: 300
      },
      {
        name: '마나',
        value: 300
      },
      {
        name: '스태미나',
        value: 300
      }
    ],
    index: 110,
    isCatering: true
  },
  {
    originName: 'Beef Steak',
    localName: '소고기 스테이크',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Beef(65%) Garlic(26%) Salt or Pepper(9%)',
    localRecipe: '쇠고기(65%) 마늘(26%) 소금 또는 후추(9%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/71/Beef_Steak.png',
    status: [
      {
        name: '생명력',
        value: 40
      },
      {
        name: '체력',
        value: 15
      },
      {
        name: '의지',
        value: 10
      }
    ],
    index: 111,
    isCatering: true
  },
  {
    originName: 'Caviar Canape',
    localName: '캐비어 카나페',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Sturgeon(40%) Bread(55%) Berry(5%)',
    localRecipe: '철갑상어(40%) 빵(55%) 나무열매(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e1/Caviar_Canape.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '솜씨',
        value: 4
      },
      {
        name: '행운',
        value: 20
      }
    ],
    index: 112,
    isCatering: true
  },
  {
    originName: 'Churrasco',
    localName: '슈하스코',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Handmade Sirloin Ham(44%) Chicken(26%) Sausage(30%)',
    localRecipe: '수제 등심 햄(44%) 닭고기(26%) 소시지(30%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/da/Churrasco.png',
    status: [
      {
        name: '생명력',
        value: 50
      },
      {
        name: '방어',
        value: 4
      }
    ],
    index: 113,
    isCatering: true
  },
  {
    originName: 'Bouillabaisse',
    localName: '부야 베스',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Taitinn Carp(36%) Shrimp(32%) Emain Macha Wine(32%)',
    localRecipe: '은붕어(36%) 새우(32%) 이멘 마하산 와인(32%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/9d/Bouillabaisse.png',
    status: [
      {
        name: '생명력',
        value: 32
      },
      {
        name: '체력',
        value: 10
      },
      {
        name: '솜씨',
        value: 5
      },
      {
        name: '의지',
        value: 5
      }
    ],
    index: 114,
    isCatering: true
  },
  {
    originName: 'Hakarl',
    localName: '하우카르틀',
    originCookingType: 'Fermenting',
    localCookingType: '발효',
    originRecipe: 'Carnivorous Fish(95%) Pepper(5%)',
    localRecipe: '민물 거대 육식 어류(95%) 후추(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/8c/Hakarl.png',
    status: [
      {
        name: '스태미나',
        value: 10
      },
      {
        name: '의지',
        value: 100
      }
    ],
    index: 115,
    isCatering: true
  },
  {
    originName: 'Flying Fish Crepe',
    localName: '날치 크레이프',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Flying Fish(40%) Potato(40%) Egg(20%)',
    localRecipe: '날치(40%) 감자(40%) 달걀(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/08/Flying_Fish_Crepe.png',
    status: [
      {
        name: '마나',
        value: 16
      },
      {
        name: '지력',
        value: 5
      }
    ],
    index: 116,
    isCatering: true
  },
  {
    originName: 'Fried Chicken Wing',
    localName: '닭날개튀김',
    originCookingType: 'Deep-frying',
    localCookingType: '튀기기',
    originRecipe: 'Chicken Wings(72%) Fry Batter(24%) Salt(4%) / Chicken Wings(76%) Fry Batter(24%)',
    localRecipe: '닭날개(72%) 튀김옷(24%) 소금(4%) / 닭날개(76%) 튀김옷(24%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/82/Fried_Chicken_Wing.png',
    status: [
      {
        name: '생명력',
        value: 14
      },
      {
        name: '행운',
        value: 14
      }
    ],
    index: 117,
    isCatering: true
  },
  {
    originName: 'Barley Bread',
    localName: '보리빵',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Barley Flour(55%) Water(37%) Yeast(8%)',
    localRecipe: '보릿가루(55%) 물이 든 병(37%) 이스트(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/70/Barley_Bread.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '지력',
        value: 9
      }
    ],
    index: 118,
    isCatering: true
  },
  {
    originName: 'Chocolate',
    localName: '초콜릿',
    originCookingType: 'Jam Making',
    localCookingType: '잼 만들기',
    originRecipe: 'Baking Chocolate(42%) Whipped Cream(41%) Sugar(17%)',
    localRecipe: '재료 초콜릿(42%) 생크림(41%) 설탕(17%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/df/Chocolate.png',
    status: [
      {
        name: '생명력',
        value: 12
      },
      {
        name: '체력',
        value: 4
      },
      {
        name: '지력',
        value: 4
      }
    ],
    index: 119,
    isCatering: true
  },
  {
    originName: 'Gorgonzola',
    localName: '고르곤졸라',
    originCookingType: 'Pizza Making',
    localCookingType: '피자 만들기',
    originRecipe: 'Plain Pizza Dough(41%) Block of Cheese(41%) Garlic(18%)',
    localRecipe: '담백한 피자 도우(41%) 커다란 치즈덩어리(41%) 마늘(18%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/2c/Gorgonzola.png',
    status: [
      {
        name: '마나',
        value: 60
      },
      {
        name: '지력',
        value: 10
      },
      {
        name: '마법방어',
        value: 3
      }
    ],
    index: 120,
    isCatering: true
  },
  {
    originName: 'Gyeran-mari',
    localName: '계란말이',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Egg(80%) Butter(12%) Sugar(8%)',
    localRecipe: '달걀(80%) 버터(12%) 설탕(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/81/Gyeran-mari.png',
    status: [
      {
        name: '체력',
        value: 10
      },
      {
        name: '의지',
        value: 25
      }
    ],
    index: 121,
    isCatering: true
  },
  {
    originName: 'Chocolate Chip Cookie',
    localName: '초코칩 쿠키',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Wheat Flour(46%) Baking Chocolate(27%) Butter(27%)',
    localRecipe: '밀가루(46%) 재료 초콜릿(27%) 버터(27%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f0/Chocolate_Chip_Cookie.png',
    status: [
      {
        name: '생명력',
        value: 12
      },
      {
        name: '체력',
        value: 5
      },
      {
        name: '솜씨',
        value: 2
      }
    ],
    index: 122,
    isCatering: true
  },
  {
    originName: 'French Fries',
    localName: '감자튀김',
    originCookingType: 'Deep-frying',
    localCookingType: '튀기기',
    originRecipe: 'Potato(80%) Fry Batter(20%) / Potato(74%) Fry Batter(18%) Salt(8%)',
    localRecipe: '감자(80%) 튀김옷(20%) / 감자(74%) 튀김옷(18%) 소금(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/8e/French_Fries.png',
    status: [
      {
        name: '생명력',
        value: 18
      },
      {
        name: '체력',
        value: 7
      }
    ],
    index: 123,
    isCatering: true
  },
  {
    originName: 'Grilled Eel',
    localName: '장어구이',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Lamprey(90%) Salt(10%)',
    localRecipe: '칠성장어(90%) 소금(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/6a/Grilled_Eel.png',
    status: [
      {
        name: '생명력',
        value: 20
      },
      {
        name: '체력',
        value: 30
      },
      {
        name: '행운',
        value: -5
      }
    ],
    index: 124,
    isCatering: true
  },
  {
    originName: 'Fried Chicken',
    localName: '프라이드 치킨',
    originCookingType: 'Deep-frying',
    localCookingType: '튀기기',
    originRecipe: 'Chicken(71%) Deep Fry Batter(16%) Olive Oil(13%)',
    localRecipe: '닭고기(71%) 튀김가루(16%) 올리브유(13%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/7f/Fried_Chicken.png',
    status: [
      {
        name: '지력',
        value: 25
      },
      {
        name: '행운',
        value: 15
      },
      {
        name: '방어',
        value: 2
      }
    ],
    index: 125,
    isCatering: true
  },
  {
    originName: 'Brifne Rocks',
    localName: '브리흐네 락스',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Ice(57%) Brifne Whiskey(40%) Lemon(3%)',
    localRecipe: '얼음(57%) 브리흐네 위스키(40%) 레몬(3%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/90/Brifne_Rocks.png',
    status: [
      {
        name: '생명력',
        value: 45
      },
      {
        name: '체력',
        value: 25
      },
      {
        name: '지력',
        value: -10
      },
      {
        name: '솜씨',
        value: -10
      },
      {
        name: '행운',
        value: 15
      }
    ],
    index: 126,
    isCatering: true
  },
  {
    originName: 'Egg Porridge',
    localName: '계란죽',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Egg(10%) Water(50%) Steamed Rice(40%)',
    localRecipe: '달걀(10%) 물이 든 병(50%) 밥(40%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/3e/Egg_Porridge.png',
    status: [
      {
        name: '의지',
        value: 4
      },
      {
        name: '행운',
        value: 2
      }
    ],
    index: 127,
    isCatering: true
  },
  {
    originName: 'Green Plum Syrup',
    localName: '매실청',
    originCookingType: 'Jam Making',
    localCookingType: '잼 만들기',
    originRecipe: 'Green Plum(59%) Sugar(41%)',
    localRecipe: '매실(59%) 설탕(41%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/5/5d/Green_Plum_Syrup.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '체력',
        value: 10
      }
    ],
    index: 128,
    isCatering: true
  },
  {
    originName: 'Dog Biscuit',
    localName: '개 과자',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Butter Biscuit(40%) Chocolate Chip Cookie(60%)',
    localRecipe: '버터 비스킷(40%) 초코칩 쿠키(60%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/60/Dog_Biscuit.png',
    status: [
      {
        name: '생명력',
        value: 8
      },
      {
        name: '체력',
        value: 2
      },
      {
        name: '솜씨',
        value: 2
      }
    ],
    index: 129,
    isCatering: true
  },
  {
    originName: 'BnR',
    localName: 'BnR',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Leighean Gin(36%) Brifne Whiskey(37%) Ice(27%)',
    localRecipe: '라인산 진(36%) 브리흐네 위스키(37%) 얼음(27%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/2d/BnR.png',
    status: [
      {
        name: '생명력',
        value: 50
      },
      {
        name: '체력',
        value: 30
      },
      {
        name: '지력',
        value: -12
      },
      {
        name: '솜씨',
        value: -12
      },
      {
        name: '행운',
        value: 20
      }
    ],
    index: 130,
    isCatering: true
  },
  {
    originName: 'Fish Soup',
    localName: '복지리',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Blowfish(38%) Water(52%) Garlic(10%)',
    localRecipe: '복어(38%) 물이 든 병(52%) 마늘(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/b/be/Fish_Soup.png',
    status: [
      {
        name: '생명력',
        value: 25
      },
      {
        name: '마나',
        value: 30
      },
      {
        name: '지력',
        value: 15
      }
    ],
    index: 131,
    isCatering: true
  },
  {
    originName: 'Fried Sausage Vegetables',
    localName: '소시지 야채 볶음',
    originCookingType: 'Stir-frying',
    localCookingType: '볶기',
    originRecipe: 'Sausage(70%) Onion(15%) Carrot(15%)',
    localRecipe: '소시지(70%) 양파(15%) 당근(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/25/Fried_Sausage_Vegetables.png',
    status: [
      {
        name: '스태미나',
        value: 15
      },
      {
        name: '방어',
        value: 1
      }
    ],
    index: 132,
    isCatering: true
  },
  {
    originName: 'Basil Tea',
    localName: '바질티',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Basil(15%) Water(85%)',
    localRecipe: '바질(15%) 물이 든 병(85%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/77/Basil_Tea.png',
    status: [
      {
        name: '솜씨',
        value: 8
      },
      {
        name: '의지',
        value: 12
      }
    ],
    index: 133,
    isCatering: true
  },
  {
    originName: 'Shrimp Pizza',
    localName: '쉬림프 피자',
    originCookingType: 'Pizza Making',
    localCookingType: '피자 만들기',
    originRecipe: 'Red Sauce Pizza Dough(40%) Shrimp(38%) Slice of Cheese(22%)',
    localRecipe: '토마토 소스 피자 도우(40%) 새우(38%) 치즈 조각(22%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/c/c0/Shrimp_Pizza.png',
    status: [
      {
        name: '생명력',
        value: 50
      },
      {
        name: '의지',
        value: 30
      }
    ],
    index: 134,
    isCatering: true
  },
  {
    originName: 'Halloween Star Cookie',
    localName: '할로윈 별 쿠키',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Wheat Flour(70%) Butter(25%) Star Cookie Cutter(5%)',
    localRecipe: '밀가루(70%) 버터(25%) 별 모양 틀(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/b/b1/Halloween_Star_Cookie.png',
    status: [
      {
        name: '행운',
        value: 10
      }
    ],
    index: 135,
    isCatering: true
  },
  {
    originName: 'Korean Beef Tartare',
    localName: '육회',
    originCookingType: 'Julienning',
    localCookingType: '저미기',
    originRecipe: 'Large Meat(86%) Egg(14%)',
    localRecipe: '커다란 고기덩어리(86%) 달걀(14%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/7a/Korean_Beef_Tartare.png',
    status: [
      {
        name: '생명력',
        value: 65
      },
      {
        name: '솜씨',
        value: 15
      }
    ],
    index: 136,
    isCatering: true
  },
  {
    originName: 'Potato Croquette',
    localName: '감자 크로켓',
    originCookingType: 'Deep-frying',
    localCookingType: '튀기기',
    originRecipe: 'Steamed Potato(65%) Sliced Meat(20%) Bread Crumb(15%)',
    localRecipe: '삶은감자(65%) 고기 조각(20%) 빵가루(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/86/Potato_Croquette.png',
    status: [
      {
        name: '솜씨',
        value: -25
      },
      {
        name: '행운',
        value: 35
      }
    ],
    index: 137,
    isCatering: true
  },
  {
    originName: 'Orange Marmalade',
    localName: '오렌지 마멀레이드',
    originCookingType: 'Jam Making',
    localCookingType: '잼 만들기',
    originRecipe: 'Orange(70%) Sugar(25%) Bottled Water(5%)',
    localRecipe: '오렌지(70%) 설탕(25%) 물이 든 병(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/4/44/Orange_Marmalade.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '의지',
        value: 8
      }
    ],
    index: 138,
    isCatering: true
  },
  {
    originName: 'Pad Thai',
    localName: '팟타이',
    originCookingType: 'Noodle Making',
    localCookingType: '면 만들기',
    originRecipe: 'Noodle(75%) Mixed Vegetables(20%) Soy Sauce(5%)',
    localRecipe: '누들(75%) 야채 모둠(20%) 간장(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/95/Pad_Thai.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '지력',
        value: -30
      },
      {
        name: '의지',
        value: 20
      }
    ],
    index: 139,
    isCatering: true
  },
  {
    originName: 'Jellyfish Salad',
    localName: '해파리 냉채',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Jellyfish(80%) Salt(10%) Sugar(10%)',
    localRecipe: '해파리(80%) 소금(10%) 설탕(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f7/Jellyfish_Salad.png',
    status: [
      {
        name: '마나',
        value: 8
      },
      {
        name: '지력',
        value: 12
      },
      {
        name: '의지',
        value: 8
      }
    ],
    index: 140,
    isCatering: true
  },
  {
    originName: 'Scallop Tomato Stew',
    localName: '가리비 토마토 스튜',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Scallop(52%) Onion(24%) Tomato(24%)',
    localRecipe: '가리비(52%) 양파(24%) 토마토(24%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/d4/Scallop_Tomato_Stew.png',
    status: [
      {
        name: '생명력',
        value: 20
      },
      {
        name: '솜씨',
        value: 10
      },
      {
        name: '방어',
        value: 1
      }
    ],
    index: 141,
    isCatering: true
  },
  {
    originName: 'Omurice',
    localName: '오므라이스',
    originCookingType: 'Stir-frying',
    localCookingType: '볶기',
    originRecipe: 'Mixed Fried Rice(90%) Egg(10%)',
    localRecipe: '모둠 볶음밥(90%) 달걀(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e2/Omurice.png',
    status: [
      {
        name: '생명력',
        value: 30
      },
      {
        name: '체력',
        value: 7
      }
    ],
    index: 142,
    isCatering: true
  },
  {
    originName: 'Pulled Pork Sandwich',
    localName: '풀드포크 샌드위치',
    originCookingType: 'Sous Vide',
    localCookingType: '수비드',
    originRecipe: 'Large Meat(38%) Sliced Bread(28%) Mixed Vegetables(34%)',
    localRecipe: '커다란 고기덩어리(38%) 식빵(28%) 야채 모둠(34%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/b/b0/Pulled_Pork_Sandwich.png',
    status: [
      {
        name: '마나',
        value: 45
      },
      {
        name: '마법공격력',
        value: 1
      }
    ],
    index: 143,
    isCatering: true
  },
  {
    originName: 'Raw Chopped Kraken',
    localName: '크라켄 탕탕이',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Kraken Leg Meat(80%) Garlic(20%)',
    localRecipe: '크라켄 다리살(80%) 마늘(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/3a/Raw_Chopped_Kraken.png',
    status: [
      {
        name: '생명력',
        value: 200
      }
    ],
    index: 144,
    isCatering: false
  },
  {
    originName: 'Happy Dessert Time Combo',
    localName: '해피 디저트 타임 세트',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: "Strawberry Whipped Cream Crepe(38%) S'more(34%) Gelatinous Custard Pudding(28%)",
    localRecipe: '딸기 생크림 크레이프(38%) 스모어(34%) 탱글탱글 커스터드 푸딩(28%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e1/Happy_Dessert_Time_Combo.png',
    status: [
      {
        name: '솜씨',
        value: 25
      },
      {
        name: '행운',
        value: 30
      },
      {
        name: '최대대미지',
        value: 2
      },
      {
        name: '보호',
        value: 1
      }
    ],
    index: 145,
    isCatering: true
  },
  {
    originName: 'Peeled Bean Noodles',
    localName: '껍질 벗긴 콩국수',
    originCookingType: 'Noodle Making',
    localCookingType: '면 만들기',
    originRecipe: 'Somen Noodles(75%) Peeled Bean Broth(25%)',
    localRecipe: '소면(75%) 껍질 벗긴 콩물(25%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/5/56/Water-soaked_Bean_Noodles.png',
    status: [
      {
        name: '생명력',
        value: 18
      },
      {
        name: '지력',
        value: 3
      }
    ],
    index: 146,
    isCatering: true
  },
  {
    originName: 'Honey Yogurt',
    localName: '벌꿀 요거트',
    originCookingType: 'Fermenting',
    localCookingType: '발효',
    originRecipe: 'Milk(88%) Fresh Honey(12%)',
    localRecipe: '우유(88%) 신선한 벌꿀(12%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/1c/Honey_Yogurt.png',
    status: [
      {
        name: '마나',
        value: 55
      },
      {
        name: '스태미나',
        value: 15
      },
      {
        name: '지력',
        value: 25
      }
    ],
    index: 147,
    isCatering: true
  },
  {
    originName: 'Ray Gill Filet',
    localName: '가오리 아가미 퓌레',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Ray(80%) Water(15%) Garlic(5%)',
    localRecipe: '가오리(80%) 물이 든 병(15%) 마늘(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/8a/Ray_Gill_Filet.png',
    status: [
      {
        name: '스태미나',
        value: 12
      },
      {
        name: '의지',
        value: 7
      }
    ],
    index: 148,
    isCatering: true
  },
  {
    originName: 'Large Moon Cake',
    localName: '큰 월병',
    originCookingType: 'Pie Making',
    localCookingType: '파이 만들기',
    originRecipe: 'Moon Cake(70%) Bean Stuffing(20%) Peanuts(10%)',
    localRecipe: '월병(70%) 팥소(20%) 땅콩(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/6d/Large_Moon_Cake.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '체력',
        value: 8
      }
    ],
    index: 149,
    isCatering: true
  },
  {
    originName: 'Macaron',
    localName: '마카롱',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Egg(35%) Whipped Cream(35%) Butter(30%)',
    localRecipe: '달걀(35%) 생크림(35%) 버터(30%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e4/Macaron.png',
    status: [
      {
        name: '마나',
        value: 20
      },
      {
        name: '의지',
        value: 25
      }
    ],
    index: 150,
    isCatering: true
  },
  {
    originName: 'Marshmallow',
    localName: '마시멜로',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Sugar(56%) Gelatin(33%) Water(11%)',
    localRecipe: '설탕(56%) 젤라틴(33%) 물이 든 병(11%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/a0/Marshmallow.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '행운',
        value: 15
      }
    ],
    index: 151,
    isCatering: true
  },
  {
    originName: 'Leighean Sling',
    localName: '라인 슬링',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Lemonade(73%) Leighean Gin(19%) Sugar(8%)',
    localRecipe: '레몬 주스(73%) 라인산 진(19%) 설탕(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/b/b7/Leighean_Sling.png',
    status: [
      {
        name: '생명력',
        value: 38
      },
      {
        name: '체력',
        value: 20
      },
      {
        name: '지력',
        value: -8
      },
      {
        name: '솜씨',
        value: -8
      },
      {
        name: '행운',
        value: 15
      }
    ],
    index: 152,
    isCatering: true
  },
  {
    originName: 'Mashed Tofu',
    localName: '뭉개진 두부',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Roasted Bean Flour or Peeled Bean Flour or Water-soaked Bean Flour(70%) Water(20%) Salt(10%)orMagic Bean Flour(33.3%) Water(33.3%) Nigari(33.3%)',
    localRecipe: '구운 콩가루 또는 껍질 벗긴 콩가루 또는 물에 불린 콩가루(70%) 물이 든 병(20%) 소금(10%) or 마법콩가루(33.3%) 물이 든 병(33.3%) 응고제(33.3%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f9/Mashed_Tofu.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '체력',
        value: 5
      },
      {
        name: '의지',
        value: 5
      }
    ],
    index: 153,
    isCatering: true
  },
  {
    originName: 'Red Bean Shaved Ice',
    localName: '팥빙수',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Mung Bean(15%) Ice(60%) Assorted Fruits(25%)',
    localRecipe: '녹두(15%) 얼음(60%) 과일 모둠(25%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/32/Red_Bean_Shaved_Ice.png',
    status: [
      {
        name: '마법방어',
        value: 4
      },
      {
        name: '마법보호',
        value: 2
      }
    ],
    index: 154,
    isCatering: true
  },
  {
    originName: 'Kiss on the Lips',
    localName: '키스 온 더 립스',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Brifne Whiskey(55%) Lemonade(32%) Sugar(13%)',
    localRecipe: '브리흐네 위스키(55%) 레몬 주스(32%) 설탕(13%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/15/Kiss_on_the_Lips.png',
    status: [
      {
        name: '생명력',
        value: 45
      },
      {
        name: '체력',
        value: 26
      },
      {
        name: '지력',
        value: -8
      },
      {
        name: '솜씨',
        value: -8
      },
      {
        name: '행운',
        value: 18
      }
    ],
    index: 155,
    isCatering: true
  },
  {
    originName: 'Onion Soup',
    localName: '양파스프',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Fried Onion(55%) Whipped Cream(35%) Pepper(10%) / Fried Onion(62%) Whipped Cream(38%)',
    localRecipe: '양파볶음(55%) 생크림(35%) 후추(10%) / 양파볶음(62%) 생크림(38%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/05/Onion_Soup.png',
    status: [
      {
        name: '생명력',
        value: 14
      },
      {
        name: '솜씨',
        value: 14
      }
    ],
    index: 156,
    isCatering: true
  },
  {
    originName: 'Halloween Wrapped Cookie',
    localName: '할로윈 포장 쿠키',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Halloween Hat Cookie(30%) Halloween Star Cookie(35%) Halloween Owl Cookie(35%)',
    localRecipe: '할로윈 모자 쿠키(30%) 할로윈 별 쿠키(35%) 할로윈 부엉이 쿠키(35%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/fe/Halloween_Wrapped_Cookie.png',
    status: [
      {
        name: '스태미나',
        value: 10
      }
    ],
    index: 157,
    isCatering: true
  },
  {
    originName: 'Screwdriver',
    localName: '스크류 드라이버',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Orange Juice(75%) Brifne Whiskey(20%) Lemon(5%)',
    localRecipe: '오렌지 주스(75%) 브리흐네 위스키(20%) 레몬(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/1d/Screwdriver.png',
    status: [
      {
        name: '생명력',
        value: 42
      },
      {
        name: '체력',
        value: 28
      },
      {
        name: '지력',
        value: -8
      },
      {
        name: '솜씨',
        value: -8
      },
      {
        name: '행운',
        value: 18
      }
    ],
    index: 158,
    isCatering: true
  },
  {
    originName: 'Mashed Roasted Bean Flour Tofu',
    localName: '뭉개진 구운 콩가루 두부',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Roasted Bean Flour(70%) Water(20%) Salt(10%)',
    localRecipe: '구운 콩가루(70%) 물이 든 병(20%) 소금(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f9/Mashed_Tofu.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '체력',
        value: 5
      },
      {
        name: '의지',
        value: 5
      }
    ],
    index: 159,
    isCatering: true
  },
  {
    originName: 'Shrimp Dog Food',
    localName: '새우 개밥',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Steamed Rice(60%) Shrimp(30%) Salt(10%)',
    localRecipe: '밥(60%) 새우(30%) 소금(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/38/Shrimp_Dog_Food.png',
    status: [
      {
        name: '생명력',
        value: 14
      },
      {
        name: '체력',
        value: 8
      },
      {
        name: '솜씨',
        value: -8
      }
    ],
    index: 160,
    isCatering: true
  },
  {
    originName: 'Kimchi Jjigae',
    localName: '김치 찌개',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Kimchi(30%) Water(60%) Sliced Meat(10%)',
    localRecipe: '김치(30%) 물이 든 병(60%) 고기 조각(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/37/Kimchi_Jjigae.png',
    status: [
      {
        name: '솜씨',
        value: 30
      },
      {
        name: '최소대미지',
        value: 1
      }
    ],
    index: 161,
    isCatering: true
  },
  {
    originName: 'Schweinshaxe',
    localName: '슈바인스학세',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Large Meat(45%) Sauerkraut(33%) French Fries(22%)',
    localRecipe: '커다란 고기덩어리(45%) 사우어크라우트(33%) 감자튀김(22%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/5/55/Schweinshaxe.png',
    status: [
      {
        name: '스태미나',
        value: 25
      },
      {
        name: '체력',
        value: 45
      },
      {
        name: '의지',
        value: 35
      }
    ],
    index: 162,
    isCatering: true
  },
  {
    originName: 'Hard-Boiled Egg',
    localName: '삶은달걀',
    originCookingType: 'Simmering',
    localCookingType: '삶기',
    originRecipe: 'Egg(34%) Water(61%) Salt(5%)',
    localRecipe: '달걀(34%) 물이 든 병(61%) 소금(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f4/Hard-Boiled_Egg.png',
    status: [
      {
        name: '생명력',
        value: 12
      },
      {
        name: '솜씨',
        value: 3
      }
    ],
    index: 163,
    isCatering: true
  },
  {
    originName: 'Jumbo Rice Cake Soup',
    localName: '떡국 곱빼기',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Large Rice Cake Soup(80%) White Rice Cake(12%) Egg(8%)',
    localRecipe: '떡국(80%) 하얀 떡(12%) 달걀(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/8f/Jumbo_Rice_Cake_Soup.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '체력',
        value: 18
      },
      {
        name: '지력',
        value: 8
      },
      {
        name: '솜씨',
        value: 4
      },
      {
        name: '보호',
        value: 1
      }
    ],
    index: 164,
    isCatering: true
  },
  {
    originName: 'Lunch Box of Memories',
    localName: '추억의 도시락',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Steamed Rice(50%) Fried Egg(30%) Cooking Potion(20%)',
    localRecipe: '밥(50%) 계란프라이(30%) 쿠킹 포션(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/39/Lunch_Box_of_Memories.png',
    status: [
      {
        name: '마나',
        value: 19
      },
      {
        name: '지력',
        value: 14
      }
    ],
    index: 165,
    isCatering: false
  },
  {
    originName: 'Mushroom Cappuccino Soup',
    localName: '버섯 카푸치노수프',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Hazelnut Mushroom(55%) Emain Macha Wine(37%) Pepper(8%)',
    localRecipe: '개암버섯(55%) 이멘 마하산 와인(37%) 후추(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/fd/Mushroom_Cappuccino_Soup.png',
    status: [
      {
        name: '생명력',
        value: 13
      },
      {
        name: '의지',
        value: 12
      },
      {
        name: '행운',
        value: 10
      }
    ],
    index: 166,
    isCatering: true
  },
  {
    originName: 'Mint Chocolate Frappe',
    localName: '민트초코 프라페',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Milk(65%) Mint Syrup(15%) Chocolate(20%)',
    localRecipe: '우유(65%) 민트 시럽(15%) 재료 초콜릿(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/69/Mint_Chocolate_Frappe.png',
    status: [
      {
        name: '스태미나',
        value: 30
      },
      {
        name: '의지',
        value: 30
      },
      {
        name: '방어',
        value: 2
      }
    ],
    index: 167,
    isCatering: true
  },
  {
    originName: 'Iskender Kebab',
    localName: '이스켄데르 케밥',
    originCookingType: 'Julienning',
    localCookingType: '저미기',
    originRecipe: 'Large Meat(70%) Bread(19%) Plain Yogurt(11%)',
    localRecipe: '커다란 고기덩어리(70%) 빵(19%) 플레인 요거트(11%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/5/54/Iskender_Kebab.png',
    status: [
      {
        name: '생명력',
        value: 50
      },
      {
        name: '마나',
        value: 25
      },
      {
        name: '지력',
        value: 35
      }
    ],
    index: 168,
    isCatering: true
  },
  {
    originName: 'Mackerel Steak',
    localName: '고등어 스테이크',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Mackerel(80%) Salt(12%) Pepper(8%)',
    localRecipe: '고등어(80%) 소금(12%) 후추(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e3/Mackerel_Steak.png',
    status: [
      {
        name: '생명력',
        value: 30
      },
      {
        name: '마나',
        value: 30
      },
      {
        name: '스태미나',
        value: 30
      }
    ],
    index: 169,
    isCatering: true
  },
  {
    originName: 'Large Fried Dumplings',
    localName: '군만두 곱빼기',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Fried Dumplings(70%) Sliced Meat(20%) Leek(10%)',
    localRecipe: '군만두(70%) 고기 조각(20%) 부추(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/09/Large_Fried_Dumplings.png',
    status: [
      {
        name: '지력',
        value: 8
      },
      {
        name: '솜씨',
        value: 8
      },
      {
        name: '의지',
        value: 16
      }
    ],
    index: 170,
    isCatering: true
  },
  {
    originName: 'Kraken Ink Pasta',
    localName: '크라켄 먹물 파스타',
    originCookingType: 'Pasta Making',
    localCookingType: '파스타 만들기',
    originRecipe: 'Kraken Ink(75%) Garlic(15%) Olive Oil(10%)',
    localRecipe: '크라켄 먹물(75%) 마늘(15%) 올리브유(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/ec/Kraken_Ink_Pasta.png',
    status: [
      {
        name: '체력',
        value: -50
      },
      {
        name: '지력',
        value: -50
      },
      {
        name: '솜씨',
        value: -50
      },
      {
        name: '의지',
        value: -50
      },
      {
        name: '행운',
        value: -50
      }
    ],
    index: 171,
    isCatering: false
  },
  {
    originName: 'Orange Juice',
    localName: '오렌지 주스',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Orange(72%) Berry(18%) Sugar(10%)',
    localRecipe: '오렌지(72%) 나무열매(18%) 설탕(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/7e/Orange_Juice.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '지력',
        value: 5
      },
      {
        name: '의지',
        value: 5
      }
    ],
    index: 172,
    isCatering: true
  },
  {
    originName: 'Halloween Owl Cookie',
    localName: '할로윈 부엉이 쿠키',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Wheat Flour(70%) Butter(25%) Owl Cookie Cutter(5%)',
    localRecipe: '밀가루(70%) 버터(25%) 부엉이 모양 틀(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/30/Halloween_Owl_Cookie.png',
    status: [
      {
        name: '솜씨',
        value: 9
      }
    ],
    index: 173,
    isCatering: true
  },
  {
    originName: 'Margherita',
    localName: '마르게리따',
    originCookingType: 'Pizza Making',
    localCookingType: '피자 만들기',
    originRecipe: 'Red Sauce Pizza Dough(40%) Basil(30%) Slice of Cheese(30%)',
    localRecipe: '토마토 소스 피자 도우(40%) 바질(30%) 치즈 조각(30%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/db/Margherita.png',
    status: [
      {
        name: '생명력',
        value: 35
      },
      {
        name: '마나',
        value: 20
      },
      {
        name: '솜씨',
        value: 35
      }
    ],
    index: 174,
    isCatering: true
  },
  {
    originName: 'Mackerel Jorim',
    localName: '고등어 조림',
    originCookingType: 'Sous Vide',
    localCookingType: '수비드',
    originRecipe: 'Mackerel(81%) Soy Sauce(14%) Lemon Juice(5%)',
    localRecipe: '고등어(81%) 간장(14%) 레몬즙(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/ae/Mackerel_Jorim.png',
    status: [
      {
        name: '생명력',
        value: 25
      },
      {
        name: '체력',
        value: 30
      },
      {
        name: '솜씨',
        value: 15
      }
    ],
    index: 175,
    isCatering: true
  },
  {
    originName: 'Lemonade',
    localName: '레몬 주스',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Lemon(60%) Berry(30%) Sugar(10%)',
    localRecipe: '레몬(60%) 나무열매(30%) 설탕(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/2a/Lemonade.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '지력',
        value: 5
      },
      {
        name: '의지',
        value: 5
      }
    ],
    index: 176,
    isCatering: true
  },
  {
    originName: 'Mushroom Potage',
    localName: '버섯 포타주',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Hazelnut Mushroom(65%) Whipped Cream(27%) Salt or Pepper(8%)',
    localRecipe: '개암버섯(65%) 생크림(27%) 소금 또는 후추(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/11/Mushroom_Potage.png',
    status: [
      {
        name: '생명력',
        value: 25
      },
      {
        name: '체력',
        value: 20
      },
      {
        name: '의지',
        value: 10
      }
    ],
    index: 177,
    isCatering: true
  },
  {
    originName: 'Mashed Water-soaked Bean Flour Tofu',
    localName: '뭉개진 물에 불린 콩가루 두부',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Water-soaked Bean Flour(70%) Water(20%) Salt(10%)',
    localRecipe: '물에 불린 콩가루(70%) 물이 든 병(20%) 소금(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f9/Mashed_Tofu.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '체력',
        value: 5
      },
      {
        name: '의지',
        value: 5
      }
    ],
    index: 178,
    isCatering: true
  },
  {
    originName: 'Kraken Stirfry',
    localName: '크라켄 볶음 모둠',
    originCookingType: 'Stir-frying',
    localCookingType: '볶기',
    originRecipe: 'Kraken Pulpo(35%) Spicy Fried Kraken(35%) Kraken Ink Pasta(30%)',
    localRecipe: '크라켄 뽈뽀(35%) 타바스코 프라이드 크라켄(35%) 크라켄 먹물 파스타(30%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/df/Kraken_Stirfry.png',
    status: [
      {
        name: '체력',
        value: 59
      },
      {
        name: '지력',
        value: 59
      },
      {
        name: '솜씨',
        value: 59
      },
      {
        name: '의지',
        value: 59
      },
      {
        name: '행운',
        value: 59
      },
      {
        name: '방어',
        value: 24
      },
      {
        name: '보호',
        value: 3
      },
      {
        name: '마법방어',
        value: 24
      },
      {
        name: '마법보호',
        value: 3
      }
    ],
    index: 179,
    isCatering: false
  },
  {
    originName: 'Shish Kebab',
    localName: '쉬쉬 케밥',
    originCookingType: 'Julienning',
    localCookingType: '저미기',
    originRecipe: 'Sliced Meat(77%) Bell Pepper(12%) Tomato(11%)',
    localRecipe: '고기 조각(77%) 파프리카(12%) 토마토(11%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/c/cc/Shish_Kebab.png',
    status: [
      {
        name: '생명력',
        value: 40
      },
      {
        name: '행운',
        value: 30
      },
      {
        name: '방어',
        value: 1
      }
    ],
    index: 180,
    isCatering: true
  },
  {
    originName: 'Pane',
    localName: '빠네',
    originCookingType: 'Pasta Making',
    localCookingType: '파스타 만들기',
    originRecipe: 'Bread(50%) Long Pasta(45%) Whipped Cream(5%)',
    localRecipe: '빵(50%) 롱 파스타(45%) 생크림(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/33/Pane.png',
    status: [
      {
        name: '생명력',
        value: 12
      },
      {
        name: '의지',
        value: 5
      }
    ],
    index: 181,
    isCatering: true
  },
  {
    originName: 'Salmon Sashimi',
    localName: '연어회',
    originCookingType: 'Julienning',
    localCookingType: '저미기',
    originRecipe: 'Rano Salmon(90%) Chojang(10%)',
    localRecipe: '라노산 연어(90%) 초장(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/8b/Salmon_Sashimi.png',
    status: [
      {
        name: '생명력',
        value: 20
      },
      {
        name: '마나',
        value: 35
      },
      {
        name: '방어',
        value: 3
      },
      {
        name: '보호',
        value: 1
      }
    ],
    index: 182,
    isCatering: true
  },
  {
    originName: 'Kraken Skewer',
    localName: '크라켄 호롱구이',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Kraken Leg Meat(80%) Red Pepper Powder(20%)',
    localRecipe: '크라켄다리살(80%) 고춧가루(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/a9/Kraken_Skewer.png',
    status: [
      {
        name: '스태미나',
        value: 200
      }
    ],
    index: 183,
    isCatering: false
  },
  {
    originName: 'Moon Cake',
    localName: '월병',
    originCookingType: 'Pie Making',
    localCookingType: '파이 만들기',
    originRecipe: 'Flour Dough(50%) Bean Stuffing(35%) Peanuts(15%)',
    localRecipe: '밀가루 빵 반죽(50%) 팥소(35%) 땅콩(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/2f/Moon_Cake.png',
    status: [
      {
        name: '생명력',
        value: 7
      },
      {
        name: '체력',
        value: 1
      }
    ],
    index: 184,
    isCatering: true
  },
  {
    originName: 'Potato and Egg Salad',
    localName: '감자계란샐러드',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Steamed Potato(53%) Hard-Boiled Egg(36%) Mayonnaise(11%)',
    localRecipe: '삶은감자(53%) 삶은달걀(36%) 마요네즈(11%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/4/4d/Potato_and_Egg_Salad.png',
    status: [
      {
        name: '생명력',
        value: 25
      },
      {
        name: '체력',
        value: 3
      },
      {
        name: '지력',
        value: 10
      },
      {
        name: '솜씨',
        value: 5
      }
    ],
    index: 185,
    isCatering: true
  },
  {
    originName: 'Nutritious Walnut Bread',
    localName: '영양만점 호두과자',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Walnut(30%) Bean Stuffing(30%) Wheat Flour(40%)',
    localRecipe: '호두(30%) 팥소(30%) 밀가루(40%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/3e/Nutritious_Walnut_Bread.png',
    status: [
      {
        name: '생명력',
        value: 35
      },
      {
        name: '마나',
        value: 35
      }
    ],
    index: 186,
    isCatering: true
  },
  {
    originName: 'Picnic Chicken Kebab',
    localName: '소풍용 치킨 케밥',
    originCookingType: 'Julienning',
    localCookingType: '저미기',
    originRecipe: 'Chicken(55%) Bell Pepper(25%) Tortilla(20%)',
    localRecipe: '닭고기(55%) 파프리카(25%) 토르티야(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/ab/Picnic_Chicken_Kebab.png',
    status: [
      {
        name: '마나',
        value: 30
      },
      {
        name: '솜씨',
        value: 30
      },
      {
        name: '마법보호',
        value: 1
      }
    ],
    index: 187,
    isCatering: true
  },
  {
    originName: 'Pineapple Bacon Skewer',
    localName: '파인애플 베이컨 꼬치',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Bacon(40%) Pineapple(42%) Shrimp(18%)',
    localRecipe: '베이컨(40%) 파인애플(42%) 새우(18%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/3f/Pineapple_Bacon_Skewer.png',
    status: [
      {
        name: '생명력',
        value: 25
      },
      {
        name: '마나',
        value: 25
      },
      {
        name: '행운',
        value: 30
      }
    ],
    index: 188,
    isCatering: true
  },
  {
    originName: 'Lemon Tea',
    localName: '레몬티',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Water(85%) Lemon(10%) Sugar(5%)',
    localRecipe: '물이 든 병(85%) 레몬(10%) 설탕(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/28/Lemon_Tea.png',
    status: [
      {
        name: '생명력',
        value: 6
      },
      {
        name: '지력',
        value: 10
      },
      {
        name: '솜씨',
        value: 8
      }
    ],
    index: 189,
    isCatering: true
  },
  {
    originName: 'Honey Chestnut Latte',
    localName: '꿀밤 라떼',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Simmered Chestnuts(25%) Fresh Honey(10%) Milk(65%)',
    localRecipe: '삶은 밤(25%) 신선한 벌꿀(10%) 우유(65%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/df/Honey_Chestnut_Latte.png',
    status: [
      {
        name: '스태미나',
        value: 30
      },
      {
        name: '의지',
        value: 10
      }
    ],
    index: 190,
    isCatering: true
  },
  {
    originName: 'Salmon Sushi',
    localName: '연어초밥',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Salmon Sashimi(52%) Steamed Rice(38%) Vinegar(10%)',
    localRecipe: '연어회(52%) 밥(38%) 식초(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/23/Salmon_Sushi.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '마나',
        value: 80
      },
      {
        name: '스태미나',
        value: 15
      },
      {
        name: '방어',
        value: 1
      }
    ],
    index: 191,
    isCatering: true
  },
  {
    originName: 'Mushroom Canape',
    localName: '버섯 카나페',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Hazelnut Mushroom(50%) Slice of Cheese(30%) Whipped Cream(20%)',
    localRecipe: '개암버섯(50%) 치즈 조각(30%) 생크림(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/33/Mushroom_Canape.png',
    status: [
      {
        name: '생명력',
        value: 18
      },
      {
        name: '솜씨',
        value: 3
      },
      {
        name: '행운',
        value: 10
      }
    ],
    index: 192,
    isCatering: true
  },
  {
    originName: 'Moist Salmon Steak',
    localName: '촉촉한 연어 스테이크',
    originCookingType: 'Sous Vide',
    localCookingType: '수비드',
    originRecipe: 'Rano Salmon(90%) Olive Oil(5%) Thyme(5%)',
    localRecipe: '라노산 연어(90%) 올리브유(5%) 타임(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/6f/Moist_Salmon_Steak.png',
    status: [
      {
        name: '스태미나',
        value: 25
      },
      {
        name: '의지',
        value: 30
      },
      {
        name: '마법방어',
        value: 3
      }
    ],
    index: 193,
    isCatering: true
  },
  {
    originName: 'Pork Galbi Stew',
    localName: '돼지갈비찜',
    originCookingType: 'Steaming',
    localCookingType: '찌기',
    originRecipe: 'Large Meat(70%) Mixed Vegetables(10%) Meat Marinade(20%)',
    localRecipe: '커다란 고기덩어리(70%) 야채 모둠(10%) 고기양념(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/d0/Pork_Galbi_Stew.png',
    status: [
      {
        name: '생명력',
        value: 28
      },
      {
        name: '지력',
        value: 8
      },
      {
        name: '솜씨',
        value: 5
      },
      {
        name: '의지',
        value: 5
      }
    ],
    index: 194,
    isCatering: true
  },
  {
    originName: 'Roasted Bacon',
    localName: '베이컨 구이',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Bacon(90%) Salt(10%) / Bacon(100%)',
    localRecipe: '베이컨(90%) 소금(10%) / 베이컨(100%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/2d/Roasted_Bacon.png',
    status: [
      {
        name: '생명력',
        value: 18
      },
      {
        name: '지력',
        value: 3
      }
    ],
    index: 195,
    isCatering: true
  },
  {
    originName: 'Mashed Peeled Bean Flour Tofu',
    localName: '뭉개진 껍질 벗긴 콩가루 두부',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Peeled Bean Flour(70%) Water(20%) Salt(10%)',
    localRecipe: '껍질 벗긴 콩가루(70%) 물이 든 병(20%) 소금(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f9/Mashed_Tofu.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '체력',
        value: 5
      },
      {
        name: '의지',
        value: 5
      }
    ],
    index: 196,
    isCatering: true
  },
  {
    originName: 'Meat Pie',
    localName: '미트파이',
    originCookingType: 'Pie Making',
    localCookingType: '파이 만들기',
    originRecipe: 'Pan Pie Crust(50%) Large Meat(38%) Meat Marinade(12%)',
    localRecipe: '파이 틀(50%) 커다란 고기덩어리(38%) 고기양념(12%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/68/Meat_Pie.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '의지',
        value: 5
      },
      {
        name: '행운',
        value: 5
      }
    ],
    index: 197,
    isCatering: true
  },
  {
    originName: 'Kraken Pulpo',
    localName: '크라켄 뽈뽀',
    originCookingType: 'Simmering',
    localCookingType: '삶기',
    originRecipe: 'Kraken Leg Meat(80%) Pepper(20%)',
    localRecipe: '크라켄다리살(80%) 후추(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/04/Kraken_Pulpo.png',
    status: [
      {
        name: '방어',
        value: 20
      },
      {
        name: '마법방어',
        value: 20
      }
    ],
    index: 198,
    isCatering: false
  },
  {
    originName: 'Milk Tea',
    localName: '밀크티',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Black Tea(77%) Milk(18%) Sugar(5%)',
    localRecipe: '홍차(77%) 우유(18%) 설탕(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/d5/Milk_Tea.png',
    status: [
      {
        name: '마나',
        value: 30
      },
      {
        name: '행운',
        value: 30
      },
      {
        name: '보호',
        value: 1
      }
    ],
    index: 199,
    isCatering: true
  },
  {
    originName: 'Panna Cotta',
    localName: '판나코타',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Whipped Cream(57%) Gelatin(24%) Sugar(19%)',
    localRecipe: '생크림(57%) 젤라틴(24%) 설탕(19%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/3d/Panna_Cotta.png',
    status: [
      {
        name: '생명력',
        value: -20
      },
      {
        name: '체력',
        value: -15
      },
      {
        name: '지력',
        value: -20
      }
    ],
    index: 200,
    isCatering: true
  },
  {
    originName: 'Lassi',
    localName: '라씨',
    originCookingType: 'Fermenting',
    localCookingType: '혼합',
    originRecipe: 'Plain Yogurt(76%) Water(10%) Assorted Fruits(14%)',
    localRecipe: '플레인 요거트(76%) 물이 든 병(10%) 과일 모둠(14%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/4/43/Lassi.png',
    status: [
      {
        name: '마나',
        value: 20
      },
      {
        name: '지력',
        value: 25
      },
      {
        name: '마법방어',
        value: 2
      }
    ],
    index: 201,
    isCatering: true
  },
  {
    originName: 'Mushroom Consomme',
    localName: '버섯 콘소메',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Hazelnut Mushroom(55%) Onion(36%) Salt or Pepper(9%)',
    localRecipe: '개암버섯(55%) 양파(36%) 소금 또는 후추(9%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/98/Mushroom_Consomme.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '지력',
        value: 30
      }
    ],
    index: 202,
    isCatering: true
  },
  {
    originName: 'Shark Fin Soup',
    localName: '샥스핀 수프',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Shrimp(45%) Egg(30%) Carnivorous Fish(25%)',
    localRecipe: '새우(45%) 달걀(30%) 민물 거대 육식 어류(25%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/37/Shark_Fin_Soup.png',
    status: [
      {
        name: '생명력',
        value: 40
      },
      {
        name: '체력',
        value: 15
      },
      {
        name: '지력',
        value: 8
      },
      {
        name: '솜씨',
        value: 8
      },
      {
        name: '의지',
        value: 16
      }
    ],
    index: 203,
    isCatering: true
  },
  {
    originName: 'Reuben Sandwich',
    localName: '루벤 샌드위치',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Sliced Bread(55%) Salami(25%) Sauerkraut(20%)',
    localRecipe: '식빵(55%) 살라미(25%) 사우어크라우트(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/b/ba/Reuben_Sandwich.png',
    status: [
      {
        name: '방어',
        value: 3
      },
      {
        name: '보호',
        value: 2
      },
      {
        name: '마법방어',
        value: 3
      },
      {
        name: '마법보호',
        value: 1
      }
    ],
    index: 204,
    isCatering: true
  },
  {
    originName: 'Red Sunrise',
    localName: '레드 선라이즈',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Orange Juice(60%) Brifne Whiskey(25%) Sugar(15%)',
    localRecipe: '오렌지 주스(60%) 브리흐네 위스키(25%) 설탕(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/31/Red_Sunrise.png',
    status: [
      {
        name: '생명력',
        value: 42
      },
      {
        name: '체력',
        value: 20
      },
      {
        name: '지력',
        value: -10
      },
      {
        name: '솜씨',
        value: -10
      },
      {
        name: '행운',
        value: 15
      }
    ],
    index: 205,
    isCatering: true
  },
  {
    originName: 'Sausage',
    localName: '소시지',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Sliced Meat(85%) Wheat Flour(5%) Onion(10%)',
    localRecipe: '고기 조각(85%) 밀가루(5%) 양파(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/3a/Sausage.png',
    status: [
      {
        name: '생명력',
        value: 18
      },
      {
        name: '체력',
        value: 6
      }
    ],
    index: 206,
    isCatering: true
  },
  {
    originName: 'Roasted Bean Noodles',
    localName: '구운 콩국수',
    originCookingType: 'Noodle Making',
    localCookingType: '면 만들기',
    originRecipe: 'Somen Noodles(75%) Roasted Bean Broth(25%)',
    localRecipe: '소면(75%) 구운 콩물(25%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/5/56/Water-soaked_Bean_Noodles.png',
    status: [
      {
        name: '생명력',
        value: 17
      },
      {
        name: '지력',
        value: 2
      }
    ],
    index: 207,
    isCatering: true
  },
  {
    originName: 'Kimchi',
    localName: '김치',
    originCookingType: 'Fermenting',
    localCookingType: '발효',
    originRecipe: 'Napa Cabbage(72%) Salt(8%) Red Pepper Powder(20%)',
    localRecipe: '배추(72%) 소금(8%) 고춧가루(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/4/43/Kimchi.png',
    status: [
      {
        name: '생명력',
        value: 30
      },
      {
        name: '마나',
        value: 30
      },
      {
        name: '스태미나',
        value: 30
      }
    ],
    index: 208,
    isCatering: true
  },
  {
    originName: 'Pickled Cucumbers',
    localName: '오이 피클',
    originCookingType: 'Fermenting',
    localCookingType: '발효',
    originRecipe: 'Cucumber(71%) Water(14%) Vinegar(15%)',
    localRecipe: '오이(71%) 물이 든 병(14%) 식초(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/a2/Pickled_Cucumbers.png',
    status: [
      {
        name: '마나',
        value: 60
      },
      {
        name: '마법방어',
        value: 2
      },
      {
        name: '마법보호',
        value: 1
      }
    ],
    index: 209,
    isCatering: true
  },
  {
    originName: 'Sauerkraut',
    localName: '사우어크라우트',
    originCookingType: 'Fermenting',
    localCookingType: '발효',
    originRecipe: 'Cabbage(77%) Salt(9%) Vinegar(14%)',
    localRecipe: '양배추(77%) 소금(9%) 식초(14%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/9d/Sauerkraut.png',
    status: [
      {
        name: '마나',
        value: 45
      },
      {
        name: '지력',
        value: 30
      },
      {
        name: '마법방어',
        value: 1
      }
    ],
    index: 210,
    isCatering: true
  },
  {
    originName: 'Mushroom Jangjorim',
    localName: '버섯 장조림',
    originCookingType: 'Sous Vide',
    localCookingType: '수비드',
    originRecipe: 'Sliced Meat(32%) Hazelnut Mushroom(55%) Soy Sauce(13%)',
    localRecipe: '고기 조각(32%) 개암버섯(55%) 간장(13%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/19/Mushroom_Jangjorim.png',
    status: [
      {
        name: '생명력',
        value: 20
      },
      {
        name: '체력',
        value: 10
      },
      {
        name: '지력',
        value: 20
      }
    ],
    index: 211,
    isCatering: true
  },
  {
    originName: 'Hard Cider',
    localName: '애플사이다',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Apple(75%) Brifne Whiskey(25%)',
    localRecipe: '사과(75%) 브리흐네 위스키(25%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/2d/Hard_Cider.png',
    status: [
      {
        name: '마법공격력',
        value: 4
      }
    ],
    index: 212,
    isCatering: true
  },
  {
    originName: 'Jumbo Fried Dumplings',
    localName: '특대 군만두',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Large Fried Dumplings(80%) Sliced Meat(12%) Leek(8%)',
    localRecipe: '군만두 곱빼기(80%) 고기 조각(12%) 부추(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/9b/Jumbo_Fried_Dumplings.png',
    status: [
      {
        name: '생명력',
        value: 20
      },
      {
        name: '체력',
        value: 15
      },
      {
        name: '지력',
        value: 8
      },
      {
        name: '솜씨',
        value: 8
      },
      {
        name: '의지',
        value: 16
      }
    ],
    index: 213,
    isCatering: true
  },
  {
    originName: 'Roasted Chicken Wing',
    localName: '닭날개 구이',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Chicken Wings(80%) Olive Oil(20%)',
    localRecipe: '닭날개(80%) 올리브유(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/b/b4/Roasted_Chicken_Wing.png',
    status: [
      {
        name: '생명력',
        value: 28
      },
      {
        name: '행운',
        value: 10
      }
    ],
    index: 214,
    isCatering: true
  },
  {
    originName: 'Pork Cutlet',
    localName: '돈가스',
    originCookingType: 'Deep-frying',
    localCookingType: '튀기기',
    originRecipe: 'Sliced Meat(75%) Bread Crumb(18%) Egg(7%)',
    localRecipe: '고기 조각(75%) 빵가루(18%) 달걀(7%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/16/Pork_Cutlet.png',
    status: [
      {
        name: '생명력',
        value: 16
      },
      {
        name: '의지',
        value: 9
      }
    ],
    index: 215,
    isCatering: true
  },
  {
    originName: 'Scuabtuinne Sucker Skewers',
    localName: '스쿠압틴산 빨판 꼬치',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Kraken Sucker(Ingredient)(70%) Salt(15%) Pepper(15%)',
    localRecipe: '크라켄 빨판(70%) 소금(15%) 후추(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e0/Scuabtuinne_Sucker_Skewers.png',
    status: [
      {
        name: '의지',
        value: 100
      }
    ],
    index: 216,
    isCatering: false
  },
  {
    originName: 'Kimchi Fried Rice',
    localName: '김치 볶음밥',
    originCookingType: 'Stir-frying',
    localCookingType: '볶기',
    originRecipe: 'Kimchi(35%) Fried Egg(20%) Mixed Fried Rice(45%)',
    localRecipe: '김치(35%) 계란프라이(20%) 모둠 볶음밥(45%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/29/Kimchi_Fried_Rice.png',
    status: [
      {
        name: '스태미나',
        value: 45
      },
      {
        name: '의지',
        value: 30
      }
    ],
    index: 217,
    isCatering: true
  },
  {
    originName: 'Herb Mushroom Salad',
    localName: '허브 버섯 샐러드',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Steamed Mushroom(70%) Thyme(20%) Olive Oil(10%)',
    localRecipe: '버섯찜(70%) 타임(20%) 올리브유(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/df/Herb_Mushroom_Salad.png',
    status: [
      {
        name: '솜씨',
        value: -7
      },
      {
        name: '의지',
        value: 5
      },
      {
        name: '행운',
        value: 5
      }
    ],
    index: 218,
    isCatering: true
  },
  {
    originName: 'Mushroom Cookie',
    localName: '버섯 쿠키',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Wheat Flour(50%) Hazelnut Mushroom(40%) Whipped Cream(10%)',
    localRecipe: '밀가루(50%) 개암버섯(40%) 생크림(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/69/Mushroom_Cookie.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '체력',
        value: 9
      },
      {
        name: '솜씨',
        value: 3
      }
    ],
    index: 219,
    isCatering: true
  },
  {
    originName: 'Magic Bean Tofu',
    localName: '마법 콩 두부',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Magic Bean Flour(80%) Water(15%) Nigari(5%)',
    localRecipe: '마법 콩가루(80%) 물이 든 병(15%) 응고제(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/b/b5/Magic_Bean_Tofu.png',
    status: [
      {
        name: '생명력',
        value: 20
      },
      {
        name: '체력',
        value: 10
      },
      {
        name: '의지',
        value: 10
      }
    ],
    index: 220,
    isCatering: false
  },
  {
    originName: 'Irish Stew',
    localName: '아이리쉬 스튜',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Sliced Meat(78%) Giant Potato(12%) Carrot(10%)',
    localRecipe: '고기 조각(78%) 왕감자(12%) 당근(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/3d/Irish_Stew.png',
    status: [
      {
        name: '스태미나',
        value: 40
      },
      {
        name: '행운',
        value: 25
      }
    ],
    index: 221,
    isCatering: true
  },
  {
    originName: 'Mille Feuille Hot Pot',
    localName: '밀푀유 전골',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Napa Cabbage(25%) Beef(25%) Meat Broth(50%)',
    localRecipe: '배추(25%) 쇠고기(25%) 육수(50%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/00/Mille_Feuille_Hot_Pot.png',
    status: [
      {
        name: '스태미나',
        value: 30
      },
      {
        name: '지력',
        value: 25
      }
    ],
    index: 222,
    isCatering: true
  },
  {
    originName: 'Scuabtuinne Sucker Sous Vide',
    localName: '스쿠압틴산 빨판 다이어트 수비드',
    originCookingType: 'Sous Vide',
    localCookingType: '수비드',
    originRecipe: 'Kraken Sucker(Ingredient)(70%) Lemon Juice(15%) Pepper(15%)',
    localRecipe: '크라켄 빨판(70%) 레몬즙(15%) 후추(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/69/Scuabtuinne_Sucker_Sous_Vide.png',
    status: [
      {
        name: '솜씨',
        value: 100
      }
    ],
    index: 223,
    isCatering: false
  },
  {
    originName: 'Pine Nut Soup',
    localName: '잣죽',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Pine Nut(45%) Steamed Rice(50%) Salt(5%)',
    localRecipe: '잣(45%) 밥(50%) 소금(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/1f/Pine_Nut_Soup.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '체력',
        value: 5
      },
      {
        name: '의지',
        value: 8
      }
    ],
    index: 224,
    isCatering: true
  },
  {
    originName: 'Natto',
    localName: '낫토',
    originCookingType: 'Fermenting',
    localCookingType: '발효',
    originRecipe: 'Simmered Beans(91%) Soy Sauce(9%)',
    localRecipe: '삶은 콩(91%) 간장(9%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/6b/Natto.png',
    status: [
      {
        name: '생명력',
        value: 55
      },
      {
        name: '스태미나',
        value: 25
      },
      {
        name: '체력',
        value: 30
      },
      {
        name: '방어',
        value: 2
      }
    ],
    index: 225,
    isCatering: true
  },
  {
    originName: 'Onion Ring',
    localName: '양파 튀김',
    originCookingType: 'Deep-frying',
    localCookingType: '튀기기',
    originRecipe: 'Onion(60%) Fry Batter(30%) Salt(10%)',
    localRecipe: '양파(60%) 튀김옷(30%) 소금(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/ad/Onion_Ring.png',
    status: [
      {
        name: '생명력',
        value: 20
      },
      {
        name: '체력',
        value: 22
      },
      {
        name: '지력',
        value: 4
      },
      {
        name: '솜씨',
        value: 4
      },
      {
        name: '의지',
        value: 20
      }
    ],
    index: 226,
    isCatering: true
  },
  {
    originName: 'Poisonous Mushroom Stew',
    localName: '독버섯 스튜',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Brown Pine Mushroom(60%) Brifne Whiskey(40%)',
    localRecipe: '담갈색송이버섯(60%) 브리흐네 위스키(40%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/93/Poisonous_Mushroom_Stew.png',
    status: [
      {
        name: '생명력',
        value: 20
      },
      {
        name: '체력',
        value: 10
      },
      {
        name: '의지',
        value: 15
      }
    ],
    index: 227,
    isCatering: false
  },
  {
    originName: 'Halloween Pumpkin Jelly',
    localName: '할로윈 호박 젤리',
    originCookingType: 'Jam Making',
    localCookingType: '잼 만들기',
    originRecipe: 'Gelatin(85%) Ripe Pumpkin(15%)',
    localRecipe: '젤라틴(85%) 청둥 호박(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/70/Halloween_Pumpkin_Jelly.png',
    status: [
      {
        name: '체력',
        value: 10
      }
    ],
    index: 228,
    isCatering: true
  },
  {
    originName: 'Parboiled Octopus',
    localName: '문어 숙회',
    originCookingType: 'Julienning',
    localCookingType: '저미기',
    originRecipe: 'Simmered Octopus(90%) Chojang(10%)',
    localRecipe: '삶은 문어(90%) 초장(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/81/Parboiled_Octopus.png',
    status: [
      {
        name: '마나',
        value: 45
      },
      {
        name: '스태미나',
        value: 25
      },
      {
        name: '방어',
        value: 3
      }
    ],
    index: 229,
    isCatering: true
  },
  {
    originName: 'Kikiki Mushroom Cookie',
    localName: '까르르 버섯 쿠키',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Mushroom Cookie(45%) Cooking Potion(30%) Brown Pine Mushroom(25%)',
    localRecipe: '버섯 쿠키(45%) 쿠킹 포션(30%) 담갈색송이버섯(25%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/d3/Kikiki_Mushroom_Cookie.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '솜씨',
        value: 7
      },
      {
        name: '행운',
        value: 5
      }
    ],
    index: 230,
    isCatering: false
  },
  {
    originName: 'Lemon Jam',
    localName: '레몬잼',
    originCookingType: 'Jam Making',
    localCookingType: '잼 만들기',
    originRecipe: 'Lemon(80%) Sugar(20%)',
    localRecipe: '레몬(80%) 설탕(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/60/Lemon_Jam.png',
    status: [
      {
        name: '생명력',
        value: 30
      },
      {
        name: '체력',
        value: -20
      }
    ],
    index: 231,
    isCatering: true
  },
  {
    originName: 'Pineapple Fried Rice',
    localName: '파인애플 볶음밥',
    originCookingType: 'Stir-frying',
    localCookingType: '볶기',
    originRecipe: 'Steamed Rice(65%) Pineapple(25%) Worcestershire Sauce(10%)',
    localRecipe: '밥(65%) 파인애플(25%) 우스터 소스(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/ab/Pineapple_Fried_Rice.png',
    status: [
      {
        name: '생명력',
        value: 60
      },
      {
        name: '보호',
        value: 1
      },
      {
        name: '마법보호',
        value: 1
      }
    ],
    index: 232,
    isCatering: true
  },
  {
    originName: 'Seafood Spaghetti',
    localName: '해물 스파게티',
    originCookingType: 'Pasta Making',
    localCookingType: '파스타 만들기',
    originRecipe: 'Long Pasta(63%) Seafood Sauce(32%) Pepper(5%)',
    localRecipe: '롱 파스타(63%) 해물 소스(32%) 후추(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/9b/Seafood_Spaghetti.png',
    status: [
      {
        name: '생명력',
        value: 30
      },
      {
        name: '체력',
        value: 5
      },
      {
        name: '지력',
        value: 12
      },
      {
        name: '솜씨',
        value: 25
      },
      {
        name: '의지',
        value: 15
      }
    ],
    index: 233,
    isCatering: true
  },
  {
    originName: 'Rice Cake Soup',
    localName: '떡국',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'White Rice Cake(50%) Beef(35%) Egg(15%)',
    localRecipe: '하얀 떡(50%) 쇠고기(35%) 달걀(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/71/Rice_Cake_Soup.png',
    status: [
      {
        name: '생명력',
        value: 8
      },
      {
        name: '체력',
        value: 2
      }
    ],
    index: 234,
    isCatering: true
  },
  {
    originName: 'Large Rice Cake Soup',
    localName: '떡국 곱빼기',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Rice Cake Soup(70%) White Rice Cake(20%) Egg(10%)',
    localRecipe: '떡국(70%) 하얀 떡(20%) 달걀(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/5/52/Large_Rice_Cake_Soup.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '체력',
        value: 8
      },
      {
        name: '솜씨',
        value: 4
      }
    ],
    index: 235,
    isCatering: true
  },
  {
    originName: 'Mint Chocolate Cookie',
    localName: '민트초코칩 쿠키',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Wheat Flour(65%) Mint Syrup(20%) Baking Chocolate(15%)',
    localRecipe: '밀가루(65%) 민트 시럽(20%) 재료 초콜릿(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/25/Mint_Chocolate_Cookie.png',
    status: [
      {
        name: '생명력',
        value: 55
      },
      {
        name: '스태미나',
        value: -30
      },
      {
        name: '의지',
        value: 9
      },
      {
        name: '방어',
        value: 1
      }
    ],
    index: 236,
    isCatering: true
  },
  {
    originName: 'Pepperoni Pizza',
    localName: '페퍼로니 피자',
    originCookingType: 'Pizza Making',
    localCookingType: '피자 만들기',
    originRecipe: 'Red Sauce Pizza Dough(42%)Salami(38%)Slice of Cheese(20%)',
    localRecipe: '토마토 소스 피자 도우(42%) 살라미(38%) 치즈 조각(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/66/Pepperoni_Pizza.png',
    status: [
      {
        name: '스태미나',
        value: 55
      },
      {
        name: '의지',
        value: 30
      },
      {
        name: '방어',
        value: 3
      }
    ],
    index: 237,
    isCatering: true
  },
  {
    originName: 'Light Salmon Salad',
    localName: '가벼운 연어 샐러드',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Salmon Sashimi(71%) Onion(21%) Wine Vinegar(8%)',
    localRecipe: '연어회(71%) 양파(21%) 와인식초(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/36/Light_Salmon_Salad.png',
    status: [
      {
        name: '마나',
        value: 35
      },
      {
        name: '지력',
        value: 25
      },
      {
        name: '마법보호',
        value: 1
      }
    ],
    index: 238,
    isCatering: true
  },
  {
    originName: 'Highball',
    localName: '하이볼',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Lemon(25%) Brifne Whiskey(75%)',
    localRecipe: '레몬(25%) 브리흐네 위스키(75%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/9f/Highball.png',
    status: [
      {
        name: '최대대미지',
        value: 2
      }
    ],
    index: 239,
    isCatering: true
  },
  {
    originName: 'Popcorn',
    localName: '팝콘',
    originCookingType: 'Stir-frying',
    localCookingType: '볶기',
    originRecipe: 'Corn(80%) Butter(15%) Salt(5%)',
    localRecipe: '옥수수(80%) 버터(15%) 소금(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/85/Popcorn.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '체력',
        value: 10
      },
      {
        name: '지력',
        value: 8
      },
      {
        name: '솜씨',
        value: 10
      },
      {
        name: '의지',
        value: 8
      }
    ],
    index: 240,
    isCatering: false
  },
  {
    originName: 'Rock Bream Fish Stew',
    localName: '돔돔 매운탕',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Black Sea Bream(45%) Red Sea Bream(45%) Red Pepper Powder(10%)',
    localRecipe: '감성돔(45%) 참돔(45%) 고춧가루(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/dd/Rock_Bream_Fish_Stew.png',
    status: [
      {
        name: '체력',
        value: 10
      },
      {
        name: '지력',
        value: 10
      },
      {
        name: '솜씨',
        value: 10
      },
      {
        name: '의지',
        value: 10
      },
      {
        name: '행운',
        value: 10
      }
    ],
    index: 241,
    isCatering: true
  },
  {
    originName: 'Salmon Oyakodon',
    localName: '연어 오야코동',
    originCookingType: 'Sous Vide',
    localCookingType: '수비드',
    originRecipe: 'Rano Salmon(49%) Steamed Rice(47%) Lemon(4%)',
    localRecipe: '라노산 연어(49%) 밥(47%) 레몬(4%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/1f/Salmon_Oyakodon.png',
    status: [
      {
        name: '생명력',
        value: 30
      },
      {
        name: '마나',
        value: 40
      },
      {
        name: '보호',
        value: 1
      }
    ],
    index: 242,
    isCatering: true
  },
  {
    originName: 'Oyakodon',
    localName: '오야코동',
    originCookingType: 'Sous Vide',
    localCookingType: '수비드',
    originRecipe: 'Chicken(40%) Egg(20%) Steamed Rice(40%)',
    localRecipe: '닭고기(40%) 달걀(20%) 밥(40%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/c/c2/Oyakodon.png',
    status: [
      {
        name: '생명력',
        value: 30
      },
      {
        name: '마나',
        value: 40
      }
    ],
    index: 243,
    isCatering: true
  },
  {
    originName: 'Roasted Turkey',
    localName: '칠면조 구이',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Turkey(90%) Olive Oil(10%)',
    localRecipe: '칠면조(90%) 올리브유(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/4/4f/Roasted_Turkey.png',
    status: [
      {
        name: '생명력',
        value: 30
      },
      {
        name: '체력',
        value: 10
      },
      {
        name: '의지',
        value: 10
      }
    ],
    index: 244,
    isCatering: true
  },
  {
    originName: 'Seasoned Smelt',
    localName: '빙어 무침',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Fried Vegetables(60%) Smelt(40%)',
    localRecipe: '야채볶음(60%) 빙어(40%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/94/Seasoned_Smelt.png',
    status: [
      {
        name: '생명력',
        value: 20
      },
      {
        name: '체력',
        value: 5
      },
      {
        name: '의지',
        value: 15
      }
    ],
    index: 245,
    isCatering: true
  },
  {
    originName: 'Roasted Chicken',
    localName: '로스트 치킨',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Chicken Wings(73%) Thyme(18%) Salt(9%)',
    localRecipe: '닭날개(73%) 타임(18%) 소금(9%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/c/c0/Roasted_Chicken.png',
    status: [
      {
        name: '생명력',
        value: 25
      },
      {
        name: '체력',
        value: 15
      },
      {
        name: '솜씨',
        value: 2
      },
      {
        name: '의지',
        value: 8
      }
    ],
    index: 246,
    isCatering: true
  },
  {
    originName: 'Plain Yogurt',
    localName: '플레인 요거트',
    originCookingType: 'Fermenting',
    localCookingType: '발효',
    originRecipe: 'Milk(100%)',
    localRecipe: '우유(100%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/6a/Plain_Yogurt.png',
    status: [
      {
        name: '스태미나',
        value: 60
      },
      {
        name: '행운',
        value: 25
      }
    ],
    index: 247,
    isCatering: true
  },
  {
    originName: 'Halloween Wrapped Candy',
    localName: '할로윈 포장 캔디',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Halloween Pumpkin Candy(30%) Halloween Ghost Jelly(35%) Halloween Pumpkin Jelly(35%)',
    localRecipe: '할로윈 호박 사탕(30%) 할로윈 유령 젤리(35%) 할로윈 호박 젤리(35%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/83/Halloween_Wrapped_Candy.png',
    status: [
      {
        name: '생명력',
        value: 15
      }
    ],
    index: 248,
    isCatering: true
  },
  {
    originName: 'Peanut Butter Jam',
    localName: '땅콩버터잼',
    originCookingType: 'Jam Making',
    localCookingType: '잼 만들기',
    originRecipe: 'Peanuts(65%) Olive Oil(30%) Salt / Sugar(5%)',
    localRecipe: '땅콩(65%) 올리브유(30%) 소금/설탕(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/ea/Peanut_Butter_Jam.png',
    status: [
      {
        name: '스태미나',
        value: 2
      },
      {
        name: '지력',
        value: 4
      },
      {
        name: '솜씨',
        value: 5
      }
    ],
    index: 249,
    isCatering: true
  },
  {
    originName: 'Shrimp Sashimi',
    localName: '새우회',
    originCookingType: 'Julienning',
    localCookingType: '저미기',
    originRecipe: 'Shrimp(89%) Chojang(11%)',
    localRecipe: '새우(89%) 초장(11%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/b/b9/Shrimp_Sashimi.png',
    status: [
      {
        name: '생명력',
        value: 55
      },
      {
        name: '마나',
        value: 10
      },
      {
        name: '스태미나',
        value: 10
      }
    ],
    index: 250,
    isCatering: true
  },
  {
    originName: 'Pumpkin Galbi Stew',
    localName: '단호박 갈비찜',
    originCookingType: 'Steaming',
    localCookingType: '찌기',
    originRecipe: 'Sweet Pumpkin(80%) Sliced Meat(17%) Meat Marinade(3%)',
    localRecipe: '단호박(80%) 고기 조각(17%) 고기양념(3%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/d7/Pumpkin_Galbi_Stew.png',
    status: [
      {
        name: '생명력',
        value: 20
      },
      {
        name: '체력',
        value: 10
      }
    ],
    index: 251,
    isCatering: true
  },
  {
    originName: "S'more",
    localName: '스모어',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Marshmallow(48%) Chocolate Chip Cookie(52%)',
    localRecipe: '마시멜로(48%) 초코칩 쿠키(52%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/9c/S%27more.png',
    status: [
      {
        name: '생명력',
        value: 30
      },
      {
        name: '마나',
        value: 30
      },
      {
        name: '행운',
        value: 30
      }
    ],
    index: 252,
    isCatering: true
  },
  {
    originName: 'Shrimp Fried Rice',
    localName: '새우 볶음밥',
    originCookingType: 'Stir-frying',
    localCookingType: '볶기',
    originRecipe: 'Steamed Rice(65%) Shrimp(27%) Egg(8%) / Steamed Rice(72%) Shrimp(28%)',
    localRecipe: '밥(65%) 새우(27%) 달걀(8%) / 밥(72%) 새우(28%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e3/Shrimp_Fried_Rice.png',
    status: [
      {
        name: '생명력',
        value: 6
      },
      {
        name: '지력',
        value: 10
      },
      {
        name: '솜씨',
        value: 10
      },
      {
        name: '의지',
        value: 15
      }
    ],
    index: 253,
    isCatering: true
  },
  {
    originName: 'Jumbo Moon Cake',
    localName: '특대 월병',
    originCookingType: 'Pie Making',
    localCookingType: '파이 만들기',
    originRecipe: 'Large Moon Cake(80%) Bean Stuffing(12%) Peanuts(8%)',
    localRecipe: '큰 월병(80%) 팥소(12%) 땅콩(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/fb/Jumbo_Moon_Cake.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '체력',
        value: 10
      },
      {
        name: '지력',
        value: 12
      },
      {
        name: '솜씨',
        value: 10
      },
      {
        name: '보호',
        value: 1
      }
    ],
    index: 254,
    isCatering: true
  },
  {
    originName: 'Pickled Eggs',
    localName: '달걀 피클',
    originCookingType: 'Fermenting',
    localCookingType: '발효',
    originRecipe: 'Hard-Boiled Egg(71%) Vinegar(16%) Sugar(13%)',
    localRecipe: '삶은달걀(71%) 식초(16%) 설탕(13%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/7e/Pickled_Eggs.png',
    status: [
      {
        name: '생명력',
        value: 60
      },
      {
        name: '방어',
        value: 3
      },
      {
        name: '보호',
        value: 1
      }
    ],
    index: 255,
    isCatering: true
  },
  {
    originName: 'Pumpkin Seafood Stew',
    localName: '단호박 해물찜',
    originCookingType: 'Steaming',
    localCookingType: '찌기',
    originRecipe: 'Sweet Pumpkin(75%) Poulp(15%) Shrimp(10%)',
    localRecipe: '단호박(75%) 낙지(15%) 새우(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/fb/Pumpkin_Seafood_Stew.png',
    status: [
      {
        name: '마나',
        value: 15
      },
      {
        name: '지력',
        value: 15
      }
    ],
    index: 256,
    isCatering: true
  },
  {
    originName: 'Halloween Pumpkin Candy',
    localName: '할로윈 호박 사탕',
    originCookingType: 'Jam Making',
    localCookingType: '잼 만들기',
    originRecipe: 'Ripe Pumpkin(30%) Sugar(50%) Starch Syrup(20%)',
    localRecipe: '청둥호박(30%) 설탕(50%) 물엿(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/34/Halloween_Pumpkin_Candy.png',
    status: [
      {
        name: '생명력',
        value: 5
      },
      {
        name: '마나',
        value: 5
      }
    ],
    index: 257,
    isCatering: true
  },
  {
    originName: 'Reef Lobster Sashimi',
    localName: '바닷가재회',
    originCookingType: 'Julienning',
    localCookingType: '저미기',
    originRecipe: 'Reef Lobster(88%) Soy Sauce(7%) Lemon Juice(5%)',
    localRecipe: '바닷가재(88%) 간장(7%) 레몬즙(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/31/Reef_Lobster_Sashimi.png',
    status: [
      {
        name: '생명력',
        value: 50
      },
      {
        name: '체력',
        value: 35
      }
    ],
    index: 258,
    isCatering: true
  },
  {
    originName: 'Halloween Pumpkin Chocolate',
    localName: '할로윈 호박 초콜릿',
    originCookingType: 'Jam Making',
    localCookingType: '잼 만들기',
    originRecipe: 'Ripe Pumpkin(30%) Baking Chocolate(50%) Whipped Cream(20%)',
    localRecipe: '청둥호박(30%) 재료 초콜릿(50%) 생크림(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/71/Halloween_Pumpkin_Chocolate.png',
    status: [
      {
        name: '마나',
        value: 10
      }
    ],
    index: 259,
    isCatering: true
  },
  {
    originName: 'Seafood Yakisoba',
    localName: '해물 볶음우동',
    originCookingType: 'Noodle Making',
    localCookingType: '면 만들기',
    originRecipe: 'Noodle(80%) Mixed Vegetables(15%) Shellfish(5%)',
    localRecipe: '누들(80%) 야채 모둠(15%) 조개(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/ea/Seafood_Yakisoba.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '행운',
        value: 15
      }
    ],
    index: 260,
    isCatering: true
  },
  {
    originName: 'Shrimp Burger',
    localName: '새우 버거',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Bread(50%) Shrimp(25%) Cabbage(25%)',
    localRecipe: '빵(50%) 새우(25%) 양배추(25%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f9/Shrimp_Burger.png',
    status: [
      {
        name: '생명력',
        value: 50
      },
      {
        name: '마나',
        value: 50
      },
      {
        name: '스태미나',
        value: 60
      }
    ],
    index: 261,
    isCatering: true
  },
  {
    originName: 'Strawberry Whipped Cream Crepe',
    localName: '딸기 생크림 크레이프',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Crepe(45%) Strawberry(31%) Whipped Cream(24%)',
    localRecipe: '크레이프(45%) 딸기(31%) 생크림(24%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/36/Strawberry_Whipped_Cream_Crepe.png',
    status: [
      {
        name: '생명력',
        value: 20
      },
      {
        name: '마나',
        value: 30
      },
      {
        name: '지력',
        value: 30
      }
    ],
    index: 262,
    isCatering: true
  },
  {
    originName: 'Walnut Pie',
    localName: '호두 파이',
    originCookingType: 'Pie Making',
    localCookingType: '파이 만들기',
    originRecipe: 'Pan Pie Crust(45%) Walnut(45%) Butter(10%)',
    localRecipe: '파이 틀(45%) 호두(45%) 버터(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/75/Walnut_Pie.png',
    status: [
      {
        name: '마나',
        value: 23
      }
    ],
    index: 263,
    isCatering: true
  },
  {
    originName: 'Steamed Dumplings',
    localName: '찐만두',
    originCookingType: 'Steaming',
    localCookingType: '찌기',
    originRecipe: 'Wheat Flour(50%) Sliced Meat(45%) Leek(5%)',
    localRecipe: '밀가루(50%) 고기 조각(45%) 부추(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/a6/Steamed_Dumplings.png',
    status: [
      {
        name: '스태미나',
        value: 15
      }
    ],
    index: 264,
    isCatering: true
  },
  {
    originName: 'Truffle Omelet',
    localName: '트뤼프 오믈렛',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Egg(67%) White Truffle(14%) Mixed Vegetables(19%)',
    localRecipe: '달걀(67%) 송로버섯(14%) 야채 모둠(19%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/26/Truffle_Omelet.png',
    status: [
      {
        name: '스태미나',
        value: 40
      },
      {
        name: '솜씨',
        value: 30
      }
    ],
    index: 265,
    isCatering: true
  },
  {
    originName: 'Tamago Sushi',
    localName: '계란초밥',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Gyeran-mari(50%) Steamed Rice(45%) Vinegar(5%)',
    localRecipe: '계란말이(50%) 밥(45%) 식초(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/ac/Tamago_Sushi.png',
    status: [
      {
        name: '스태미나',
        value: 30
      },
      {
        name: '솜씨',
        value: 40
      },
      {
        name: '보호',
        value: 1
      }
    ],
    index: 266,
    isCatering: true
  },
  {
    originName: 'Steamed Mushroom',
    localName: '버섯찜',
    originCookingType: 'Steaming',
    localCookingType: '찌기',
    originRecipe: 'Hazelnut Mushroom(60%) Water(30%) Salt(10%)',
    localRecipe: '개암버섯(60%) 물이 든 병(30%) 소금(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/b/b3/Steamed_Mushroom.png',
    status: [
      {
        name: '생명력',
        value: 18
      },
      {
        name: '솜씨',
        value: 5
      },
      {
        name: '행운',
        value: 5
      }
    ],
    index: 267,
    isCatering: true
  },
  {
    originName: 'Simmered Chestnuts',
    localName: '삶은 밤',
    originCookingType: 'Simmering',
    localCookingType: '삶기',
    originRecipe: 'Chestnut(85%) Water(15%)',
    localRecipe: '밤(85%) 물이 든 병(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/b/b6/Simmered_Chestnuts.png',
    status: [
      {
        name: '생명력',
        value: 8
      }
    ],
    index: 268,
    isCatering: true
  },
  {
    originName: 'Simmered Cabbage',
    localName: '삶은 양배추',
    originCookingType: 'Simmering',
    localCookingType: '삶기',
    originRecipe: 'Cabbage(85%) Water(15%)',
    localRecipe: '양배추(85%) 물이 든 병(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f8/Simmered_Cabbage.png',
    status: [
      {
        name: '마나',
        value: 7
      }
    ],
    index: 269,
    isCatering: true
  },
  {
    originName: 'Water-soaked Bean Noodles',
    localName: '물에 불린 콩국수',
    originCookingType: 'Noodle Making',
    localCookingType: '면 만들기',
    originRecipe: 'Somen Noodles(75%) Water-soaked Bean Broth(25%)',
    localRecipe: '소면(75%) 물에 불린 콩물(25%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/5/56/Water-soaked_Bean_Noodles.png',
    status: [
      {
        name: '생명력',
        value: 18
      },
      {
        name: '지력',
        value: 3
      }
    ],
    index: 270,
    isCatering: true
  },
  {
    originName: 'Spicy Fish Stew',
    localName: '금은 매운탕',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Golden Scale Fish(45%) Taitinn Carp(45%) Red Pepper Powder(10%)',
    localRecipe: '금린어(45%) 은붕어(45%) 고춧가루(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/69/Spicy_Fish_Stew.png',
    status: [
      {
        name: '생명력',
        value: 35
      },
      {
        name: '체력',
        value: 15
      },
      {
        name: '지력',
        value: 10
      }
    ],
    index: 271,
    isCatering: true
  },
  {
    originName: 'Tara Deep Dish',
    localName: '타라 딥 디쉬',
    originCookingType: 'Pizza Making',
    localCookingType: '피자 만들기',
    originRecipe: 'Red Sauce Pizza Dough(40%) Block of Cheese(42%) Bell Pepper(18%)',
    localRecipe: '토마토 소스 피자 도우(40%) 커다란 치즈덩어리(42%) 파프리카(18%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/73/Tara_Deep_Dish.png',
    status: [
      {
        name: '스태미나',
        value: 40
      },
      {
        name: '지력',
        value: 25
      },
      {
        name: '보호',
        value: 1
      }
    ],
    index: 272,
    isCatering: true
  },
  {
    originName: 'Steak Pizza',
    localName: '스테이크 피자',
    originCookingType: 'Pizza Making',
    localCookingType: '피자 만들기',
    originRecipe: 'Red Sauce Pizza Dough(37%) Handmade Sirloin Ham(45%) Slice of Cheese(18%)',
    localRecipe: '토마토 소스 피자 도우(37%) 수제 등심 햄(45%) 치즈 조각(18%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f0/Steak_Pizza.png',
    status: [
      {
        name: '마나',
        value: 55
      },
      {
        name: '지력',
        value: 10
      },
      {
        name: '마법공격력',
        value: 1
      }
    ],
    index: 273,
    isCatering: true
  },
  {
    originName: 'Truffle Pie',
    localName: '트뤼프 파이',
    originCookingType: 'Pie Making',
    localCookingType: '파이 만들기',
    originRecipe: 'Pan Pie Crust(75%) White Truffle(25%)',
    localRecipe: '파이 틀(75%) 송로버섯(25%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/af/Truffle_Pie.png',
    status: [
      {
        name: '생명력',
        value: 40
      },
      {
        name: '체력',
        value: 10
      },
      {
        name: '솜씨',
        value: -17
      },
      {
        name: '행운',
        value: 8
      }
    ],
    index: 274,
    isCatering: true
  },
  {
    originName: 'Toasted Rice Cake',
    localName: '구운 떡',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'White Rice Cake(100%)',
    localRecipe: '하얀 떡(100%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/12/Toasted_Rice_Cake.png',
    status: [
      {
        name: '생명력',
        value: 15
      }
    ],
    index: 275,
    isCatering: true
  },
  {
    originName: 'Vales Fire',
    localName: '발레스 화이어',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Vales Whiskey(75%) Ice(25%)',
    localRecipe: '발레스 위스키(75%) 얼음(25%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/3f/Vales_Fire.png',
    status: [
      {
        name: '생명력',
        value: 30
      },
      {
        name: '체력',
        value: 38
      },
      {
        name: '지력',
        value: -15
      },
      {
        name: '솜씨',
        value: -15
      },
      {
        name: '행운',
        value: 25
      }
    ],
    index: 276,
    isCatering: true
  },
  {
    originName: 'Strawberry Mochi',
    localName: '딸기 찹쌀떡',
    originCookingType: 'Fermenting',
    localCookingType: '발효',
    originRecipe: 'White Rice Cake(65%) Strawberry(25%) Bean Stuffing(10%)',
    localRecipe: '하얀 떡(65%) 딸기(25%) 팥소(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f2/Strawberry_Mochi.png',
    status: [
      {
        name: '마나',
        value: 30
      },
      {
        name: '지력',
        value: 10
      },
      {
        name: '마법방어',
        value: 2
      }
    ],
    index: 277,
    isCatering: true
  },
  {
    originName: 'Spicy Chicken Pizza',
    localName: '핫치킨 피자',
    originCookingType: 'Pizza Making',
    localCookingType: '피자 만들기',
    originRecipe: 'Red Sauce Pizza Dough(42%) Chicken Wings(37%) Slice of Cheese(21%)',
    localRecipe: '토마토 소스 피자 도우(42%) 닭날개(37%) 치즈 조각(21%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/4/49/Spicy_Chicken_Pizza.png',
    status: [
      {
        name: '생명력',
        value: 30
      },
      {
        name: '마나',
        value: 30
      },
      {
        name: '스태미나',
        value: 50
      }
    ],
    index: 278,
    isCatering: true
  },
  {
    originName: 'Steamed Rice',
    localName: '밥',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Rice(60%) Water(40%)',
    localRecipe: '쌀(60%) 물이 든 병(40%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/ef/Steamed_Rice.png',
    status: [
      {
        name: '체력',
        value: 6
      },
      {
        name: '지력',
        value: 8
      },
      {
        name: '솜씨',
        value: 7
      }
    ],
    index: 279,
    isCatering: true
  },
  {
    originName: 'Shrimp Tempura Udon',
    localName: '새우튀김 우동',
    originCookingType: 'Noodle Making',
    localCookingType: '면 만들기',
    originRecipe: 'Noodle(50%) Meat Broth(45%) Fried Shrimp(5%)',
    localRecipe: '누들(50%) 육수(45%) 새우튀김(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/1a/Shrimp_Tempura_Udon.png',
    status: [
      {
        name: '생명력',
        value: 9
      },
      {
        name: '체력',
        value: -9
      },
      {
        name: '행운',
        value: 9
      }
    ],
    index: 280,
    isCatering: true
  },
  {
    originName: 'Simmered Beans',
    localName: '삶은 콩',
    originCookingType: 'Simmering',
    localCookingType: '삶기',
    originRecipe: 'Bean(85%) Water(15%)',
    localRecipe: '콩(85%) 물이 든 병(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/fd/Simmered_Beans.png',
    status: [
      {
        name: '체력',
        value: 8
      }
    ],
    index: 281,
    isCatering: true
  },
  {
    originName: 'Vegetable Pizza',
    localName: '베지터블 피자',
    originCookingType: 'Pizza Making',
    localCookingType: '피자 만들기',
    originRecipe: 'Red Sauce Pizza Dough(39%) Mixed Vegetables(44%) Slice of Cheese(17%)',
    localRecipe: '토마토 소스 피자 도우(39%) 야채 모둠(44%) 치즈 조각(17%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/c/c1/Vegetable_Pizza.png',
    status: [
      {
        name: '생명력',
        value: 55
      },
      {
        name: '스태미나',
        value: 30
      },
      {
        name: '솜씨',
        value: 30
      }
    ],
    index: 282,
    isCatering: true
  },
  {
    originName: 'Tteok-bokki',
    localName: '떡볶이',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'White Rice Cake(53%) Gochujang(17%) Meat Broth(30%)',
    localRecipe: '하얀 떡(53%) 고추장(17%) 육수(30%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/ef/Tteok-bokki.png',
    status: [
      {
        name: '스태미나',
        value: 40
      },
      {
        name: '의지',
        value: 30
      },
      {
        name: '보호',
        value: 1
      }
    ],
    index: 283,
    isCatering: true
  },
  {
    originName: 'Vegetable Soup',
    localName: '야채스프',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Fried Vegetables(53%) Whipped Cream(38%) Pepper(9%)',
    localRecipe: '야채볶음(53%) 생크림(38%) 후추(9%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/c/cd/Vegetable_Soup.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '지력',
        value: 10
      },
      {
        name: '솜씨',
        value: 10
      }
    ],
    index: 284,
    isCatering: true
  },
  {
    originName: 'Steamed Eggplants',
    localName: '가지찜',
    originCookingType: 'Steaming',
    localCookingType: '찌기',
    originRecipe: 'Eggplant(95%) Salt(2%) Garlic(3%)',
    localRecipe: '가지(95%) 소금(2%) 마늘(3%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/8a/Steamed_Eggplants.png',
    status: [
      {
        name: '마나',
        value: 10
      }
    ],
    index: 285,
    isCatering: true
  },
  {
    originName: 'Striped Marlin Steak',
    localName: '청새치 스테이크',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Striped Marlin(80%) Pepper(10%) Salt(10%)/Striped Marlin(89%) Salt(11%)',
    localRecipe: '청새치(80%) 후추(10%) 소금(10%)/청새치(89%) 소금(11%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/22/Striped_Marlin_Steak.png',
    status: [
      {
        name: '생명력',
        value: 21
      },
      {
        name: '체력',
        value: 10
      },
      {
        name: '지력',
        value: 10
      }
    ],
    index: 286,
    isCatering: true
  },
  {
    originName: 'Steamed Potato',
    localName: '삶은감자',
    originCookingType: 'Simmering',
    localCookingType: '삶기',
    originRecipe: 'Potato(41%) Water(56%) Salt(3%) or Pepper(?%)/ Potato(42%) Water(58%)',
    localRecipe: '감자(41%) 물이 든 병(56%) 소금(3%) 또는 후추(?%)/ 감자(42%) 물이 든 병(58%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/b/bd/Steamed_Potato.png',
    status: [
      {
        name: '생명력',
        value: 12
      },
      {
        name: '체력',
        value: 3
      }
    ],
    index: 287,
    isCatering: true
  },
  {
    originName: 'Umeboshi',
    localName: '우메보시',
    originCookingType: 'Fermenting',
    localCookingType: '발효',
    originRecipe: 'Green Plum(70%) Salt(15%) Sugar(15%)',
    localRecipe: '매실(70%) 소금(15%) 설탕(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/2/24/Umeboshi.png',
    status: [
      {
        name: '체력',
        value: 40
      },
      {
        name: '솜씨',
        value: 25
      },
      {
        name: '방어',
        value: 1
      }
    ],
    index: 288,
    isCatering: true
  },
  {
    originName: 'Steamed Cabbage and Beans',
    localName: '양배추 콩찜',
    originCookingType: 'Steaming',
    localCookingType: '찌기',
    originRecipe: 'Cabbage(60%) Bean(20%) Water(20%)',
    localRecipe: '양배추(60%) 콩(20%) 물이 든 병(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/93/Steamed_Cabbage_and_Beans.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '의지',
        value: 3
      }
    ],
    index: 289,
    isCatering: true
  },
  {
    originName: 'Tomato Basil Salad',
    localName: '토마토 바질 샐러드',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Tomato(50%) Basil(30%) Steamed Potato(20%)',
    localRecipe: '토마토(50%) 바질(30%) 삶은감자(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/01/Tomato_Basil_Salad.png',
    status: [
      {
        name: '지력',
        value: 5
      },
      {
        name: '솜씨',
        value: -8
      },
      {
        name: '행운',
        value: 5
      }
    ],
    index: 290,
    isCatering: true
  },
  {
    originName: 'Simmered Sweet Potato',
    localName: '삶은 고구마',
    originCookingType: 'Simmering',
    localCookingType: '삶기',
    originRecipe: 'Sweet Potato(85%) Water(15%)',
    localRecipe: '고구마(85%) 물이 든 병(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/0c/Simmered_Sweet_Potato.png',
    status: [
      {
        name: '솜씨',
        value: 8
      }
    ],
    index: 291,
    isCatering: true
  },
  {
    originName: 'Toro Sushi',
    localName: '참치뱃살초밥',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Tuna Sashimi(51%) Steamed Rice(39%) Vinegar(10%)',
    localRecipe: '참치회(51%) 밥(39%) 식초(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f7/Toro_Sushi.png',
    status: [
      {
        name: '생명력',
        value: 50
      },
      {
        name: '마나',
        value: 35
      },
      {
        name: '스태미나',
        value: 15
      },
      {
        name: '방어',
        value: 2
      }
    ],
    index: 292,
    isCatering: true
  },
  {
    originName: 'Spicy Kraken Stew',
    localName: '크라켄 매운탕',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Raw Chopped Kraken(35%) Steamed Kraken(35%) Kraken Skewer(30%)',
    localRecipe: '크라켄 탕탕이(35%) 자숙 크라켄(35%) 크라켄 호롱구이(30%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/a7/Spicy_Kraken_Stew.png',
    status: [
      {
        name: '생명력',
        value: 245
      },
      {
        name: '마나',
        value: 245
      },
      {
        name: '스태미나',
        value: 245
      }
    ],
    index: 293,
    isCatering: false
  },
  {
    originName: 'Sous Vide Galbi-jjim',
    localName: '수비드 소갈비찜',
    originCookingType: 'Sous Vide',
    localCookingType: '수비드',
    originRecipe: 'Beef(83%) Spicy Pepper(8%) Meat Marinade(9%)',
    localRecipe: '쇠고기(83%) 고추(8%) 고기양념(9%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/c/c7/Sous_Vide_Galbi-jjim.png',
    status: [
      {
        name: '생명력',
        value: 40
      },
      {
        name: '마나',
        value: 20
      },
      {
        name: '의지',
        value: 35
      }
    ],
    index: 294,
    isCatering: true
  },
  {
    originName: 'Steamed Brifne Carp',
    localName: '브리흐네 잉어 찜',
    originCookingType: 'Steaming',
    localCookingType: '찌기',
    originRecipe: 'Brifne Carp(75%) Water(17%) Salt(8%)',
    localRecipe: '브리흐네 잉어(75%) 물이 든 병(17%) 소금(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/db/Steamed_Brifne_Carp.png',
    status: [
      {
        name: '생명력',
        value: 12
      },
      {
        name: '체력',
        value: 6
      }
    ],
    index: 295,
    isCatering: true
  },
  {
    originName: 'Sliced Bread',
    localName: '식빵',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Flour Dough(85%) Butter(15%)',
    localRecipe: '밀가루 빵 반죽(85%) 버터(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e7/Sliced_Bread.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '의지',
        value: 3
      }
    ],
    index: 296,
    isCatering: true
  },
  {
    originName: 'Trout Sashimi',
    localName: '송어회',
    originCookingType: 'Julienning',
    localCookingType: '저미기',
    originRecipe: 'Rainbow Trout(87%) Chojang(13%)',
    localRecipe: '무지개 송어(87%) 초장(13%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/87/Trout_Sashimi.png',
    status: [
      {
        name: '스태미나',
        value: 75
      },
      {
        name: '마법보호',
        value: 1
      }
    ],
    index: 297,
    isCatering: true
  },
  {
    originName: 'Thyme Tea',
    localName: '타임티',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Water(90%) Thyme(10%)',
    localRecipe: '물이 든 병(90%) 타임(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/3d/Thyme_Tea.png',
    status: [
      {
        name: '생명력',
        value: 10
      },
      {
        name: '의지',
        value: 10
      },
      {
        name: '행운',
        value: 10
      }
    ],
    index: 298,
    isCatering: true
  },
  {
    originName: 'White Rice Cake',
    localName: '하얀 떡',
    originCookingType: 'Steaming',
    localCookingType: '찌기',
    originRecipe: 'Rice(90%) Water(10%)',
    localRecipe: '쌀(90%) 물이 든 병(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/5/50/White_Rice_Cake.png',
    status: [
      {
        name: '생명력',
        value: 12
      }
    ],
    index: 299,
    isCatering: true
  },
  {
    originName: 'Tofu Noodles C',
    localName: '두부국수',
    originCookingType: 'Noodle Making',
    localCookingType: '면 만들기',
    originRecipe: 'Somen Noodles(43%) Mashed Water-soaked Bean Flour Tofu(17%) Meat Broth(40%)',
    localRecipe: '소면(43%) 뭉개진 물에 불린 콩가루 두부(17%) 육수(40%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e4/Tofu_Noodles.png',
    status: [
      {
        name: '생명력',
        value: 40
      },
      {
        name: '체력',
        value: -30
      }
    ],
    index: 300,
    isCatering: true
  },
  {
    originName: 'Spaghetti Aglio e Olio',
    localName: '알리오 올리오',
    originCookingType: 'Pasta Making',
    localCookingType: '파스타 만들기',
    originRecipe: 'Long Pasta(80%) Olive Oil(5%) Garlic(15%)',
    localRecipe: '롱 파스타(80%) 올리브유(5%) 마늘(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/3c/Spaghetti_Aglio_e_Olio.png',
    status: [
      {
        name: '생명력',
        value: -10
      },
      {
        name: '마나',
        value: 17
      }
    ],
    index: 301,
    isCatering: true
  },
  {
    originName: 'Spaghetti alle Vongole',
    localName: '봉골레',
    originCookingType: 'Pasta Making',
    localCookingType: '파스타 만들기',
    originRecipe: 'Short Pasta(80%) Shellfish(18%) Olive Oil(2%)',
    localRecipe: '쇼트 파스타(80%) 조개(18%) 올리브유(2%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/fe/Spaghetti_alle_Vongole.png',
    status: [
      {
        name: '생명력',
        value: 20
      },
      {
        name: '지력',
        value: -20
      }
    ],
    index: 302,
    isCatering: true
  },
  {
    originName: 'Strip Steak',
    localName: '채끝살 스테이크',
    originCookingType: 'Sous Vide',
    localCookingType: '수비드',
    originRecipe: 'Beef(76%) Fried Vegetables(15%) Worcestershire Sauce(9%)',
    localRecipe: '쇠고기(76%) 야채볶음(15%) 우스터 소스(9%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/9e/Strip_Steak.png',
    status: [
      {
        name: '생명력',
        value: 35
      },
      {
        name: '최대대미지',
        value: 1
      }
    ],
    index: 303,
    isCatering: true
  },
  {
    originName: 'Triple Hotcakes',
    localName: '핫 케이크',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Wheat Flour(75%) Sugar(17%) Milk(8%)',
    localRecipe: '밀가루(75%) 설탕(17%) 우유(8%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/87/Triple_Hotcakes.png',
    status: [
      {
        name: '행운',
        value: 21
      }
    ],
    index: 304,
    isCatering: true
  },
  {
    originName: 'Tuna Sashimi',
    localName: '참치회',
    originCookingType: 'Julienning',
    localCookingType: '저미기',
    originRecipe: 'Yellowfin Tuna(91%) Chojang(9%)',
    localRecipe: '황다랑어(91%) 초장(9%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/8/80/Tuna_Sashimi.png',
    status: [
      {
        name: '생명력',
        value: 15
      },
      {
        name: '마나',
        value: 50
      },
      {
        name: '스태미나',
        value: 20
      }
    ],
    index: 305,
    isCatering: true
  },
  {
    originName: 'Warm Hot Spring Egg',
    localName: '따뜻한 온천 달걀',
    originCookingType: 'Sous Vide',
    localCookingType: '수비드',
    originRecipe: 'Egg(86%) Water(10%) Soy Sauce(4%)',
    localRecipe: '달걀(86%) 물이 든 병(10%) 간장(4%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/a8/Warm_Hot_Spring_Egg.png',
    status: [
      {
        name: '마나',
        value: 30
      },
      {
        name: '솜씨',
        value: 55
      },
      {
        name: '행운',
        value: 25
      }
    ],
    index: 306,
    isCatering: true
  },
  {
    originName: 'Tomato Egg Stir-Fry',
    localName: '토마토 달걀 볶음',
    originCookingType: 'Stir-frying',
    localCookingType: '볶기',
    originRecipe: 'Tomato(56%) Egg(35%) Pepper(9%)',
    localRecipe: '토마토(56%) 달걀(35%) 후추(9%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e0/Tomato_Egg_Stir-Fry.png',
    status: [
      {
        name: '솜씨',
        value: 35
      },
      {
        name: '마법방어',
        value: 1
      }
    ],
    index: 307,
    isCatering: true
  },
  {
    originName: 'Steamed Trout',
    localName: '송어찜',
    originCookingType: 'Steaming',
    localCookingType: '찌기',
    originRecipe: 'Rainbow Trout(54%) Water(37%) Thyme(9%)',
    localRecipe: '무지개 송어(54%) 물이 든 병(37%) 타임(9%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f8/Steamed_Trout.png',
    status: [
      {
        name: '생명력',
        value: 22
      },
      {
        name: '지력',
        value: 7
      },
      {
        name: '솜씨',
        value: 5
      },
      {
        name: '행운',
        value: 5
      }
    ],
    index: 308,
    isCatering: true
  },
  {
    originName: 'Taffy Stick',
    localName: '가락엿',
    originCookingType: 'Jam Making',
    localCookingType: '잼 만들기',
    originRecipe: 'Malt(73%) Water(20%) Rice(7%)',
    localRecipe: '엿기름(73%) 물이 든 병(20%) 쌀(7%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/4/48/Taffy_Stick.png',
    status: [
      {
        name: '체력',
        value: 15
      }
    ],
    index: 309,
    isCatering: true
  },
  {
    originName: 'Steamed Corn',
    localName: '찐 옥수수',
    originCookingType: 'Simmering',
    localCookingType: '삶기',
    originRecipe: 'Corn(80%) Water(20%)',
    localRecipe: '옥수수(80%) 물이 든 병(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/1e/Steamed_Corn.png',
    status: [
      {
        name: '생명력',
        value: 40
      },
      {
        name: '체력',
        value: 20
      },
      {
        name: '지력',
        value: 8
      },
      {
        name: '솜씨',
        value: 8
      },
      {
        name: '의지',
        value: 10
      }
    ],
    index: 310,
    isCatering: true
  },
  {
    originName: 'Weekend Warrior Hotwings and Beer',
    localName: '불금 반반 치맥 세트',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Fried Chicken(36%) Spicy Fried Chicken(36%) Highball(28%)',
    localRecipe: '프라이드 치킨(36%) 양념 치킨(36%) 하이볼(28%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/5/5b/Weekend_Warrior_Hotwings_and_Beer.png',
    status: [
      {
        name: '지력',
        value: 50
      },
      {
        name: '행운',
        value: 30
      },
      {
        name: '마법공격력',
        value: 5
      },
      {
        name: '보호',
        value: 2
      }
    ],
    index: 311,
    isCatering: true
  },
  {
    originName: 'Tara Sausage Sandwich',
    localName: '타라 소시지 샌드위치',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Garlic Bread(35%) Sausage(35%) Cabbage(30%)',
    localRecipe: '마늘빵(35%) 소시지(35%) 양배추(30%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/b/b1/Tara_Sausage_Sandwich.png',
    status: [
      {
        name: '지력',
        value: 10
      },
      {
        name: '솜씨',
        value: 10
      }
    ],
    index: 312,
    isCatering: true
  },
  {
    originName: 'Spicy Red Sea Bream Stew',
    localName: '참돔 매운탕',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Red Sea Bream(60%) Water(30%) Red Pepper Powder(10%)',
    localRecipe: '참돔(60%) 물이 든 병(30%) 고춧가루(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/ab/Spicy_Red_Sea_Bream_Stew.png',
    status: [
      {
        name: '체력',
        value: 12
      },
      {
        name: '지력',
        value: 8
      },
      {
        name: '솜씨',
        value: 10
      },
      {
        name: '의지',
        value: 15
      },
      {
        name: '행운',
        value: 8
      }
    ],
    index: 313,
    isCatering: true
  },
  {
    originName: 'Steamed Egg Casserole',
    localName: '계란찜',
    originCookingType: 'Steaming',
    localCookingType: '찌기',
    originRecipe: 'Egg(88%) Water(11%) Salt(1%)',
    localRecipe: '달걀(88%) 물이 든 병(11%) 소금(1%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/c/c3/Steamed_Egg_Casserole.png',
    status: [
      {
        name: '생명력',
        value: 7
      },
      {
        name: '행운',
        value: 9
      }
    ],
    index: 314,
    isCatering: true
  },
  {
    originName: 'Tofu Noodles B',
    localName: '두부국수',
    originCookingType: 'Noodle Making',
    localCookingType: '면 만들기',
    originRecipe: 'Somen Noodles(43%) Mashed Peeled Bean Flour Tofu(17%) Meat Broth(40%)',
    localRecipe: '소면(43%) 뭉개진 껍질 벗긴 콩가루 두부(17%) 육수(40%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e4/Tofu_Noodles.png',
    status: [
      {
        name: '생명력',
        value: 40
      },
      {
        name: '체력',
        value: -30
      }
    ],
    index: 315,
    isCatering: true
  },
  {
    originName: 'Vegetable Canape',
    localName: '배지터블 카나페',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Steamed Potato(40%) Carrot(50%) Lemon(10%)',
    localRecipe: '삶은감자(40%) 당근(50%) 레몬(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/6/6e/Vegetable_Canape.png',
    status: [
      {
        name: '생명력',
        value: 25
      },
      {
        name: '솜씨',
        value: -9
      },
      {
        name: '행운',
        value: 12
      }
    ],
    index: 316,
    isCatering: true
  },
  {
    originName: 'Truffle Cream Gnocchi',
    localName: '트뤼프 크림 뇨키',
    originCookingType: 'Stir-frying',
    localCookingType: '볶기',
    originRecipe: 'Steamed Potato(40%) Cream Sauce(40%) White Truffle(20%)',
    localRecipe: '삶은감자(40%) 크림소스(40%) 송로버섯(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/1a/Truffle_Cream_Gnocchi.png',
    status: [
      {
        name: '지력',
        value: 35
      },
      {
        name: '마법공격력',
        value: 1
      }
    ],
    index: 317,
    isCatering: true
  },
  {
    originName: 'Simmered Octopus',
    localName: '삶은 문어',
    originCookingType: 'Simmering',
    localCookingType: '삶기',
    originRecipe: 'Octopus(85%) Water(15%)',
    localRecipe: '문어(85%) 물이 든 병(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/d2/Simmered_Octopus.png',
    status: [
      {
        name: '스태미나',
        value: 8
      }
    ],
    index: 318,
    isCatering: true
  },
  {
    originName: 'Taitinn Carp Brochette',
    localName: '은붕어 꼬치구이',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Taitinn Carp(70%) Thyme(20%) Lemon(10%)',
    localRecipe: '은붕어(70%) 타임(20%) 레몬(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/98/Taitinn_Carp_Brochette.png',
    status: [
      {
        name: '생명력',
        value: 20
      },
      {
        name: '체력',
        value: 14
      }
    ],
    index: 319,
    isCatering: true
  },
  {
    originName: 'Unagi Sushi',
    localName: '장어초밥',
    originCookingType: 'Mixing',
    localCookingType: '혼합',
    originRecipe: 'Eel Sashimi(59%) Steamed Rice(31%) Vinegar(10%)',
    localRecipe: '장어회(59%) 밥(31%) 식초(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/09/Unagi_Sushi.png',
    status: [
      {
        name: '생명력',
        value: 50
      },
      {
        name: '마나',
        value: 35
      },
      {
        name: '스태미나',
        value: 35
      },
      {
        name: '방어',
        value: 1
      }
    ],
    index: 320,
    isCatering: true
  },
  {
    originName: 'Tofu Steak',
    localName: '두부 스테이크',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Magic Bean Tofu(80%) Olive Oil(10%) Worcestershire Sauce(10%)',
    localRecipe: '마법 콩 두부(80%) 올리브유(10%) 우스터 소스(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/5/5e/Tofu_Steak.png',
    status: [
      {
        name: '마나',
        value: 40
      },
      {
        name: '마법공격력',
        value: 1
      },
      {
        name: '마법방어',
        value: 1
      },
      {
        name: '마법보호',
        value: 1
      }
    ],
    index: 321,
    isCatering: true
  },
  {
    originName: 'Spicy Ramen',
    localName: '매운 라면',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Somen Noodles(43%) Water(40%) Spicy Pepper(17%)',
    localRecipe: '소면(43%) 물이 든 병(40%) 매운 고추(17%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/4/4e/Spicy_Ramen.png',
    status: [
      {
        name: '마나',
        value: 50
      },
      {
        name: '행운',
        value: 30
      }
    ],
    index: 322,
    isCatering: true
  },
  {
    originName: 'Turkey Tetrazzini',
    localName: '칠면조 테트라치니',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Turkey(40%) White Truffle(20%) Cream Farfalle(40%)',
    localRecipe: '칠면조(40%) 송로버섯(20%) 크림 파르팔레(40%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/0/05/Turkey_Tetrazzini.png',
    status: [
      {
        name: '스태미나',
        value: 30
      },
      {
        name: '체력',
        value: 10
      }
    ],
    index: 323,
    isCatering: true
  },
  {
    originName: 'Vegetable Steamed Chicken',
    localName: '야채찜닭',
    originCookingType: 'Steaming',
    localCookingType: '찌기',
    originRecipe: 'Chicken(75%) Mixed Vegetables(20%) Meat Marinade(5%)',
    localRecipe: '닭고기(75%) 야채 모둠(20%) 고기양념(5%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/ef/Vegetable_Steamed_Chicken.png',
    status: [
      {
        name: '스태미나',
        value: 15
      },
      {
        name: '의지',
        value: 15
      }
    ],
    index: 324,
    isCatering: true
  },
  {
    originName: 'Smoked Sunfish',
    localName: '훈제 개복치',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Sunfish(80%) Pepper(10%) Salt(10%)',
    localRecipe: '개복치(80%) 후추(10%) 소금(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e1/Smoked_Sunfish.png',
    status: [
      {
        name: '스태미나',
        value: 24
      },
      {
        name: '체력',
        value: 10
      },
      {
        name: '솜씨',
        value: 10
      }
    ],
    index: 325,
    isCatering: true
  },
  {
    originName: 'Sweet Potato Pizza',
    localName: '스위트 포테이토 피자',
    originCookingType: 'Pizza Making',
    localCookingType: '피자 만들기',
    originRecipe: 'Plain Pizza Dough(40%)Sweet Potato(36%)Slice of Cheese(24%)',
    localRecipe: '담백한 피자 도우(40%)고구마(36%)치즈 조각(24%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/a/aa/Sweet_Potato_Pizza.png',
    status: [
      {
        name: '마나',
        value: 60
      },
      {
        name: '솜씨',
        value: 10
      }
    ],
    index: 326,
    isCatering: true
  },
  {
    originName: 'Strawberry Shortcake',
    localName: '딸기 쇼트ㅔ익',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Flour Dough(35%) Strawberry(35%) Whipped Cream(30%)',
    localRecipe: '밀가루 빵 반죽(35%) 딸기(35%) 생크림(30%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/97/Strawberry_Shortcake.png',
    status: [
      {
        name: '생명력',
        value: 45
      },
      {
        name: '마나',
        value: 45
      },
      {
        name: '행운',
        value: 50
      }
    ],
    index: 327,
    isCatering: true
  },
  {
    originName: 'Sweet Potato Pie',
    localName: '고구마 파이',
    originCookingType: 'Pie Making',
    localCookingType: '파이 만들기',
    originRecipe: 'Pan Pie Crust(35%) Sweet Potato(55%) Egg(10%)',
    localRecipe: '파이 틀(35%) 고구마(55%) 달걀(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/b/bc/Sweet_Potato_Pie.png',
    status: [
      {
        name: '생명력',
        value: 12
      },
      {
        name: '의지',
        value: 5
      }
    ],
    index: 328,
    isCatering: true
  },
  {
    originName: 'Sous Vide Pasta Aglio e Olio',
    localName: '수비드 오일 파스타',
    originCookingType: 'Sous Vide',
    localCookingType: '수비드',
    originRecipe: 'Long Pasta(79%) Olive Oil(9%) Fan Mussel(12%)',
    localRecipe: '롱 파스타(79%) 올리브유(9%) 키조개(12%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/9/98/Sous_Vide_Pasta_Aglio_e_Olio.png',
    status: [
      {
        name: '생명력',
        value: 40
      },
      {
        name: '체력',
        value: 25
      },
      {
        name: '방어',
        value: 4
      }
    ],
    index: 329,
    isCatering: true
  },
  {
    originName: 'Spicy Fried Kraken',
    localName: '타바스코 프라이드 크라켄',
    originCookingType: 'Deep-frying',
    localCookingType: '튀기기',
    originRecipe: 'Kraken Leg Meat(75%) Fry Batter(15%) Lemon(10%)',
    localRecipe: '크라켄 다리살(75%) 튀김옷(15%) 레몬(10%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/11/Spicy_Fried_Kraken.png',
    status: [
      {
        name: '보호',
        value: 4
      },
      {
        name: '마법보호',
        value: 4
      }
    ],
    index: 330,
    isCatering: false
  },
  {
    originName: 'Toast',
    localName: '토스트',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Sliced Bread(79%) Butter(21%)',
    localRecipe: '식빵(79%) 버터(21%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/3/32/Toast.png',
    status: [
      {
        name: '생명력',
        value: 30
      },
      {
        name: '체력',
        value: 3
      }
    ],
    index: 331,
    isCatering: true
  },
  {
    originName: 'Sweet Potato Fries',
    localName: '고구마 튀김',
    originCookingType: 'Deep-frying',
    localCookingType: '튀기기',
    originRecipe: 'Sweet Potato(75%) Fry Batter(25%)',
    localRecipe: '고구마(75%) 튀김옷(25%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/c/c3/Sweet_Potato_Fries.png',
    status: [
      {
        name: '솜씨',
        value: 15
      },
      {
        name: '행운',
        value: 15
      }
    ],
    index: 332,
    isCatering: true
  },
  {
    originName: 'Spicy Fried Chicken',
    localName: '양념 치킨',
    originCookingType: 'Stir-frying',
    localCookingType: '볶기',
    originRecipe: 'Fried Chicken(72%) Starch Syrup(10%) Gochujang(18%)',
    localRecipe: '후라이드 치킨(72%) 물엿(10%) 고추장(18%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/1/11/Spicy_Fried_Chicken.png',
    status: [
      {
        name: '생명력',
        value: 40
      },
      {
        name: '마나',
        value: 40
      },
      {
        name: '보호',
        value: 1
      }
    ],
    index: 333,
    isCatering: true
  },
  {
    originName: 'Tofu Noodles A',
    localName: '두부국수',
    originCookingType: 'Noodle Making',
    localCookingType: '면 만들기',
    originRecipe: 'Somen Noodles(43%) Mashed Roasted Bean Flour Tofu(17%) Meat Broth(40%)',
    localRecipe: '소면(43%) 뭉개진 구운 콩가루 두부(17%) 육수(40%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/e/e4/Tofu_Noodles.png',
    status: [
      {
        name: '생명력',
        value: 40
      },
      {
        name: '체력',
        value: -30
      }
    ],
    index: 334,
    isCatering: true
  },
  {
    originName: 'Strawberry Yogurt',
    localName: '딸기 요거트',
    originCookingType: 'Fermenting',
    localCookingType: '발효',
    originRecipe: 'Milk(78%) Strawberry Jam(22%)',
    localRecipe: '우유(78%) 딸기잼(22%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/5/52/Strawberry_Yogurt.png',
    status: [
      {
        name: '생명력',
        value: 65
      },
      {
        name: '의지',
        value: 25
      },
      {
        name: '방어',
        value: 2
      }
    ],
    index: 335,
    isCatering: true
  },
  {
    originName: 'Sturgeon Steak',
    localName: '철갑상어 스테이크',
    originCookingType: 'Baking',
    localCookingType: '굽기',
    originRecipe: 'Sturgeon(81%) Pepper(14%) Lemon(5%) / Sturgeon(85%) Pepper(15%)',
    localRecipe: '철갑상어(81%) 고추(14%) 레몬(5%) / 철갑상어(85%) 후추(15%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/7/7c/Sturgeon_Steak.png',
    status: [
      {
        name: '생명력',
        value: 45
      },
      {
        name: '체력',
        value: 10
      },
      {
        name: '의지',
        value: 20
      }
    ],
    index: 336,
    isCatering: true
  },
  {
    originName: 'Taitinn Carp Stew',
    localName: '은붕어 스튜',
    originCookingType: 'Boiling',
    localCookingType: '끓이기',
    originRecipe: 'Taitinn Carp(56%) Potato(33%) Garlic(11%)',
    localRecipe: '은붕어(56%) 감자(33%) 마늘(11%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/d/d4/Taitinn_Carp_Stew.png',
    status: [
      {
        name: '생명력',
        value: 16
      },
      {
        name: '의지',
        value: 9
      }
    ],
    index: 337,
    isCatering: true
  },
  {
    originName: '',
    localName: '방울토마토 주스',
    originCookingType: '',
    localCookingType: '혼합',
    originRecipe: '',
    localRecipe: '방울토마토(80%) 물이 든 병(20%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f4/Cooking.png',
    status: [
      {
        name: '체력',
        value: 5
      },
      {
        name: '행운',
        value: 5
      }
    ],
    index: 338,
    isCatering: true
  },
  {
    originName: '',
    localName: '방울토마토 치즈 치아바타',
    originCookingType: '',
    localCookingType: '혼합',
    originRecipe: '',
    localRecipe: '방울토마토(30%) 치즈 조각(20%) 식빵(50%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f4/Cooking.png',
    status: [
      {
        name: '마법방어',
        value: 1
      },
      {
        name: '마법보호',
        value: 1
      },
      {
        name: '마법공격력',
        value: 3
      }
    ],
    index: 339,
    isCatering: true
  },
  {
    originName: '',
    localName: '방울토마토 스파게티',
    originCookingType: '',
    localCookingType: '끓이기',
    originRecipe: '',
    localRecipe: '방울토마토(30%) 롱 파스타(70%)',
    thumbnail: 'https://wiki.mabinogiworld.com/images/f/f4/Cooking.png',
    status: [
      {
        name: '방어',
        value: 1
      },
      {
        name: '보호',
        value: 1
      },
      {
        name: '최대대미지',
        value: 1
      }
    ],
    index: 340,
    isCatering: true
  }
]

const checkCookings =
    [
      {
        localName: '로나의 특제 도시락',
        status: [
          { name: '최대대미지', value: 1 },
          { name: '마법공격력', value: 1 },
          { name: '보호', value: 2 },
          { name: '마법보호', value: 2 },
          { name: '방어', value: 5 },
          { name: '마법방어', value: 5 }
        ]
      },
      {
        localName: '애프터눈 티 세트',
        status: [
          { name: '최대대미지', value: 3 },
          { name: '체력', value: 30 },
          { name: '의지', value: 50 },
          { name: '마법보호', value: 2 }
        ]
      },
      {
        localName: '달걀 피클',
        status: [
          { name: '보호', value: 1 },
          { name: '생명력', value: 60 },
          { name: '방어', value: 3 }
        ]
      },
      {
        localName: '드래곤 블러드 화이트 와인',
        status: [
          { name: '마나', value: 300 },
          { name: '솜씨', value: 100 },
          { name: '지력', value: 100 },
          { name: '행운', value: 100 }
        ]
      },
      {
        localName: '새우 버거',
        status: [
          { name: '생명력', value: 50 },
          { name: '마나', value: 50 },
          { name: '스태미나', value: 60 }
        ]
      },
      {
        localName: '치킨 버거',
        status: [
          { name: '생명력', value: 50 },
          { name: '마나', value: 50 },
          { name: '스태미나', value: 60 }
        ]
      },
      {
        localName: '베이컨 버거',
        status: [
          { name: '생명력', value: 50 },
          { name: '마나', value: 50 },
          { name: '스태미나', value: 60 }
        ]
      },
      {
        localName: '까맣게 구워진 드래곤 심장',
        status: [
          { name: '생명력', value: 300 },
          { name: '마나', value: 300 },
          { name: '스태미나', value: 300 }
        ]
      },
      {
        localName: '치즈 버거',
        status: [
          { name: '생명력', value: 50 },
          { name: '마나', value: 50 },
          { name: '스태미나', value: 60 }
        ]
      },
      {
        localName: '육회',
        status: [{ name: '생명력', value: 65 }, { name: '솜씨', value: 15 }]
      },
      {
        localName: '챔피언 요리',
        status: [
          { name: '생명력', value: 100 },
          { name: '마나', value: 100 },
          { name: '스태미나', value: 100 },
          { name: '체력', value: 60 },
          { name: '솜씨', value: 60 },
          { name: '의지', value: 60 },
          { name: '지력', value: 60 },
          { name: '행운', value: 60 }
        ]
      },
      {
        localName: '닭가슴살 샐러드',
        status: [
          { name: '마나', value: 50 },
          { name: '지력', value: 25 },
          { name: '마법보호', value: 1 }
        ]
      },
      {
        localName: '떡볶이',
        status: [
          { name: '보호', value: 1 },
          { name: '스태미나', value: 40 },
          { name: '의지', value: 30 }
        ]
      },
      {
        localName: '플레인 요거트',
        status: [{ name: '스태미나', value: 60 }, { name: '행운', value: 25 }]
      },
      {
        localName: '고추장 찌개',
        status: [
          { name: '생명력', value: 40 },
          { name: '체력', value: 35 },
          { name: '방어', value: 1 }
        ]
      },
      {
        localName: '모둠회국수',
        status: [
          { name: '보호', value: 1 },
          { name: '체력', value: 55 },
          { name: '지력', value: 35 },
          { name: '방어', value: 8 }
        ]
      },
      {
        localName: '갈치회국수',
        status: [
          { name: '생명력', value: 30 },
          { name: '솜씨', value: 40 },
          { name: '행운', value: 25 }
        ]
      },
      {
        localName: '오이 피클',
        status: [
          { name: '마나', value: 60 },
          { name: '마법보호', value: 1 },
          { name: '마법방어', value: 2 }
        ]
      },
      {
        localName: '스모어',
        status: [
          { name: '생명력', value: 30 },
          { name: '마나', value: 30 },
          { name: '행운', value: 30 }
        ]
      },
      {
        localName: '아이리쉬 스튜',
        status: [{ name: '스태미나', value: 40 }, { name: '행운', value: 25 }]
      },
      {
        localName: '쩍쩍 붙을 거야! 엿다발',
        status: [{ name: '생명력', value: 100 }, { name: '방어', value: 5 }]
      },
      {
        localName: '클로버 새싹 샐러드',
        status: [
          { name: '생명력', value: 100 },
          { name: '체력', value: 40 },
          { name: '지력', value: 40 },
          { name: '방어', value: 5 }
        ]
      },
      {
        localName: '슈바인스학세',
        status: [
          { name: '스태미나', value: 25 },
          { name: '체력', value: 45 },
          { name: '의지', value: 35 }
        ]
      },
      {
        localName: '두부 스테이크',
        status: [
          { name: '마법공격력', value: 1 },
          { name: '마나', value: 40 },
          { name: '마법보호', value: 1 },
          { name: '마법방어', value: 1 }
        ]
      },
      {
        localName: '청어 소금 구이',
        status: [{ name: '스태미나', value: 35 }, { name: '솜씨', value: 15 }]
      },
      {
        localName: '계란말이',
        status: [{ name: '체력', value: 10 }, { name: '의지', value: 25 }]
      },
      {
        localName: '트뤼프 오믈렛',
        status: [{ name: '스태미나', value: 40 }, { name: '솜씨', value: 30 }]
      },
      {
        localName: '장어회',
        status: [
          { name: '생명력', value: 10 },
          { name: '스태미나', value: 55 },
          { name: '솜씨', value: 10 }
        ]
      },
      {
        localName: '슈하스코',
        status: [{ name: '생명력', value: 50 }, { name: '방어', value: 4 }]
      },
      {
        localName: '고추장 돼지불고기',
        status: [
          { name: '마나', value: 30 },
          { name: '의지', value: 50 },
          { name: '지력', value: 15 }
        ]
      },
      { localName: '구운 파인애플', status: [{ name: '행운', value: 10 }] },
      {
        localName: '파인애플 베이컨 꼬치',
        status: [
          { name: '생명력', value: 25 },
          { name: '마나', value: 25 },
          { name: '행운', value: 30 }
        ]
      },
      {
        localName: '매실차',
        status: [{ name: '생명력', value: 35 }, { name: '지력', value: 35 }]
      },
      {
        localName: '벌꿀 요거트',
        status: [
          { name: '마나', value: 55 },
          { name: '스태미나', value: 15 },
          { name: '지력', value: 25 }
        ]
      },
      {
        localName: '딸기 요거트',
        status: [
          { name: '생명력', value: 65 },
          { name: '의지', value: 25 },
          { name: '방어', value: 2 }
        ]
      },
      {
        localName: '탱글탱글 커스터드 푸딩',
        status: [
          { name: '마나', value: 10 },
          { name: '스태미나', value: 30 },
          { name: '솜씨', value: 30 },
          { name: '지력', value: 20 }
        ]
      },
      {
        localName: '버섯 장조림',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 10 },
          { name: '지력', value: 20 }
        ]
      },
      {
        localName: '오야코동',
        status: [{ name: '생명력', value: 30 }, { name: '마나', value: 40 }]
      },
      {
        localName: '연어 오야코동',
        status: [
          { name: '보호', value: 1 },
          { name: '생명력', value: 30 },
          { name: '마나', value: 40 }
        ]
      },
      {
        localName: '수비드 오일 파스타',
        status: [
          { name: '생명력', value: 40 },
          { name: '체력', value: 25 },
          { name: '방어', value: 4 }
        ]
      },
      {
        localName: '매실청',
        status: [{ name: '생명력', value: 10 }, { name: '체력', value: 10 }]
      },
      {
        localName: '새우회',
        status: [
          { name: '생명력', value: 55 },
          { name: '마나', value: 10 },
          { name: '스태미나', value: 10 }
        ]
      },
      {
        localName: '참치회',
        status: [
          { name: '생명력', value: 15 },
          { name: '마나', value: 50 },
          { name: '스태미나', value: 20 }
        ]
      },
      {
        localName: '연어회',
        status: [
          { name: '보호', value: 1 },
          { name: '생명력', value: 20 },
          { name: '마나', value: 55 },
          { name: '방어', value: 3 }
        ]
      },
      {
        localName: '갈치회',
        status: [
          { name: '마나', value: 45 },
          { name: '행운', value: 10 },
          { name: '마법방어', value: 2 }
        ]
      },
      {
        localName: '복어회',
        status: [
          { name: '보호', value: 1 },
          { name: '마나', value: 40 },
          { name: '의지', value: 30 }
        ]
      },
      {
        localName: '송어회',
        status: [{ name: '스태미나', value: 75 }, { name: '마법보호', value: 1 }]
      },
      {
        localName: '바닷가재회',
        status: [{ name: '생명력', value: 50 }, { name: '체력', value: 35 }]
      },
      {
        localName: '돼지 보쌈',
        status: [
          { name: '생명력', value: 35 },
          { name: '마나', value: 15 },
          { name: '방어', value: 1 },
          { name: '마법방어', value: 2 }
        ]
      },
      {
        localName: '고등어 조림',
        status: [
          { name: '생명력', value: 25 },
          { name: '체력', value: 30 },
          { name: '솜씨', value: 15 }
        ]
      },
      {
        localName: '수비드 소갈비찜',
        status: [
          { name: '생명력', value: 40 },
          { name: '마나', value: 20 },
          { name: '의지', value: 35 }
        ]
      },
      {
        localName: '블루베리 요거트',
        status: [
          { name: '마나', value: 65 },
          { name: '솜씨', value: 25 },
          { name: '방어', value: 2 }
        ]
      },
      {
        localName: '사우어크라우트',
        status: [
          { name: '마나', value: 45 },
          { name: '지력', value: 30 },
          { name: '마법방어', value: 1 }
        ]
      },
      {
        localName: '우메보시',
        status: [
          { name: '체력', value: 40 },
          { name: '솜씨', value: 25 },
          { name: '방어', value: 1 }
        ]
      },
      {
        localName: '하우카르틀',
        status: [{ name: '스태미나', value: 10 }, { name: '의지', value: 100 }]
      },
      {
        localName: '낫토',
        status: [
          { name: '생명력', value: 55 },
          { name: '스태미나', value: 25 },
          { name: '체력', value: 30 },
          { name: '방어', value: 2 }
        ]
      },
      {
        localName: '파인애플 볶음밥',
        status: [
          { name: '보호', value: 1 },
          { name: '생명력', value: 60 },
          { name: '마법보호', value: 1 }
        ]
      },
      {
        localName: '풀드포크 샌드위치',
        status: [{ name: '마법공격력', value: 1 }, { name: '마나', value: 45 }]
      },
      {
        localName: '촉촉한 연어 스테이크',
        status: [
          { name: '스태미나', value: 25 },
          { name: '의지', value: 30 },
          { name: '마법방어', value: 3 }
        ]
      },
      {
        localName: '따끈한 온천 달걀',
        status: [
          { name: '마나', value: 30 },
          { name: '솜씨', value: 55 },
          { name: '행운', value: 25 }
        ]
      },
      {
        localName: '채끝살 스테이크',
        status: [{ name: '최대대미지', value: 1 }, { name: '생명력', value: 35 }]
      },
      {
        localName: '수제 등심 햄',
        status: [{ name: '스태미나', value: 65 }, { name: '방어', value: 3 }]
      },
      {
        localName: '고등어 카레 구이',
        status: [
          { name: '스태미나', value: 45 },
          { name: '솜씨', value: 15 },
          { name: '지력', value: 30 }
        ]
      },
      {
        localName: '닭가슴살 유린기',
        status: [
          { name: '체력', value: 35 },
          { name: '행운', value: 20 },
          { name: '방어', value: 3 }
        ]
      },
      {
        localName: '문어숙회',
        status: [
          { name: '마나', value: 45 },
          { name: '스태미나', value: 25 },
          { name: '방어', value: 3 }
        ]
      },
      {
        localName: '소시지',
        status: [{ name: '생명력', value: 18 }, { name: '체력', value: 6 }]
      },
      {
        localName: '단호박 해물찜',
        status: [{ name: '마나', value: 15 }, { name: '지력', value: 15 }]
      },
      {
        localName: '야채찜닭',
        status: [{ name: '스태미나', value: 15 }, { name: '의지', value: 15 }]
      },
      { localName: '찐만두', status: [{ name: '스태미나', value: 15 }] },
      {
        localName: '알리오 올리오',
        status: [{ name: '생명력', value: -10 }, { name: '마나', value: 17 }]
      },
      {
        localName: '까르보나라',
        status: [{ name: '마나', value: -10 }, { name: '스태미나', value: 15 }]
      },
      {
        localName: '아마트리치아나',
        status: [{ name: '생명력', value: 15 }, { name: '스태미나', value: -8 }]
      },
      {
        localName: '봉골레',
        status: [{ name: '생명력', value: 20 }, { name: '지력', value: -20 }]
      },
      {
        localName: '빠네',
        status: [{ name: '생명력', value: 12 }, { name: '의지', value: 5 }]
      },
      { localName: '호두 파이', status: [{ name: '마나', value: 23 }] },
      {
        localName: '고구마 파이',
        status: [{ name: '생명력', value: 12 }, { name: '의지', value: 5 }]
      },
      {
        localName: '아몬드 파이',
        status: [{ name: '마나', value: 10 }, { name: '지력', value: 7 }]
      },
      {
        localName: '아몬드 딸기잼 타르트',
        status: [{ name: '스태미나', value: 15 }, { name: '솜씨', value: 10 }]
      },
      {
        localName: '블루베리잼',
        status: [{ name: '생명력', value: 18 }, { name: '체력', value: 8 }]
      },
      { localName: '가지찜', status: [{ name: '마나', value: 10 }] },
      {
        localName: '단호박 갈비찜',
        status: [{ name: '생명력', value: 20 }, { name: '체력', value: 10 }]
      },
      {
        localName: '해물 볶음우동',
        status: [{ name: '생명력', value: 15 }, { name: '행운', value: 15 }]
      },
      {
        localName: '팟타이',
        status: [
          { name: '생명력', value: 15 },
          { name: '의지', value: 20 },
          { name: '지력', value: -30 }
        ]
      },
      {
        localName: '새우튀김 우동',
        status: [
          { name: '생명력', value: 10 },
          { name: '체력', value: -10 },
          { name: '행운', value: 10 }
        ]
      },
      {
        localName: '구운 콩국수',
        status: [{ name: '생명력', value: 18 }, { name: '지력', value: 3 }]
      },
      {
        localName: '껍질 벗긴 콩국수',
        status: [{ name: '생명력', value: 18 }, { name: '지력', value: 3 }]
      },
      {
        localName: '물에 불린 콩국수',
        status: [{ name: '생명력', value: 18 }, { name: '지력', value: 3 }]
      },
      {
        localName: '잔치국수',
        status: [
          { name: '생명력', value: 15 },
          { name: '솜씨', value: 2 },
          { name: '의지', value: 8 }
        ]
      },
      {
        localName: '카레우동',
        status: [{ name: '생명력', value: 22 }, { name: '솜씨', value: 3 }]
      },
      {
        localName: '두부국수',
        status: [{ name: '생명력', value: 40 }, { name: '체력', value: -30 }]
      },
      {
        localName: '두부국수',
        status: [{ name: '생명력', value: 40 }, { name: '체력', value: -30 }]
      },
      {
        localName: '두부국수',
        status: [{ name: '생명력', value: 40 }, { name: '체력', value: -30 }]
      },
      {
        localName: '계란찜',
        status: [{ name: '생명력', value: 8 }, { name: '행운', value: 10 }]
      },
      {
        localName: '돼지갈비찜',
        status: [
          { name: '생명력', value: 28 },
          { name: '솜씨', value: 5 },
          { name: '의지', value: 5 },
          { name: '지력', value: 8 }
        ]
      },
      {
        localName: '오렌지 마멀레이드',
        status: [{ name: '생명력', value: 15 }, { name: '의지', value: 8 }]
      },
      {
        localName: '레몬잼',
        status: [{ name: '생명력', value: 30 }, { name: '체력', value: -20 }]
      },
      {
        localName: '닭똥집 볶음',
        status: [
          { name: '마나', value: 42 },
          { name: '체력', value: 4 },
          { name: '지력', value: 7 },
          { name: '행운', value: 3 }
        ]
      },
      {
        localName: '번데기탕',
        status: [
          { name: '스태미나', value: 49 },
          { name: '솜씨', value: 13 },
          { name: '의지', value: 9 },
          { name: '행운', value: 6 }
        ]
      },
      {
        localName: '해물파전',
        status: [
          { name: '생명력', value: 40 },
          { name: '솜씨', value: 4 },
          { name: '지력', value: 9 }
        ]
      },
      {
        localName: '사과 사탕',
        status: [
          { name: '생명력', value: 27 },
          { name: '마나', value: 38 },
          { name: '스태미나', value: 46 }
        ]
      },
      {
        localName: '초코 바나나',
        status: [
          { name: '체력', value: 4 },
          { name: '지력', value: 11 },
          { name: '행운', value: 6 }
        ]
      },
      {
        localName: '치즈맛 팝콘',
        status: [
          { name: '체력', value: 6 },
          { name: '솜씨', value: 9 },
          { name: '의지', value: 11 },
          { name: '지력', value: 10 },
          { name: '행운', value: 5 }
        ]
      },
      {
        localName: '구운 오징어',
        status: [
          { name: '스태미나', value: 42 },
          { name: '솜씨', value: 11 },
          { name: '의지', value: 10 },
          { name: '행운', value: 4 }
        ]
      },
      {
        localName: '소프트 아이스크림',
        status: [
          { name: '마나', value: 46 },
          { name: '솜씨', value: 11 },
          { name: '지력', value: 16 }
        ]
      },
      {
        localName: '구름 솜사탕',
        status: [
          { name: '생명력', value: 38 },
          { name: '마나', value: 20 },
          { name: '스태미나', value: 25 },
          { name: '체력', value: 7 },
          { name: '솜씨', value: 6 }
        ]
      },
      {
        localName: '응원해! 수능 찹쌀떡',
        status: [
          { name: '체력', value: 50 },
          { name: '솜씨', value: 50 },
          { name: '의지', value: 50 },
          { name: '지력', value: 50 },
          { name: '행운', value: 50 }
        ]
      },
      {
        localName: '응원해! 수능 엿',
        status: [
          { name: '보호', value: 5 },
          { name: '생명력', value: 150 },
          { name: '스태미나', value: 120 }
        ]
      },
      {
        localName: '척척 붙을 거야! 호두 찹쌀떡',
        status: [{ name: '지력', value: 77 }]
      },
      { localName: '할 수 있어! 럭키 케이크', status: [{ name: '행운', value: 77 }] },
      {
        localName: '튀김 우동',
        status: [
          { name: '보호', value: 2 },
          { name: '스태미나', value: 35 },
          { name: '방어', value: 4 }
        ]
      },
      {
        localName: '매운 어묵탕',
        status: [
          { name: '생명력', value: 39 },
          { name: '마나', value: 35 },
          { name: '스태미나', value: 47 },
          { name: '체력', value: 9 }
        ]
      },
      {
        localName: '소시지 야채 볶음',
        status: [{ name: '스태미나', value: 15 }, { name: '방어', value: 1 }]
      },
      {
        localName: '가지 볶음',
        status: [{ name: '생명력', value: 15 }, { name: '방어', value: 1 }]
      },
      {
        localName: '낙지 볶음',
        status: [{ name: '마나', value: 15 }, { name: '방어', value: 1 }]
      },
      {
        localName: '고구마 튀김',
        status: [{ name: '솜씨', value: 15 }, { name: '행운', value: 15 }]
      },
      {
        localName: '감자 크로켓',
        status: [{ name: '솜씨', value: -25 }, { name: '행운', value: 35 }]
      },
      {
        localName: '고구마 맛탕',
        status: [{ name: '생명력', value: 11 }, { name: '의지', value: 5 }]
      },
      {
        localName: '돈가스',
        status: [{ name: '생명력', value: 16 }, { name: '의지', value: 9 }]
      },
      {
        localName: '양배추 콩찜',
        status: [{ name: '생명력', value: 15 }, { name: '의지', value: 3 }]
      },
      { localName: '힘이 불끈! 에너지 드링크', status: [{ name: '체력', value: 77 }] },
      {
        localName: '홍차 벌꿀 스콘',
        status: [
          { name: '마나', value: 50 },
          { name: '행운', value: 30 },
          { name: '마법보호', value: 1 }
        ]
      },
      {
        localName: '밀푀유 전골',
        status: [{ name: '스태미나', value: 30 }, { name: '지력', value: 25 }]
      },
      {
        localName: '판나코타',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 15 },
          { name: '지력', value: 20 }
        ]
      },
      {
        localName: '로쿰',
        status: [
          { name: '마나', value: 20 },
          { name: '솜씨', value: 20 },
          { name: '의지', value: 15 }
        ]
      },
      {
        localName: '닭볶음탕',
        status: [
          { name: '스태미나', value: 20 },
          { name: '의지', value: 15 },
          { name: '행운', value: 20 }
        ]
      },
      {
        localName: '프라이드 치킨',
        status: [
          { name: '지력', value: 25 },
          { name: '행운', value: 15 },
          { name: '방어', value: 2 }
        ]
      },
      {
        localName: '토마토 달걀 볶음',
        status: [
          { name: '생명력', value: 30 },
          { name: '솜씨', value: 35 },
          { name: '마법보호', value: 1 }
        ]
      },
      {
        localName: '김치',
        status: [
          { name: '생명력', value: 30 },
          { name: '마나', value: 30 },
          { name: '스태미나', value: 30 }
        ]
      },
      {
        localName: '마법 콩 두부',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 10 },
          { name: '의지', value: 10 }
        ]
      },
      {
        localName: '쿤이 구워준 마시멜로',
        status: [{ name: '생명력', value: 10 }, { name: '행운', value: 15 }]
      },
      {
        localName: '딸기 맛 사탕',
        status: [
          { name: '생명력', value: 35 },
          { name: '마나', value: 15 },
          { name: '스태미나', value: 15 },
          { name: '체력', value: 30 },
          { name: '솜씨', value: 30 },
          { name: '의지', value: 30 },
          { name: '지력', value: 30 },
          { name: '행운', value: 30 }
        ]
      },
      {
        localName: '포도 맛 사탕',
        status: [
          { name: '생명력', value: 15 },
          { name: '마나', value: 35 },
          { name: '스태미나', value: 15 },
          { name: '체력', value: 30 },
          { name: '솜씨', value: 30 },
          { name: '의지', value: 30 },
          { name: '지력', value: 30 },
          { name: '행운', value: 30 }
        ]
      },
      {
        localName: '오렌지 맛 사탕',
        status: [
          { name: '생명력', value: 15 },
          { name: '마나', value: 15 },
          { name: '스태미나', value: 35 },
          { name: '체력', value: 30 },
          { name: '솜씨', value: 30 },
          { name: '의지', value: 30 },
          { name: '지력', value: 30 },
          { name: '행운', value: 30 }
        ]
      },
      {
        localName: '밀크티',
        status: [
          { name: '보호', value: 1 },
          { name: '마나', value: 30 },
          { name: '행운', value: 30 }
        ]
      },
      {
        localName: '홍차',
        status: [{ name: '생명력', value: 30 }, { name: '행운', value: 25 }]
      },
      {
        localName: '계란 마요 토스트',
        status: [
          { name: '체력', value: 15 },
          { name: '의지', value: 15 },
          { name: '방어', value: 5 }
        ]
      },
      {
        localName: '크로플',
        status: [
          { name: '생명력', value: 50 },
          { name: '마나', value: 50 },
          { name: '체력', value: 10 }
        ]
      },
      {
        localName: '김치 찌개',
        status: [{ name: '솜씨', value: 30 }, { name: '최소 공격력', value: 1 }]
      },
      {
        localName: '매운 라면',
        status: [{ name: '마나', value: 50 }, { name: '행운', value: 30 }]
      },
      {
        localName: '양념 치킨',
        status: [
          { name: '보호', value: 1 },
          { name: '생명력', value: 40 },
          { name: '마나', value: 40 }
        ]
      },
      {
        localName: '김치볶음밥',
        status: [{ name: '스태미나', value: 45 }, { name: '의지', value: 30 }]
      },
      {
        localName: '트뤼프 크림 뇨키',
        status: [{ name: '마법공격력', value: 1 }, { name: '지력', value: 35 }]
      },
      {
        localName: '치즈 떡볶이',
        status: [{ name: '스태미나', value: 40 }, { name: '솜씨', value: 20 }]
      },
      {
        localName: '크루아상',
        status: [
          { name: '생명력', value: 25 },
          { name: '체력', value: 15 },
          { name: '방어', value: 3 }
        ]
      },
      {
        localName: '딸기 찹쌀떡',
        status: [
          { name: '마나', value: 30 },
          { name: '지력', value: 10 },
          { name: '마법방어', value: 2 }
        ]
      },
      {
        localName: '마카롱',
        status: [{ name: '마나', value: 20 }, { name: '의지', value: 25 }]
      },
      {
        localName: '배추전',
        status: [{ name: '마나', value: 50 }, { name: '지력', value: 20 }]
      },
      {
        localName: '까눌레',
        status: [{ name: '스태미나', value: 30 }, { name: '솜씨', value: 20 }]
      },
      {
        localName: '별가루 감자 샐러드',
        status: [{ name: '최대대미지', value: 1 }, { name: '최소 공격력', value: 1 }]
      },
      { localName: '별가루 계란말이', status: [{ name: '마법공격력', value: 1 }] },
      {
        localName: '은하수 레몬 주스',
        status: [{ name: '보호', value: 2 }, { name: '방어', value: 20 }]
      },
      {
        localName: '방울토마토 스파게티',
        status: [
          { name: '최대대미지', value: 1 },
          { name: '보호', value: 1 },
          { name: '방어', value: 1 }
        ]
      },
      {
        localName: '두근두근 리코타 치즈 샐러드',
        status: [
          { name: '최대대미지', value: 1 },
          { name: '마법공격력', value: 1 },
          { name: '보호', value: 2 },
          { name: '마법보호', value: 2 },
          { name: '방어', value: 5 },
          { name: '마법방어', value: 5 }
        ]
      },
      {
        localName: '두근두근 스위트 디저트',
        status: [
          { name: '최대대미지', value: 1 },
          { name: '마법공격력', value: 1 },
          { name: '보호', value: 2 },
          { name: '마법보호', value: 2 },
          { name: '방어', value: 5 },
          { name: '마법방어', value: 5 }
        ]
      },
      {
        localName: '두근두근 스테이크',
        status: [
          { name: '최대대미지', value: 1 },
          { name: '마법공격력', value: 1 },
          { name: '보호', value: 2 },
          { name: '마법보호', value: 2 },
          { name: '방어', value: 5 },
          { name: '마법방어', value: 5 }
        ]
      },
      {
        localName: '두근두근 하트 파스타',
        status: [
          { name: '최대대미지', value: 1 },
          { name: '마법공격력', value: 1 },
          { name: '보호', value: 2 },
          { name: '마법보호', value: 2 },
          { name: '방어', value: 5 },
          { name: '마법방어', value: 5 }
        ]
      },
      {
        localName: '순수 우유 케이크',
        status: [
          { name: '최대대미지', value: 1 },
          { name: '마법공격력', value: 1 },
          { name: '보호', value: 2 },
          { name: '마법보호', value: 2 },
          { name: '방어', value: 5 },
          { name: '마법방어', value: 5 }
        ]
      },
      {
        localName: '판이 그려진 달고나',
        status: [
          { name: '최대대미지', value: 1 },
          { name: '마법공격력', value: 1 },
          { name: '최소 공격력', value: 1 }
        ]
      },
      {
        localName: '니엘이 만든 옥수수 스프',
        status: [
          { name: '생명력', value: 40 },
          { name: '체력', value: 8 },
          { name: '솜씨', value: 10 },
          { name: '의지', value: 10 },
          { name: '지력', value: 8 }
        ]
      },
      {
        localName: '처갓집 와락치킨',
        status: [
          { name: '생명력', value: 50 },
          { name: '마나', value: 50 },
          { name: '스태미나', value: 50 }
        ]
      },
      {
        localName: '처갓집 꼬꼬뱅 슈프림양념치킨',
        status: [
          { name: '체력', value: 10 },
          { name: '솜씨', value: 10 },
          { name: '의지', value: 10 },
          { name: '지력', value: 10 },
          { name: '행운', value: 10 }
        ]
      },
      {
        localName: '처갓집 슈프림양념치킨',
        status: [{ name: '최대대미지', value: 3 }, { name: '마법공격력', value: 5 }]
      },
      {
        localName: '방울토마토 치즈 치아바타',
        status: [
          { name: '마법공격력', value: 3 },
          { name: '마법보호', value: 1 },
          { name: '마법방어', value: 1 }
        ]
      },
      {
        localName: '방울토마토 주스',
        status: [
          { name: '체력', value: 5 },
          { name: '솜씨', value: 5 },
          { name: '행운', value: 5 }
        ]
      },
      {
        localName: '표고버섯볶음',
        status: [{ name: '의지', value: 5 }, { name: '지력', value: 5 }]
      },
      {
        localName: '은하수 사과 주스',
        status: [{ name: '마법보호', value: 2 }, { name: '마법방어', value: 20 }]
      },
      {
        localName: '달가루 핫케이크',
        status: [
          { name: '체력', value: 30 },
          { name: '솜씨', value: 30 },
          { name: '의지', value: 30 },
          { name: '지력', value: 30 },
          { name: '행운', value: 30 }
        ]
      },
      {
        localName: '달가루 비프 스테이크',
        status: [
          { name: '생명력', value: 50 },
          { name: '마나', value: 50 },
          { name: '스태미나', value: 50 }
        ]
      },
      {
        localName: '칠면조 테트라치니',
        status: [{ name: '스태미나', value: 30 }, { name: '체력', value: 10 }]
      },
      {
        localName: '영양만점 호두과자',
        status: [{ name: '생명력', value: 35 }, { name: '마나', value: 35 }]
      },
      {
        localName: '꿀밤 라떼',
        status: [{ name: '스태미나', value: 30 }, { name: '의지', value: 10 }]
      },
      {
        localName: '가리비 토마토 스튜',
        status: [
          { name: '생명력', value: 20 },
          { name: '솜씨', value: 10 },
          { name: '방어', value: 1 }
        ]
      },
      {
        localName: '모둠조개회',
        status: [
          { name: '최대대미지', value: 1 },
          { name: '보호', value: 1 },
          { name: '방어', value: 1 }
        ]
      },
      {
        localName: '가리비 치즈구이',
        status: [
          { name: '지력', value: 15 },
          { name: '행운', value: 10 },
          { name: '최소 공격력', value: 1 }
        ]
      },
      {
        localName: '불닭볶음면',
        status: [
          { name: '최대대미지', value: 2 },
          { name: '보호', value: 1 },
          { name: '방어', value: 10 },
          { name: '최소 공격력', value: 2 }
        ]
      },
      {
        localName: '까르보불닭볶음면',
        status: [
          { name: '마법공격력', value: 5 },
          { name: '마법보호', value: 1 },
          { name: '마법방어', value: 10 }
        ]
      },
      {
        localName: '4가지치즈불닭볶음면',
        status: [
          { name: '체력', value: 10 },
          { name: '솜씨', value: 10 },
          { name: '의지', value: 10 },
          { name: '지력', value: 10 },
          { name: '행운', value: 10 }
        ]
      },
      {
        localName: '처갓집양념치킨',
        status: [
          { name: '보호', value: 1 },
          { name: '마법보호', value: 1 },
          { name: '방어', value: 10 },
          { name: '마법방어', value: 10 }
        ]
      },
      {
        localName: '사과 수플레',
        status: [
          { name: '마나', value: 20 },
          { name: '솜씨', value: 30 },
          { name: '지력', value: 20 }
        ]
      },
      {
        localName: '모둠생선회',
        status: [
          { name: '최대대미지', value: 1 },
          { name: '마법공격력', value: 1 },
          { name: '보호', value: 1 },
          { name: '스태미나', value: 20 }
        ]
      },
      {
        localName: '핫치킨 피자',
        status: [
          { name: '생명력', value: 30 },
          { name: '마나', value: 30 },
          { name: '스태미나', value: 50 }
        ]
      },
      {
        localName: '타라 딥 디쉬',
        status: [
          { name: '보호', value: 1 },
          { name: '스태미나', value: 40 },
          { name: '지력', value: 25 }
        ]
      },
      {
        localName: '베지터블 피자',
        status: [
          { name: '생명력', value: 55 },
          { name: '스태미나', value: 30 },
          { name: '솜씨', value: 30 }
        ]
      },
      {
        localName: '쿠르클레 피자',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 40 },
          { name: '행운', value: 10 },
          { name: '방어', value: 5 }
        ]
      },
      {
        localName: '루벤 샌드위치',
        status: [
          { name: '보호', value: 2 },
          { name: '마법보호', value: 1 },
          { name: '방어', value: 3 },
          { name: '마법방어', value: 3 }
        ]
      },
      {
        localName: '새우초밥',
        status: [
          { name: '생명력', value: 45 },
          { name: '스태미나', value: 50 },
          { name: '최소 공격력', value: 1 }
        ]
      },
      {
        localName: '장어초밥',
        status: [
          { name: '생명력', value: 50 },
          { name: '마나', value: 35 },
          { name: '스태미나', value: 35 },
          { name: '방어', value: 1 }
        ]
      },
      {
        localName: '계란초밥',
        status: [
          { name: '보호', value: 1 },
          { name: '스태미나', value: 30 },
          { name: '솜씨', value: 40 }
        ]
      },
      {
        localName: '참치뱃살초밥',
        status: [
          { name: '생명력', value: 50 },
          { name: '마나', value: 35 },
          { name: '스태미나', value: 15 },
          { name: '방어', value: 2 }
        ]
      },
      {
        localName: '연어초밥',
        status: [
          { name: '생명력', value: 15 },
          { name: '마나', value: 80 },
          { name: '스태미나', value: 15 },
          { name: '방어', value: 1 }
        ]
      },
      {
        localName: '라씨',
        status: [
          { name: '마나', value: 20 },
          { name: '지력', value: 25 },
          { name: '마법방어', value: 2 }
        ]
      },
      {
        localName: '코울슬로',
        status: [
          { name: '체력', value: 25 },
          { name: '의지', value: 10 },
          { name: '행운', value: 25 }
        ]
      },
      {
        localName: '포카치아',
        status: [{ name: '생명력', value: 55 }, { name: '행운', value: 30 }]
      },
      {
        localName: '스테이크 피자',
        status: [
          { name: '마법공격력', value: 1 },
          { name: '마나', value: 55 },
          { name: '지력', value: 10 }
        ]
      },
      {
        localName: '쉬림프 피자',
        status: [{ name: '마나', value: 50 }, { name: '의지', value: 30 }]
      },
      {
        localName: '모둠회덮밥',
        status: [
          { name: '최대대미지', value: 2 },
          { name: '마법공격력', value: 2 },
          { name: '생명력', value: 35 },
          { name: '마나', value: 25 }
        ]
      },
      {
        localName: '쉬쉬 케밥',
        status: [
          { name: '생명력', value: 40 },
          { name: '행운', value: 30 },
          { name: '방어', value: 1 }
        ]
      },
      {
        localName: '이스켄데르 케밥',
        status: [
          { name: '생명력', value: 50 },
          { name: '마나', value: 25 },
          { name: '지력', value: 35 }
        ]
      },
      {
        localName: '소풍용 치킨 케밥',
        status: [
          { name: '마나', value: 30 },
          { name: '솜씨', value: 40 },
          { name: '마법보호', value: 1 }
        ]
      },
      {
        localName: '부리토',
        status: [
          { name: '스태미나', value: 50 },
          { name: '체력', value: 25 },
          { name: '방어', value: 4 }
        ]
      },
      {
        localName: '고르곤졸라',
        status: [
          { name: '마나', value: 60 },
          { name: '지력', value: 10 },
          { name: '마법방어', value: 3 }
        ]
      },
      {
        localName: '마르게리따',
        status: [
          { name: '생명력', value: 35 },
          { name: '마나', value: 20 },
          { name: '솜씨', value: 35 }
        ]
      },
      {
        localName: '칼초네',
        status: [
          { name: '생명력', value: 40 },
          { name: '마나', value: 15 },
          { name: '체력', value: 35 }
        ]
      },
      {
        localName: '스위트 포테이토 피자',
        status: [{ name: '마나', value: 60 }, { name: '솜씨', value: 10 }]
      },
      {
        localName: '페퍼로니 피자',
        status: [
          { name: '스태미나', value: 55 },
          { name: '의지', value: 30 },
          { name: '방어', value: 3 }
        ]
      },
      {
        localName: '향긋한 버섯 피자',
        status: [{ name: '행운', value: 30 }, { name: '마법방어', value: 3 }]
      },
      {
        localName: '초콜릿 피자',
        status: [
          { name: '생명력', value: 50 },
          { name: '체력', value: 15 },
          { name: '최소 공격력', value: 1 }
        ]
      },
      {
        localName: '다이어트 연어 샐러드',
        status: [
          { name: '마나', value: 35 },
          { name: '지력', value: 25 },
          { name: '마법보호', value: 1 }
        ]
      },
      {
        localName: '마시멜로',
        status: [{ name: '생명력', value: 10 }, { name: '행운', value: 15 }]
      },
      {
        localName: '크레이프 케이크',
        status: [
          { name: '생명력', value: 30 },
          { name: '마나', value: 20 },
          { name: '체력', value: 30 }
        ]
      },
      {
        localName: '특이한 당근',
        status: [
          { name: '생명력', value: 14 },
          { name: '마나', value: 14 },
          { name: '체력', value: 14 },
          { name: '솜씨', value: 14 },
          { name: '의지', value: 14 },
          { name: '지력', value: 14 },
          { name: '행운', value: 14 }
        ]
      },
      {
        localName: '몬스터 초콜릿',
        status: [
          { name: '생명력', value: 30 },
          { name: '체력', value: 14 },
          { name: '의지', value: 14 }
        ]
      },
      {
        localName: '체리 포레누아',
        status: [
          { name: '체력', value: 15 },
          { name: '솜씨', value: 15 },
          { name: '의지', value: 15 },
          { name: '지력', value: 15 },
          { name: '행운', value: 15 }
        ]
      },
      {
        localName: '퐁당 쇼콜라',
        status: [
          { name: '체력', value: 15 },
          { name: '솜씨', value: 15 },
          { name: '의지', value: 15 },
          { name: '지력', value: 15 },
          { name: '행운', value: 15 }
        ]
      },
      {
        localName: '초코 슈크림',
        status: [
          { name: '체력', value: 30 },
          { name: '솜씨', value: -10 },
          { name: '의지', value: -10 },
          { name: '지력', value: -10 },
          { name: '행운', value: 30 }
        ]
      },
      {
        localName: '초콜릿 무스',
        status: [
          { name: '체력', value: 30 },
          { name: '솜씨', value: -10 },
          { name: '의지', value: -10 },
          { name: '지력', value: -10 },
          { name: '행운', value: 30 }
        ]
      },
      {
        localName: '엘시가 준 딸기우유',
        status: [{ name: '생명력', value: 25 }, { name: '지력', value: 6 }]
      },
      {
        localName: '할로윈 축제 요리',
        status: [
          { name: '생명력', value: 70 },
          { name: '마나', value: 70 },
          { name: '스태미나', value: 70 },
          { name: '체력', value: 40 },
          { name: '솜씨', value: 40 },
          { name: '의지', value: 40 },
          { name: '지력', value: 40 },
          { name: '행운', value: 40 }
        ]
      },
      {
        localName: '맛있는 송편 세트',
        status: [
          { name: '보호', value: 2 },
          { name: '체력', value: 90 },
          { name: '솜씨', value: 90 },
          { name: '의지', value: 90 },
          { name: '지력', value: 90 },
          { name: '행운', value: 90 },
          { name: '마법보호', value: 2 },
          { name: '방어', value: 4 },
          { name: '마법방어', value: 4 }
        ]
      },
      {
        localName: '불금 반반 치맥 세트',
        status: [
          { name: '마법공격력', value: 5 },
          { name: '보호', value: 2 },
          { name: '지력', value: 50 },
          { name: '행운', value: 30 }
        ]
      },
      {
        localName: '딸기 쇼트케익',
        status: [
          { name: '생명력', value: 45 },
          { name: '마나', value: 45 },
          { name: '행운', value: 50 }
        ]
      },
      {
        localName: '민트초코 프라페',
        status: [
          { name: '스태미나', value: 30 },
          { name: '의지', value: 30 },
          { name: '방어', value: 2 }
        ]
      },
      {
        localName: '팥빙수',
        status: [{ name: '마나', value: 20 }, { name: '행운', value: 15 }]
      },
      {
        localName: '계란 샌드위치',
        status: [{ name: '의지', value: 4 }, { name: '행운', value: 2 }]
      },
      {
        localName: '계란죽',
        status: [{ name: '의지', value: 4 }, { name: '행운', value: 2 }]
      },
      {
        localName: '딸기 생크림 크레이프',
        status: [
          { name: '생명력', value: 20 },
          { name: '마나', value: 30 },
          { name: '지력', value: 30 }
        ]
      },
      {
        localName: '블루베리 생크림 크레이프',
        status: [
          { name: '마나', value: 20 },
          { name: '스태미나', value: 35 },
          { name: '솜씨', value: 30 }
        ]
      },
      {
        localName: '초코 크레이프 케이크',
        status: [
          { name: '마나', value: 30 },
          { name: '스태미나', value: 20 },
          { name: '의지', value: 30 }
        ]
      },
      {
        localName: '해피 디저트 타임 세트',
        status: [
          { name: '최대대미지', value: 2 },
          { name: '보호', value: 1 },
          { name: '솜씨', value: 25 },
          { name: '행운', value: 30 }
        ]
      },
      {
        localName: '모둠 바베큐',
        status: [
          { name: '체력', value: 80 },
          { name: '지력', value: 80 },
          { name: '방어', value: 10 }
        ]
      },
      { localName: '15주년 애플파이', status: [{ name: '행운', value: 30 }] },
      {
        localName: '15주년 아이스 카페 모카',
        status: [
          { name: '체력', value: 20 },
          { name: '솜씨', value: 30 },
          { name: '지력', value: 30 }
        ]
      },
      {
        localName: '생일 케이크',
        status: [
          { name: '최대대미지', value: 1 },
          { name: '보호', value: 1 },
          { name: '행운', value: 10 }
        ]
      },
      {
        localName: '쿠키 케이크',
        status: [
          { name: '최대대미지', value: 1 },
          { name: '보호', value: 1 },
          { name: '행운', value: 10 }
        ]
      },
      {
        localName: '하이볼',
        status: [{ name: '생명력', value: 20 }, { name: '체력', value: 5 }]
      },
      {
        localName: '애플사이다',
        status: [{ name: '스태미나', value: 20 }, { name: '지력', value: 5 }]
      },
      {
        localName: '오므라이스',
        status: [{ name: '생명력', value: 30 }, { name: '체력', value: 7 }]
      },
      {
        localName: '민트초코칩 쿠키',
        status: [{ name: '생명력', value: 55 }, { name: '방어', value: 1 }]
      },
      {
        localName: '핫 케이크',
        status: [
          { name: '생명력', value: 15 },
          { name: '체력', value: 3 },
          { name: '지력', value: 10 }
        ]
      },
      {
        localName: '보리빵',
        status: [{ name: '생명력', value: 15 }, { name: '지력', value: 9 }]
      },
      {
        localName: '찐 옥수수',
        status: [
          { name: '생명력', value: 40 },
          { name: '체력', value: 20 },
          { name: '솜씨', value: 8 },
          { name: '의지', value: 10 },
          { name: '지력', value: 8 }
        ]
      },
      {
        localName: '샥스핀 스프',
        status: [
          { name: '생명력', value: 40 },
          { name: '체력', value: 15 },
          { name: '솜씨', value: 8 },
          { name: '의지', value: 16 },
          { name: '지력', value: 8 }
        ]
      },
      {
        localName: '콘소메',
        status: [
          { name: '생명력', value: 30 },
          { name: '체력', value: 8 },
          { name: '솜씨', value: 12 },
          { name: '의지', value: 12 },
          { name: '지력', value: 8 }
        ]
      },
      {
        localName: '치킨 누들 콘소메',
        status: [
          { name: '생명력', value: 35 },
          { name: '체력', value: 10 },
          { name: '솜씨', value: 8 },
          { name: '의지', value: 12 },
          { name: '지력', value: 8 }
        ]
      },
      {
        localName: '옥수수 스프',
        status: [
          { name: '생명력', value: 40 },
          { name: '체력', value: 8 },
          { name: '솜씨', value: 10 },
          { name: '의지', value: 10 },
          { name: '지력', value: 8 }
        ]
      },
      {
        localName: '양파 튀김',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 22 },
          { name: '솜씨', value: 4 },
          { name: '의지', value: 20 },
          { name: '지력', value: 4 }
        ]
      },
      {
        localName: '모둠 튀김',
        status: [
          { name: '생명력', value: 30 },
          { name: '체력', value: 20 },
          { name: '솜씨', value: 10 },
          { name: '의지', value: 22 },
          { name: '지력', value: 8 }
        ]
      },
      {
        localName: '콘칩',
        status: [
          { name: '생명력', value: 10 },
          { name: '체력', value: 8 },
          { name: '솜씨', value: 12 },
          { name: '의지', value: 12 },
          { name: '지력', value: 8 }
        ]
      },
      {
        localName: '모둠 볶음밥',
        status: [
          { name: '생명력', value: 40 },
          { name: '체력', value: 15 },
          { name: '솜씨', value: 8 },
          { name: '의지', value: 20 },
          { name: '지력', value: 4 }
        ]
      },
      {
        localName: '버섯 볶음밥',
        status: [
          { name: '생명력', value: 35 },
          { name: '체력', value: 12 },
          { name: '솜씨', value: 10 },
          { name: '의지', value: 18 },
          { name: '지력', value: 8 }
        ]
      },
      {
        localName: '팝콘',
        status: [
          { name: '생명력', value: 15 },
          { name: '체력', value: 10 },
          { name: '솜씨', value: 10 },
          { name: '의지', value: 8 },
          { name: '지력', value: 8 }
        ]
      },
      {
        localName: '토마토 스파게티',
        status: [
          { name: '생명력', value: 15 },
          { name: '체력', value: 10 },
          { name: '솜씨', value: 30 },
          { name: '의지', value: 10 },
          { name: '지력', value: 4 }
        ]
      },
      {
        localName: '크림 파르팔레',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 8 },
          { name: '솜씨', value: 20 },
          { name: '의지', value: 20 },
          { name: '지력', value: 8 }
        ]
      },
      {
        localName: '옥수수 식빵',
        status: [
          { name: '생명력', value: 30 },
          { name: '체력', value: 16 },
          { name: '솜씨', value: 8 },
          { name: '의지', value: 8 },
          { name: '지력', value: 12 }
        ]
      },
      {
        localName: '옥수수 스콘',
        status: [
          { name: '생명력', value: 30 },
          { name: '체력', value: 15 },
          { name: '솜씨', value: 15 },
          { name: '의지', value: 10 },
          { name: '지력', value: 8 }
        ]
      },
      {
        localName: '은붕어 꼬치구이',
        status: [{ name: '생명력', value: 20 }, { name: '체력', value: 14 }]
      },
      {
        localName: '금은 매운탕',
        status: [
          { name: '생명력', value: 35 },
          { name: '체력', value: 15 },
          { name: '지력', value: 10 }
        ]
      },
      {
        localName: '브리흐네 락스',
        status: [
          { name: '생명력', value: 45 },
          { name: '체력', value: 25 },
          { name: '솜씨', value: -10 },
          { name: '지력', value: -10 },
          { name: '행운', value: 15 }
        ]
      },
      {
        localName: '스크류 드라이버',
        status: [
          { name: '생명력', value: 42 },
          { name: '체력', value: 26 },
          { name: '솜씨', value: -8 },
          { name: '지력', value: -8 },
          { name: '행운', value: 18 }
        ]
      },
      {
        localName: '라인 슬링',
        status: [
          { name: '생명력', value: 38 },
          { name: '체력', value: 20 },
          { name: '솜씨', value: -8 },
          { name: '지력', value: -8 },
          { name: '행운', value: 15 }
        ]
      },
      {
        localName: 'BnR',
        status: [
          { name: '생명력', value: 50 },
          { name: '체력', value: 30 },
          { name: '솜씨', value: -12 },
          { name: '지력', value: -12 },
          { name: '행운', value: 20 }
        ]
      },
      {
        localName: '키스 온 더 립스',
        status: [
          { name: '생명력', value: 45 },
          { name: '체력', value: 26 },
          { name: '솜씨', value: -8 },
          { name: '지력', value: -8 },
          { name: '행운', value: 18 }
        ]
      },
      {
        localName: '레드 선라이즈',
        status: [
          { name: '생명력', value: 42 },
          { name: '체력', value: 20 },
          { name: '솜씨', value: -10 },
          { name: '지력', value: -10 },
          { name: '행운', value: 15 }
        ]
      },
      {
        localName: '초콜릿',
        status: [
          { name: '생명력', value: 12 },
          { name: '체력', value: 4 },
          { name: '지력', value: 4 }
        ]
      },
      {
        localName: '개 과자',
        status: [
          { name: '생명력', value: 8 },
          { name: '체력', value: 2 },
          { name: '지력', value: 2 }
        ]
      },
      {
        localName: '베이컨과 감자 개밥',
        status: [
          { name: '생명력', value: 10 },
          { name: '체력', value: 6 },
          { name: '솜씨', value: -6 }
        ]
      },
      {
        localName: '새우 개밥',
        status: [
          { name: '생명력', value: 14 },
          { name: '체력', value: 8 },
          { name: '솜씨', value: -8 }
        ]
      },
      {
        localName: '오믈렛',
        status: [
          { name: '생명력', value: 10 },
          { name: '체력', value: 18 },
          { name: '솜씨', value: 4 },
          { name: '의지', value: 12 },
          { name: '지력', value: 8 }
        ]
      },
      {
        localName: '해물 스파게티',
        status: [
          { name: '생명력', value: 30 },
          { name: '체력', value: 5 },
          { name: '솜씨', value: 25 },
          { name: '의지', value: 15 },
          { name: '지력', value: 12 }
        ]
      },
      {
        localName: '조개구이',
        status: [{ name: '생명력', value: 10 }, { name: '의지', value: 5 }]
      },
      {
        localName: '독버섯 스튜',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 10 },
          { name: '의지', value: 15 }
        ]
      },
      {
        localName: '버섯 그라탕',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 15 },
          { name: '지력', value: 30 }
        ]
      },
      {
        localName: '버섯 마리네이드',
        status: [
          { name: '생명력', value: 45 },
          { name: '지력', value: -8 },
          { name: '행운', value: 26 }
        ]
      },
      {
        localName: '버섯찜',
        status: [
          { name: '생명력', value: 18 },
          { name: '솜씨', value: 5 },
          { name: '행운', value: 5 }
        ]
      },
      {
        localName: '루아의 요리',
        status: [{ name: '생명력', value: 40 }, { name: '행운', value: 10 }]
      },
      {
        localName: '뭉개진 껍질 벗긴 콩가루 두부',
        status: [
          { name: '생명력', value: 10 },
          { name: '체력', value: 5 },
          { name: '의지', value: 5 }
        ]
      },
      {
        localName: '뭉개진 물에 불린 콩가루 두부',
        status: [
          { name: '생명력', value: 10 },
          { name: '체력', value: 5 },
          { name: '의지', value: 5 }
        ]
      },
      {
        localName: '10주년 기념 케익',
        status: [
          { name: '생명력', value: 36 },
          { name: '마나', value: 36 },
          { name: '스태미나', value: 36 },
          { name: '체력', value: 6 },
          { name: '의지', value: 6 }
        ]
      },
      {
        localName: '10살 생일 케익',
        status: [
          { name: '생명력', value: 100 },
          { name: '마나', value: 100 },
          { name: '스태미나', value: 100 },
          { name: '체력', value: 100 },
          { name: '솜씨', value: 100 },
          { name: '의지', value: 100 },
          { name: '지력', value: 100 },
          { name: '행운', value: 100 }
        ]
      },
      {
        localName: '11주년 기념 케익',
        status: [
          { name: '생명력', value: 36 },
          { name: '마나', value: 36 },
          { name: '스태미나', value: 36 },
          { name: '체력', value: 6 },
          { name: '의지', value: 6 }
        ]
      },
      {
        localName: '12주년 기념 케익',
        status: [
          { name: '생명력', value: 40 },
          { name: '마나', value: 40 },
          { name: '스태미나', value: 40 },
          { name: '체력', value: 8 },
          { name: '의지', value: 8 }
        ]
      },
      {
        localName: '13주년 기념 케익',
        status: [
          { name: '생명력', value: 44 },
          { name: '마나', value: 44 },
          { name: '스태미나', value: 44 },
          { name: '체력', value: 10 },
          { name: '의지', value: 10 }
        ]
      },
      { localName: '타라식 소시지 샌드위치', status: [{ name: '체력', value: 30 }] },
      {
        localName: '버섯 카나페',
        status: [
          { name: '생명력', value: 18 },
          { name: '솜씨', value: 3 },
          { name: '행운', value: 10 }
        ]
      },
      {
        localName: '버섯 카푸치노스프',
        status: [
          { name: '생명력', value: 13 },
          { name: '의지', value: 12 },
          { name: '행운', value: 10 }
        ]
      },
      {
        localName: '비단 청새치구이',
        status: [{ name: '생명력', value: 12 }, { name: '의지', value: 5 }]
      },
      {
        localName: '케이크 만들기 키트',
        status: [{ name: '생명력', value: 12 }, { name: '의지', value: 5 }]
      },
      {
        localName: '청새치 스테이크',
        status: [
          { name: '생명력', value: 22 },
          { name: '체력', value: 10 },
          { name: '지력', value: 10 }
        ]
      },
      {
        localName: '훈제 개복치',
        status: [
          { name: '스태미나', value: 24 },
          { name: '체력', value: 10 },
          { name: '솜씨', value: 10 }
        ]
      },
      {
        localName: '날치 크레이프',
        status: [{ name: '마나', value: 16 }, { name: '지력', value: 5 }]
      },
      {
        localName: '킹 크랩찜',
        status: [
          { name: '생명력', value: 24 },
          { name: '체력', value: 15 },
          { name: '의지', value: 10 }
        ]
      },
      {
        localName: '가오리 아가미 퓌레',
        status: [{ name: '스태미나', value: 12 }, { name: '의지', value: 7 }]
      },
      {
        localName: '해파리 냉채',
        status: [
          { name: '마나', value: 8 },
          { name: '의지', value: 8 },
          { name: '지력', value: 12 }
        ]
      },
      {
        localName: '아귀찜',
        status: [
          { name: '생명력', value: 26 },
          { name: '체력', value: 10 },
          { name: '의지', value: 15 }
        ]
      },
      {
        localName: '뭉개진 구운 콩가루 두부',
        status: [
          { name: '생명력', value: 10 },
          { name: '체력', value: 5 },
          { name: '의지', value: 5 }
        ]
      },
      {
        localName: '마법 콩 두부',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 10 },
          { name: '의지', value: 10 }
        ]
      },
      {
        localName: '버섯 포타주',
        status: [
          { name: '생명력', value: 25 },
          { name: '체력', value: 20 },
          { name: '의지', value: 10 }
        ]
      },
      {
        localName: '버섯 콘소메',
        status: [{ name: '생명력', value: 15 }, { name: '지력', value: 30 }]
      },
      { localName: '딸기잼 토스트', status: [{ name: '지력', value: 30 }] },
      {
        localName: '로스트 치킨',
        status: [
          { name: '생명력', value: 25 },
          { name: '체력', value: 15 },
          { name: '솜씨', value: 2 },
          { name: '의지', value: 8 }
        ]
      },
      {
        localName: '양파맛 팝콘',
        status: [
          { name: '체력', value: 8 },
          { name: '솜씨', value: 11 },
          { name: '의지', value: 14 },
          { name: '지력', value: 12 },
          { name: '행운', value: 7 }
        ]
      },
      {
        localName: '밥',
        status: [
          { name: '체력', value: 6 },
          { name: '솜씨', value: 8 },
          { name: '지력', value: 7 }
        ]
      },
      {
        localName: '베이컨구이',
        status: [{ name: '생명력', value: 18 }, { name: '지력', value: 3 }]
      },
      {
        localName: '비프 스테이크',
        status: [
          { name: '생명력', value: 40 },
          { name: '체력', value: 15 },
          { name: '의지', value: 10 }
        ]
      },
      {
        localName: '삶은감자',
        status: [{ name: '생명력', value: 12 }, { name: '체력', value: 3 }]
      },
      {
        localName: '삶은달걀',
        status: [{ name: '생명력', value: 12 }, { name: '솜씨', value: 3 }]
      },
      {
        localName: '새우볶음밥',
        status: [
          { name: '생명력', value: 6 },
          { name: '솜씨', value: 10 },
          { name: '의지', value: 15 },
          { name: '지력', value: 10 }
        ]
      },
      {
        localName: '새우튀김',
        status: [{ name: '생명력', value: 12 }, { name: '의지', value: 15 }]
      },
      {
        localName: '식빵',
        status: [{ name: '생명력', value: 15 }, { name: '의지', value: 3 }]
      },
      {
        localName: '야채볶음',
        status: [
          { name: '생명력', value: 6 },
          { name: '솜씨', value: 10 },
          { name: '지력', value: 10 }
        ]
      },
      {
        localName: '야채스프',
        status: [
          { name: '생명력', value: 15 },
          { name: '솜씨', value: 10 },
          { name: '지력', value: 10 }
        ]
      },
      {
        localName: '양송이볶음',
        status: [{ name: '생명력', value: 10 }, { name: '지력', value: 12 }]
      },
      {
        localName: '양송이스프',
        status: [{ name: '생명력', value: 15 }, { name: '지력', value: 15 }]
      },
      {
        localName: '양파볶음',
        status: [{ name: '생명력', value: 10 }, { name: '솜씨', value: 12 }]
      },
      {
        localName: '마늘빵',
        status: [{ name: '생명력', value: 10 }, { name: '체력', value: 3 }]
      },
      {
        localName: '딸기우유',
        status: [{ name: '생명력', value: 25 }, { name: '지력', value: 6 }]
      },
      {
        localName: '캬라멜맛 팝콘',
        status: [
          { name: '체력', value: 8 },
          { name: '솜씨', value: 11 },
          { name: '의지', value: 14 },
          { name: '지력', value: 12 },
          { name: '행운', value: 7 }
        ]
      },
      {
        localName: '과일 도시락',
        status: [
          { name: '체력', value: 8 },
          { name: '솜씨', value: 11 },
          { name: '의지', value: 14 },
          { name: '지력', value: 12 },
          { name: '행운', value: 7 }
        ]
      },
      {
        localName: '치킨 팝콘과 콜라 세트',
        status: [
          { name: '체력', value: 8 },
          { name: '솜씨', value: 11 },
          { name: '의지', value: 14 },
          { name: '지력', value: 12 },
          { name: '행운', value: 7 }
        ]
      },
      {
        localName: '치킨 팝콘과 맥주 세트',
        status: [
          { name: '체력', value: 8 },
          { name: '솜씨', value: 11 },
          { name: '의지', value: 14 },
          { name: '지력', value: 12 },
          { name: '행운', value: 7 }
        ]
      },
      {
        localName: '감자계란샐러드',
        status: [
          { name: '생명력', value: 25 },
          { name: '체력', value: 3 },
          { name: '솜씨', value: 5 },
          { name: '지력', value: 10 }
        ]
      },
      {
        localName: '감자샐러드',
        status: [
          { name: '생명력', value: 20 },
          { name: '솜씨', value: 6 },
          { name: '지력', value: 5 }
        ]
      },
      {
        localName: '감자튀김',
        status: [{ name: '생명력', value: 18 }, { name: '체력', value: 7 }]
      },
      {
        localName: '계란샐러드',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 3 },
          { name: '지력', value: 10 }
        ]
      },
      { localName: '계란프라이', status: [{ name: '생명력', value: 15 }] },
      {
        localName: '과일 모둠',
        status: [{ name: '생명력', value: 25 }, { name: '솜씨', value: 3 }]
      },
      {
        localName: '과일샐러드',
        status: [
          { name: '생명력', value: 30 },
          { name: '솜씨', value: 3 },
          { name: '지력', value: 5 }
        ]
      },
      {
        localName: '닭날개구이',
        status: [{ name: '생명력', value: 28 }, { name: '행운', value: 10 }]
      },
      {
        localName: '닭날개튀김',
        status: [{ name: '생명력', value: 15 }, { name: '행운', value: 15 }]
      },
      {
        localName: '양파스프',
        status: [{ name: '생명력', value: 15 }, { name: '솜씨', value: 15 }]
      },
      {
        localName: '우유식빵',
        status: [{ name: '생명력', value: 18 }, { name: '솜씨', value: 7 }]
      },
      {
        localName: '레어치즈 케익',
        status: [{ name: '생명력', value: 18 }, { name: '의지', value: 5 }]
      },
      {
        localName: '가토 오 쇼콜라',
        status: [{ name: '생명력', value: 22 }, { name: '솜씨', value: 3 }]
      },
      {
        localName: '크로크 무슈',
        status: [{ name: '생명력', value: 15 }, { name: '지력', value: 5 }]
      },
      {
        localName: '브라우니',
        status: [
          { name: '생명력', value: 12 },
          { name: '체력', value: 6 },
          { name: '지력', value: 8 }
        ]
      },
      {
        localName: '버터 비스킷',
        status: [
          { name: '생명력', value: 10 },
          { name: '솜씨', value: 3 },
          { name: '지력', value: 5 }
        ]
      },
      {
        localName: '초코칩 쿠키',
        status: [
          { name: '생명력', value: 12 },
          { name: '체력', value: 5 },
          { name: '솜씨', value: 2 }
        ]
      },
      {
        localName: '오렌지 주스',
        status: [
          { name: '생명력', value: 10 },
          { name: '의지', value: 5 },
          { name: '지력', value: 5 }
        ]
      },
      {
        localName: '레몬 주스',
        status: [
          { name: '생명력', value: 10 },
          { name: '의지', value: 5 },
          { name: '지력', value: 5 }
        ]
      },
      {
        localName: '초콜릿 우유',
        status: [
          { name: '생명력', value: 15 },
          { name: '체력', value: 5 },
          { name: '지력', value: 5 }
        ]
      },
      {
        localName: '라인산 진',
        status: [
          { name: '생명력', value: 28 },
          { name: '체력', value: 16 },
          { name: '솜씨', value: -6 },
          { name: '행운', value: 6 }
        ]
      },
      {
        localName: '브리흐네 위스키',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 10 },
          { name: '솜씨', value: -4 },
          { name: '행운', value: 4 }
        ]
      },
      {
        localName: '데브니쉬 흑맥주',
        status: [
          { name: '생명력', value: 32 },
          { name: '체력', value: 15 },
          { name: '솜씨', value: -6 },
          { name: '행운', value: 6 }
        ]
      },
      {
        localName: '사과 주스',
        status: [
          { name: '생명력', value: 12 },
          { name: '체력', value: 5 },
          { name: '솜씨', value: 5 }
        ]
      },
      {
        localName: '이멘 마하산 와인',
        status: [
          { name: '생명력', value: 17 },
          { name: '체력', value: 7 },
          { name: '솜씨', value: -2 },
          { name: '행운', value: 2 }
        ]
      },
      {
        localName: '치즈 퐁듀',
        status: [
          { name: '생명력', value: 28 },
          { name: '솜씨', value: 5 },
          { name: '의지', value: 5 },
          { name: '지력', value: 8 }
        ]
      },
      { localName: '치즈빵', status: [{ name: '생명력', value: 15 }] },
      {
        localName: '토스트',
        status: [{ name: '생명력', value: 30 }, { name: '체력', value: 3 }]
      },
      {
        localName: '통감자구이',
        status: [{ name: '생명력', value: 10 }, { name: '의지', value: 5 }]
      },
      {
        localName: '브리흐네 잉어구이',
        status: [{ name: '생명력', value: 11 }, { name: '의지', value: 5 }]
      },
      {
        localName: '브리흐네 잉어찜',
        status: [{ name: '생명력', value: 12 }, { name: '체력', value: 6 }]
      },
      {
        localName: '은붕어 스튜',
        status: [{ name: '생명력', value: 16 }, { name: '의지', value: 9 }]
      },
      {
        localName: '피쉬 앤 칩스',
        status: [
          { name: '생명력', value: 18 },
          { name: '솜씨', value: 5 },
          { name: '의지', value: 5 }
        ]
      },
      {
        localName: 'T본 스테이크',
        status: [
          { name: '생명력', value: 40 },
          { name: '체력', value: 8 },
          { name: '솜씨', value: 5 },
          { name: '의지', value: 5 }
        ]
      },
      {
        localName: '치즈 그라탕',
        status: [
          { name: '생명력', value: 25 },
          { name: '솜씨', value: 3 },
          { name: '지력', value: 3 }
        ]
      },
      {
        localName: '카레 라이스',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 5 },
          { name: '행운', value: 5 }
        ]
      },
      {
        localName: '코 코 뱅',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 3 },
          { name: '솜씨', value: 10 },
          { name: '의지', value: 8 }
        ]
      },
      {
        localName: '송어찜',
        status: [
          { name: '생명력', value: 22 },
          { name: '솜씨', value: 5 },
          { name: '지력', value: 7 },
          { name: '행운', value: 5 }
        ]
      },
      {
        localName: '부야 베스',
        status: [
          { name: '생명력', value: 32 },
          { name: '체력', value: 10 },
          { name: '솜씨', value: 5 },
          { name: '의지', value: 5 }
        ]
      },
      {
        localName: '카레빵',
        status: [{ name: '생명력', value: 15 }, { name: '체력', value: 8 }]
      },
      { localName: '클럽 샌드위치', status: [{ name: '솜씨', value: 35 }] },
      {
        localName: '복지리',
        status: [
          { name: '생명력', value: 25 },
          { name: '마나', value: 30 },
          { name: '지력', value: 15 }
        ]
      },
      {
        localName: '떡국',
        status: [{ name: '생명력', value: 8 }, { name: '체력', value: 2 }]
      },
      {
        localName: '떡국 곱빼기',
        status: [
          { name: '생명력', value: 10 },
          { name: '체력', value: 8 },
          { name: '솜씨', value: 4 }
        ]
      },
      {
        localName: '특대 떡국',
        status: [
          { name: '보호', value: 1 },
          { name: '생명력', value: 10 },
          { name: '체력', value: 18 },
          { name: '솜씨', value: 4 },
          { name: '지력', value: 8 }
        ]
      },
      {
        localName: '월병',
        status: [{ name: '생명력', value: 8 }, { name: '체력', value: 2 }]
      },
      {
        localName: '큰 월병',
        status: [{ name: '생명력', value: 15 }, { name: '체력', value: 8 }]
      },
      {
        localName: '특대 월병',
        status: [
          { name: '보호', value: 1 },
          { name: '생명력', value: 15 },
          { name: '체력', value: 10 },
          { name: '솜씨', value: 10 },
          { name: '지력', value: 12 }
        ]
      },
      {
        localName: '할로윈 호박 사탕',
        status: [{ name: '생명력', value: 5 }, { name: '마나', value: 5 }]
      },
      { localName: '할로윈 포장 캔디', status: [{ name: '생명력', value: 15 }] },
      { localName: '할로윈 호박 초콜릿', status: [{ name: '마나', value: 10 }] },
      { localName: '할로윈 포장 쿠키', status: [{ name: '스태미나', value: 10 }] },
      { localName: '할로윈 호박 파이', status: [{ name: '생명력', value: 10 }] },
      { localName: '할로윈 모자 쿠키', status: [{ name: '의지', value: 10 }] },
      { localName: '할로윈 별 쿠키', status: [{ name: '행운', value: 10 }] },
      {
        localName: '드래곤 블러드 레드 와인',
        status: [
          { name: '스태미나', value: 300 },
          { name: '체력', value: 100 },
          { name: '의지', value: 100 },
          { name: '행운', value: 100 }
        ]
      },
      {
        localName: '드래곤 티본 스테이크',
        status: [{ name: '생명력', value: 200 }, { name: '체력', value: 100 }]
      },
      {
        localName: '감성돔 카레구이',
        status: [{ name: '체력', value: 20 }, { name: '의지', value: 20 }]
      },
      {
        localName: '참돔 카레구이',
        status: [{ name: '솜씨', value: 20 }, { name: '행운', value: 20 }]
      },
      {
        localName: '돔돔 매운탕',
        status: [
          { name: '체력', value: 10 },
          { name: '솜씨', value: 10 },
          { name: '의지', value: 10 },
          { name: '지력', value: 10 },
          { name: '행운', value: 10 }
        ]
      },
      {
        localName: '샥스핀 찜',
        status: [{ name: '체력', value: 30 }, { name: '솜씨', value: 30 }]
      },
      {
        localName: '캐비어 샐러드',
        status: [{ name: '마나', value: 30 }, { name: '지력', value: 30 }]
      },
      {
        localName: '버터구이 랍스타',
        status: [{ name: '체력', value: -10 }, { name: '솜씨', value: 40 }]
      },
      {
        localName: '고등어 스테이크',
        status: [
          { name: '생명력', value: 30 },
          { name: '마나', value: 30 },
          { name: '스태미나', value: 30 }
        ]
      },
      {
        localName: '벨바스트 장어 덮밥',
        status: [{ name: '체력', value: 40 }, { name: '솜씨', value: -10 }]
      },
      {
        localName: '갈치스튜',
        status: [{ name: '지력', value: 40 }, { name: '행운', value: -10 }]
      },
      {
        localName: '참돔 매운탕',
        status: [
          { name: '체력', value: 12 },
          { name: '솜씨', value: 10 },
          { name: '의지', value: 15 },
          { name: '지력', value: 8 },
          { name: '행운', value: 8 }
        ]
      },
      {
        localName: '추억의 도시락',
        status: [{ name: '마나', value: 20 }, { name: '지력', value: 15 }]
      },
      {
        localName: '벨바스트 위스키',
        status: [{ name: '생명력', value: 32 }, { name: '체력', value: 16 }]
      },
      {
        localName: '하얗게 구워진 드래곤 심장',
        status: [
          { name: '체력', value: 150 },
          { name: '솜씨', value: 150 },
          { name: '의지', value: 150 },
          { name: '지력', value: 150 },
          { name: '행운', value: 150 }
        ]
      },
      { localName: '할로윈 부엉이 쿠키', status: [{ name: '솜씨', value: 10 }] },
      { localName: '할로윈 유령 젤리', status: [{ name: '지력', value: 10 }] },
      {
        localName: '초콜릿 케이크',
        status: [
          { name: '생명력', value: 5 },
          { name: '지력', value: -10 },
          { name: '행운', value: 10 }
        ]
      },
      {
        localName: '삼계탕',
        status: [
          { name: '체력', value: 28 },
          { name: '솜씨', value: -15 },
          { name: '행운', value: 15 }
        ]
      },
      { localName: '가락엿', status: [{ name: '체력', value: 15 }] },
      {
        localName: '거대한 별사탕',
        status: [
          { name: '생명력', value: 10 },
          { name: '솜씨', value: 7 },
          { name: '행운', value: 5 }
        ]
      },
      { localName: '삶은 고구마', status: [{ name: '솜씨', value: 8 }] },
      { localName: '삶은 콩', status: [{ name: '체력', value: 8 }] },
      { localName: '삶은 문어', status: [{ name: '스태미나', value: 8 }] },
      { localName: '삶은 양배추', status: [{ name: '마나', value: 8 }] },
      { localName: '삶은 밤', status: [{ name: '생명력', value: 8 }] },
      { localName: '하얀 떡', status: [{ name: '생명력', value: 12 }] },
      {
        localName: '미트파이',
        status: [
          { name: '생명력', value: 15 },
          { name: '의지', value: 5 },
          { name: '행운', value: 5 }
        ]
      },
      { localName: '3단 핫 케이크', status: [{ name: '행운', value: 21 }] },
      { localName: '옥수수 구이', status: [{ name: '생명력', value: 15 }] },
      { localName: '할로윈 호박 젤리', status: [{ name: '체력', value: 10 }] },
      { localName: '군만두', status: [{ name: '지력', value: 8 }] },
      {
        localName: '군만두 곱빼기',
        status: [
          { name: '솜씨', value: 8 },
          { name: '의지', value: 16 },
          { name: '지력', value: 8 }
        ]
      },
      {
        localName: '특대 군만두',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 15 },
          { name: '솜씨', value: 8 },
          { name: '의지', value: 16 },
          { name: '지력', value: 8 }
        ]
      },
      { localName: '구운 떡', status: [{ name: '생명력', value: 15 }] },
      {
        localName: '칠면조 구이',
        status: [
          { name: '생명력', value: 30 },
          { name: '체력', value: 10 },
          { name: '의지', value: 10 }
        ]
      },
      {
        localName: '타라식 소시지 샌드위치',
        status: [{ name: '솜씨', value: 10 }, { name: '지력', value: 10 }]
      },
      {
        localName: '송편',
        status: [{ name: '체력', value: 10 }, { name: '솜씨', value: 15 }]
      },
      {
        localName: '트뤼프 파이',
        status: [
          { name: '생명력', value: 40 },
          { name: '체력', value: 10 },
          { name: '솜씨', value: -17 },
          { name: '행운', value: 8 }
        ]
      },
      {
        localName: '초콜릿 수플레',
        status: [{ name: '생명력', value: 15 }, { name: '체력', value: -5 }]
      },
      {
        localName: '샐러리 샐러드',
        status: [
          { name: '스태미나', value: 12 },
          { name: '의지', value: 7 },
          { name: '지력', value: -15 }
        ]
      },
      {
        localName: '닭고기 볶음면',
        status: [
          { name: '스태미나', value: -12 },
          { name: '체력', value: 20 },
          { name: '의지', value: 10 }
        ]
      },
      {
        localName: '그라니타',
        status: [{ name: '마나', value: 27 }, { name: '행운', value: 23 }]
      },
      { localName: '호박 타르트', status: [{ name: '마나', value: 30 }] },
      {
        localName: '나레스 케익 세트',
        status: [{ name: '생명력', value: 45 }, { name: '솜씨', value: 5 }]
      },
      {
        localName: '버섯 쿠키',
        status: [
          { name: '생명력', value: 15 },
          { name: '체력', value: 9 },
          { name: '솜씨', value: 3 }
        ]
      },
      {
        localName: '코코넛 쿠키',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 18 },
          { name: '의지', value: 17 }
        ]
      },
      {
        localName: '코코넛 파운드 케익',
        status: [
          { name: '생명력', value: 28 },
          { name: '체력', value: 13 },
          { name: '행운', value: 13 }
        ]
      },
      {
        localName: '코코넛 게살 스프',
        status: [
          { name: '생명력', value: 38 },
          { name: '체력', value: 28 },
          { name: '행운', value: 21 }
        ]
      },
      {
        localName: '키시',
        status: [
          { name: '생명력', value: 28 },
          { name: '체력', value: 13 },
          { name: '의지', value: 18 }
        ]
      },
      {
        localName: '잣죽',
        status: [
          { name: '생명력', value: 10 },
          { name: '체력', value: 5 },
          { name: '의지', value: 8 }
        ]
      },
      {
        localName: '철갑상어 스테이크',
        status: [
          { name: '생명력', value: 45 },
          { name: '체력', value: 10 },
          { name: '의지', value: 20 }
        ]
      },
      {
        localName: '캐비어 카나페',
        status: [
          { name: '생명력', value: 15 },
          { name: '솜씨', value: 4 },
          { name: '행운', value: 20 }
        ]
      },
      {
        localName: '에그 캐비어',
        status: [
          { name: '생명력', value: 17 },
          { name: '체력', value: 10 },
          { name: '의지', value: 11 }
        ]
      },
      {
        localName: '발레스 위스키',
        status: [
          { name: '생명력', value: 15 },
          { name: '체력', value: 5 },
          { name: '솜씨', value: -2 },
          { name: '행운', value: 9 }
        ]
      },
      {
        localName: '발레스 화이어',
        status: [
          { name: '생명력', value: 30 },
          { name: '체력', value: 38 },
          { name: '솜씨', value: -15 },
          { name: '지력', value: -15 },
          { name: '행운', value: 25 }
        ]
      },
      {
        localName: '카멜리아 슬링',
        status: [
          { name: '생명력', value: 18 },
          { name: '체력', value: 10 },
          { name: '솜씨', value: -3 },
          { name: '지력', value: -3 },
          { name: '행운', value: 10 }
        ]
      },
      {
        localName: '루트라 칵테일 세트',
        status: [{ name: '체력', value: 20 }, { name: '솜씨', value: 5 }]
      },
      {
        localName: '필리아 쿠키 세트',
        status: [{ name: '솜씨', value: 5 }, { name: '행운', value: 20 }]
      },
      { localName: '에그 타르트', status: [{ name: '생명력', value: 30 }] },
      { localName: '애플파이', status: [{ name: '행운', value: 30 }] },
      { localName: '피칸파이', status: [{ name: '의지', value: 40 }] },
      {
        localName: '바질티',
        status: [{ name: '솜씨', value: 8 }, { name: '의지', value: 12 }]
      },
      {
        localName: '레몬티',
        status: [
          { name: '생명력', value: 6 },
          { name: '솜씨', value: 8 },
          { name: '지력', value: 10 }
        ]
      },
      {
        localName: '스팀밀크',
        status: [
          { name: '생명력', value: 5 },
          { name: '체력', value: 6 },
          { name: '지력', value: 3 }
        ]
      },
      {
        localName: '핫초코',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 25 },
          { name: '지력', value: 22 }
        ]
      },
      {
        localName: '보리차',
        status: [{ name: '솜씨', value: 3 }, { name: '행운', value: 12 }]
      },
      {
        localName: '타임티',
        status: [
          { name: '생명력', value: 10 },
          { name: '의지', value: 10 },
          { name: '행운', value: 10 }
        ]
      },
      {
        localName: '베지터블 카나페',
        status: [
          { name: '생명력', value: 25 },
          { name: '솜씨', value: -9 },
          { name: '행운', value: 12 }
        ]
      },
      {
        localName: '토마토 바질 샐러드',
        status: [
          { name: '솜씨', value: -8 },
          { name: '지력', value: 5 },
          { name: '행운', value: 5 }
        ]
      },
      {
        localName: '허브 버섯 샐러드',
        status: [
          { name: '솜씨', value: -7 },
          { name: '의지', value: 5 },
          { name: '행운', value: 5 }
        ]
      },
      {
        localName: '옥수수차',
        status: [{ name: '솜씨', value: -5 }, { name: '행운', value: 20 }]
      },
      {
        localName: '빙어 무침',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 5 },
          { name: '의지', value: 15 }
        ]
      },
      {
        localName: '빙어 튀김',
        status: [{ name: '생명력', value: 30 }, { name: '체력', value: 15 }]
      },
      {
        localName: '아브 네아 잉어 튀김',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 40 },
          { name: '솜씨', value: -20 },
          { name: '의지', value: 30 },
          { name: '지력', value: -20 }
        ]
      },
      {
        localName: '아브 네아 잉어 채소 절임',
        status: [
          { name: '생명력', value: 30 },
          { name: '마나', value: 20 },
          { name: '지력', value: 10 }
        ]
      },
      {
        localName: '아브 네아 잉어 스튜',
        status: [
          { name: '생명력', value: 25 },
          { name: '체력', value: 10 },
          { name: '의지', value: 5 },
          { name: '행운', value: 20 }
        ]
      },
      {
        localName: '메기 조개 찜',
        status: [{ name: '생명력', value: 33 }, { name: '의지', value: 35 }]
      },
      {
        localName: '메기구이',
        status: [
          { name: '생명력', value: 26 },
          { name: '체력', value: 10 },
          { name: '행운', value: 20 }
        ]
      },
      {
        localName: '메기 야채 샐러드',
        status: [
          { name: '생명력', value: 28 },
          { name: '마나', value: 30 },
          { name: '지력', value: 20 }
        ]
      },
      {
        localName: '은어 소금구이',
        status: [
          { name: '생명력', value: 25 },
          { name: '체력', value: 10 },
          { name: '솜씨', value: 10 }
        ]
      },
      {
        localName: '새우초밥',
        status: [
          { name: '생명력', value: 10 },
          { name: '솜씨', value: 7 },
          { name: '행운', value: 5 }
        ]
      },
      {
        localName: '문어초밥',
        status: [
          { name: '생명력', value: 9 },
          { name: '솜씨', value: 6 },
          { name: '행운', value: 4 }
        ]
      },
      {
        localName: 'E.O. 그랑 블라고',
        status: [
          { name: '체력', value: 30 },
          { name: '솜씨', value: -30 },
          { name: '지력', value: 30 },
          { name: '행운', value: 30 }
        ]
      },
      {
        localName: 'E.O. 에란스 크뤼',
        status: [
          { name: '체력', value: -30 },
          { name: '솜씨', value: 30 },
          { name: '지력', value: 30 },
          { name: '행운', value: 30 }
        ]
      },
      {
        localName: '어린이날 초록 솜사탕',
        status: [
          { name: '생명력', value: 20 },
          { name: '솜씨', value: 14 },
          { name: '행운', value: 10 }
        ]
      },
      {
        localName: '새우 부르스케타',
        status: [
          { name: '생명력', value: 10 },
          { name: '마나', value: 10 },
          { name: '스태미나', value: 10 },
          { name: '행운', value: 23 }
        ]
      },
      {
        localName: '아이스 마끼아또',
        status: [{ name: '생명력', value: 20 }, { name: '체력', value: 25 }]
      },
      {
        localName: '아이스 카페 모카',
        status: [
          { name: '체력', value: 20 },
          { name: '솜씨', value: 30 },
          { name: '지력', value: 30 }
        ]
      },
      {
        localName: '장어 구이',
        status: [
          { name: '생명력', value: 20 },
          { name: '체력', value: 30 },
          { name: '행운', value: -5 }
        ]
      },
      {
        localName: '주니퍼 젤리',
        status: [
          { name: '생명력', value: 5 },
          { name: '솜씨', value: 10 },
          { name: '행운', value: 15 }
        ]
      },
      {
        localName: '까르르 버섯 쿠키',
        status: [
          { name: '생명력', value: 10 },
          { name: '솜씨', value: 7 },
          { name: '행운', value: 5 }
        ]
      },
      {
        localName: '눈물 우동',
        status: [
          { name: '마나', value: 12 },
          { name: '솜씨', value: 8 },
          { name: '지력', value: 5 }
        ]
      },
      {
        localName: '크레이지 초코볼',
        status: [
          { name: '스태미나', value: 15 },
          { name: '의지', value: 10 },
          { name: '행운', value: 6 }
        ]
      },
      {
        localName: '잘난체 스테이크',
        status: [
          { name: '생명력', value: 10 },
          { name: '체력', value: 8 },
          { name: '지력', value: 7 }
        ]
      },
      {
        localName: '두근두근 가토 오 쇼콜라',
        status: [
          { name: '생명력', value: 9 },
          { name: '마나', value: 11 },
          { name: '의지', value: 8 }
        ]
      },
      {
        localName: '우정의 새우볶음밥',
        status: [
          { name: '생명력', value: 9 },
          { name: '체력', value: 8 },
          { name: '솜씨', value: 8 }
        ]
      },
      {
        localName: '에스프레소',
        status: [
          { name: '솜씨', value: 5 },
          { name: '의지', value: 15 },
          { name: '행운', value: 15 }
        ]
      },
      {
        localName: '에스프레소 마끼아또',
        status: [
          { name: '생명력', value: 5 },
          { name: '의지', value: 5 },
          { name: '행운', value: 5 }
        ]
      },
      { localName: '카푸치노', status: [{ name: '행운', value: 20 }] },
      {
        localName: '마끼아또',
        status: [{ name: '생명력', value: 10 }, { name: '체력', value: 15 }]
      },
      {
        localName: '카페 모카',
        status: [
          { name: '체력', value: 10 },
          { name: '솜씨', value: 20 },
          { name: '지력', value: 20 }
        ]
      },
      {
        localName: '토마토 페스카토레',
        status: [{ name: '스태미나', value: 30 }, { name: '체력', value: 30 }]
      }
    ]

for (const checkCooking of checkCookings) {
  const findCooking = cookings.find(cooking => cooking.localName === checkCooking.localName)
  if (typeof findCooking === typeof undefined) {
    cookings.push(checkCooking)
  } else {
    findCooking.status = checkCooking.status
  }
}

module.exports = {
  cookings
}
