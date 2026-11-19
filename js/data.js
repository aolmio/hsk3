"use strict";

const LEVELS = {
1: { name: "HSK 1", cefr: "A1", band: "Beginner", total: 500, desc: "Survival Chinese: greetings, numbers, family, food and the most common everyday phrases." },
2: { name: "HSK 2", cefr: "A2", band: "Elementary", total: 772, desc: "Simple, direct exchanges on familiar topics: routines, shopping, weather and hobbies." },
3: { name: "HSK 3", cefr: "B1", band: "Intermediate", total: 973, desc: "Handle most everyday communication while travelling, studying or working." },
4: { name: "HSK 4", cefr: "B2", band: "Upper-intermediate", total: 1000, desc: "Discuss a wide range of topics fluently with native speakers." },
5: { name: "HSK 5", cefr: "C1", band: "Advanced", total: 1071, desc: "Read newspapers and magazines, watch films and write structured texts." },
6: { name: "HSK 6", cefr: "C2", band: "Mastery", total: 1140, desc: "Understand complex written and spoken Chinese and express nuanced arguments." },
7: { name: "HSK 7–9", cefr: "C2+", band: "Advanced band", total: 5636, desc: "Professional, academic and near-native vocabulary from the HSK 3.0 and 3.1 standards." }
};

const SPEC_ROWS = [
["HSK 1", "150", "500", "300", "Greetings, personal details, ordering food, survival phrases."],
["HSK 2", "300", "1,272", "600", "Daily routines, shopping, weather and hobbies."],
["HSK 3", "600", "2,245", "900", "Independent travel and simple work conversations."],
["HSK 4", "1,200", "3,245", "1,200", "Converse fluently; common university entry threshold."],
["HSK 5", "2,500", "4,316", "1,500", "Read newspapers, watch films, follow lectures."],
["HSK 6", "5,000", "5,456", "1,800", "Professional and academic comprehension."],
["HSK 7–9", "—", "11,092", "3,000", "Advanced academic, translation and near-native mastery."]
];

const NAV_ITEMS = [
{ id: "home", label: "Home", icon: "home", group: "" },
{ id: "review", label: "Daily review", icon: "cards", group: "Learn" },
{ id: "analyzer", label: "Text analyzer", icon: "type", group: "Tools" },
{ id: "radicals", label: "Radicals", icon: "blocks", group: "Tools" },
{ id: "measure", label: "Measure words", icon: "scale", group: "Tools" },
{ id: "worksheet", label: "Worksheets", icon: "print", group: "Tools" },
{ id: "translate", label: "Translator", icon: "globe", group: "Tools" },
{ id: "sentences", label: "Sentence search", icon: "chat", group: "Tools" },
{ id: "confuse", label: "Confusables", icon: "shuffle", group: "Tools" },
{ id: "saved", label: "Saved words", icon: "star", group: "Library" },
{ id: "stats", label: "Progress", icon: "chart", group: "Library" },
{ id: "facts", label: "Facts & tips", icon: "info", group: "Guide" },
{ id: "settings", label: "Settings", icon: "sliders", group: "Guide" }
];

const SAMPLE_TEXTS = [
"你好！今天天气很好，我们一起去公园散步吧，不去不行。",
"随着科学技术的迅速发展，人工智能正在深刻地改变我们的日常生活与工作方式。",
"尽管面临着诸多挑战，这家企业依然坚持创新，最终在国际市场上取得了令人瞩目的成就。"
];

const RADICALS_DB = [
{ rad: "氵", alt: "水", py: "shuǐ", name: "三点水 · Three-dot water", meaning: "Water, liquid, rivers, fluids", examples: ["河", "海", "洗", "泳", "汉", "渴", "满", "清", "深", "流"] },
{ rad: "扌", alt: "手", py: "shǒu", name: "提手旁 · Hand", meaning: "Hand actions: hold, strike, move", examples: ["打", "找", "拿", "把", "拉", "推", "搬", "指", "接", "换"] },
{ rad: "讠", alt: "言", py: "yán", name: "言字旁 · Speech", meaning: "Speech, language, words", examples: ["说", "话", "语", "读", "请", "谢", "认", "识", "讲", "诉"] },
{ rad: "口", alt: "口", py: "kǒu", name: "口字旁 · Mouth", meaning: "Mouth, eating, calling, sounds", examples: ["吃", "喝", "叫", "唱", "吗", "呢", "吧", "听", "哭", "味"] },
{ rad: "艹", alt: "艸", py: "cǎo", name: "草字头 · Grass", meaning: "Grass, plants, flowers", examples: ["草", "花", "茶", "菜", "药", "苹", "蓝", "节", "苦", "英"] },
{ rad: "木", alt: "木", py: "mù", name: "木字旁 · Tree / wood", meaning: "Trees, wood, wooden objects", examples: ["树", "林", "森", "桌", "椅", "杯", "果", "楼", "桥", "极"] },
{ rad: "忄", alt: "心", py: "xīn", name: "竖心旁 · Heart", meaning: "Emotions, thoughts, feelings", examples: ["忙", "快", "慢", "懂", "怕", "急", "情", "想", "念", "忘"] },
{ rad: "亻", alt: "人", py: "rén", name: "单人旁 · Person", meaning: "People, human traits and actions", examples: ["你", "他", "们", "作", "休", "住", "位", "体", "信", "借"] },
{ rad: "女", alt: "女", py: "nǚ", name: "女字旁 · Woman", meaning: "Women, family relations", examples: ["妈", "姐", "妹", "她", "好", "姓", "姑", "娘", "婚", "始"] },
{ rad: "日", alt: "日", py: "rì", name: "日字旁 · Sun", meaning: "Sun, day, time, brightness", examples: ["明", "早", "晚", "昨", "晴", "时", "春", "星", "暖", "晒"] },
{ rad: "月", alt: "肉", py: "yuè", name: "月字旁 · Moon / flesh", meaning: "Moon, time periods, or body parts", examples: ["朋", "期", "朝", "胖", "腿", "脚", "脸", "肚", "脑", "背"] },
{ rad: "钅", alt: "金", py: "jīn", name: "金字旁 · Metal", meaning: "Metals, money, tools", examples: ["钱", "银", "铁", "钟", "错", "镜", "铅", "针", "钢", "铃"] },
{ rad: "饣", alt: "食", py: "shí", name: "食字旁 · Food", meaning: "Food, eating, meals", examples: ["饭", "饿", "饱", "馆", "饺", "饼", "饮", "馒", "餐"] },
{ rad: "辶", alt: "辵", py: "chuò", name: "走之底 · Walk", meaning: "Walking, roads, movement", examples: ["远", "近", "进", "送", "过", "还", "这", "那", "道", "选"] },
{ rad: "纟", alt: "糸", py: "mì", name: "绞丝旁 · Silk", meaning: "Silk, thread, fabric, connection", examples: ["红", "绿", "纸", "级", "线", "练", "经", "结", "给"] },
{ rad: "火", alt: "灬", py: "huǒ", name: "火字旁 · Fire", meaning: "Fire, heat, cooking, light", examples: ["灯", "烧", "烤", "热", "点", "照", "熟", "烟", "然"] },
{ rad: "宀", alt: "宀", py: "mián", name: "宝盖头 · Roof", meaning: "House, shelter, indoors", examples: ["家", "室", "安", "完", "客", "字", "定", "宝", "宿"] },
{ rad: "疒", alt: "疒", py: "nè", name: "病字旁 · Sickness", meaning: "Illness, pain, medical conditions", examples: ["病", "疼", "痛", "瘦", "疯", "痒", "疲"] },
{ rad: "目", alt: "目", py: "mù", name: "目字旁 · Eye", meaning: "Eye, seeing, sleep", examples: ["看", "眼", "睛", "睡", "着", "眉", "盼"] },
{ rad: "足", alt: "⻊", py: "zú", name: "足字旁 · Foot", meaning: "Foot, kicking, running, jumping", examples: ["跑", "跳", "踢", "路", "跟", "跌", "距"] },
{ rad: "刂", alt: "刀", py: "dāo", name: "立刀旁 · Knife", meaning: "Knife, cutting, dividing", examples: ["到", "别", "刚", "利", "刻"] },
{ rad: "阝", alt: "阜 / 邑", py: "fù / yì", name: "耳刀旁 · Mound / city", meaning: "Left side: hills, steps. Right side: city, place", examples: ["院", "阳", "陪", "都", "那", "部", "邮"] },
{ rad: "门", alt: "門", py: "mén", name: "门字框 · Gate", meaning: "Gate, door, opening", examples: ["门", "问", "间", "闻", "闲", "闪"] },
{ rad: "犭", alt: "犬", py: "quǎn", name: "反犬旁 · Beast", meaning: "Dogs, wild animals", examples: ["狗", "猫", "猪", "狼", "独", "猜"] },
{ rad: "山", alt: "山", py: "shān", name: "山字旁 · Mountain", meaning: "Mountains, hills, peaks", examples: ["山", "岁", "岛", "岸", "峰"] },
{ rad: "石", alt: "石", py: "shí", name: "石字旁 · Stone", meaning: "Stone, rock, minerals", examples: ["石", "码", "破", "研", "础"] },
{ rad: "雨", alt: "雨", py: "yǔ", name: "雨字头 · Rain", meaning: "Rain, weather phenomena", examples: ["雨", "雪", "雷", "零", "露"] },
{ rad: "车", alt: "車", py: "chē", name: "车字旁 · Vehicle", meaning: "Vehicles, wheels, transport", examples: ["车", "转", "较", "输", "辆", "轮"] },
{ rad: "竹", alt: "⺮", py: "zhú", name: "竹字头 · Bamboo", meaning: "Bamboo, writing tools, utensils", examples: ["笔", "第", "等", "笑", "篮", "算", "筷"] },
{ rad: "米", alt: "米", py: "mǐ", name: "米字旁 · Rice", meaning: "Rice, grain, powder", examples: ["米", "粉", "精", "粥", "糖"] },
{ rad: "衤", alt: "衣", py: "yī", name: "衣字旁 · Clothing", meaning: "Clothing, fabric, wearing", examples: ["衬", "衫", "裤", "被", "袜"] },
{ rad: "贝", alt: "貝", py: "bèi", name: "贝字旁 · Shell / money", meaning: "Shells, money, value, trade", examples: ["贝", "贵", "货", "财", "费"] },
{ rad: "力", alt: "力", py: "lì", name: "力字旁 · Strength", meaning: "Strength, effort, force", examples: ["力", "动", "助", "努", "功", "加"] },
{ rad: "土", alt: "土", py: "tǔ", name: "提土旁 · Earth", meaning: "Earth, soil, ground, places", examples: ["土", "地", "坐", "城", "场", "块"] },
{ rad: "禾", alt: "禾", py: "hé", name: "禾木旁 · Grain", meaning: "Grain, crops, seasons", examples: ["秋", "种", "租", "科", "程"] },
{ rad: "攵", alt: "攴", py: "pū", name: "反文旁 · Tap", meaning: "Action, striking, doing", examples: ["放", "收", "教", "数", "故", "政"] },
{ rad: "走", alt: "走", py: "zǒu", name: "走字旁 · Walk", meaning: "Walking, running, going", examples: ["走", "起", "超", "越", "赶"] },
{ rad: "大", alt: "大", py: "dà", name: "大字头 · Big", meaning: "Big, great; a person with arms spread", examples: ["大", "太", "天", "夫", "奇", "套"] },
{ rad: "彳", alt: "彳", py: "chì", name: "双人旁 · Step", meaning: "Steps, walking, movement", examples: ["很", "得", "往", "德", "律"] },
{ rad: "广", alt: "广", py: "guǎng", name: "广字头 · Wide roof", meaning: "Buildings, shops, spaces", examples: ["店", "床", "度", "座", "应", "库"] },
{ rad: "囗", alt: "囗", py: "wéi", name: "国字框 · Enclosure", meaning: "Enclosure, boundary, country", examples: ["国", "园", "图", "回", "因", "困"] },
{ rad: "巾", alt: "巾", py: "jīn", name: "巾字旁 · Cloth", meaning: "Cloth, towels, fabric", examples: ["帮", "希", "常", "帽", "布"] },
{ rad: "页", alt: "頁", py: "yè", name: "页字旁 · Head / page", meaning: "Head, face, page", examples: ["页", "题", "顺", "颜", "预"] },
{ rad: "欠", alt: "欠", py: "qiàn", name: "欠字旁 · Yawn / lack", meaning: "Open mouth, breath, lack", examples: ["次", "欢", "歌", "欠"] }
];

const PHONO_FAMILIES = [
{ root: "青", py: "qīng", note: "blue-green; young", members: [
{ hz: "请", py: "qǐng", rad: "讠 speech", mean: "please; to invite" },
{ hz: "清", py: "qīng", rad: "氵 water", mean: "clear; pure" },
{ hz: "情", py: "qíng", rad: "忄 heart", mean: "feeling; emotion" },
{ hz: "晴", py: "qíng", rad: "日 sun", mean: "sunny; clear sky" },
{ hz: "睛", py: "jīng", rad: "目 eye", mean: "eyeball (眼睛)" }
] },
{ root: "包", py: "bāo", note: "to wrap; bag", members: [
{ hz: "饱", py: "bǎo", rad: "饣 food", mean: "full (from eating)" },
{ hz: "抱", py: "bào", rad: "扌 hand", mean: "to hug; to hold" },
{ hz: "跑", py: "pǎo", rad: "足 foot", mean: "to run" },
{ hz: "泡", py: "pào", rad: "氵 water", mean: "bubble; to soak" }
] },
{ root: "马", py: "mǎ", note: "horse", members: [
{ hz: "妈", py: "mā", rad: "女 woman", mean: "mother" },
{ hz: "吗", py: "ma", rad: "口 mouth", mean: "question particle" },
{ hz: "骂", py: "mà", rad: "口口 mouths", mean: "to scold" },
{ hz: "码", py: "mǎ", rad: "石 stone", mean: "number; code" }
] },
{ root: "巴", py: "bā", note: "to hope; to cling", members: [
{ hz: "吧", py: "ba", rad: "口 mouth", mean: "suggestion particle" },
{ hz: "爸", py: "bà", rad: "父 father", mean: "father; dad" },
{ hz: "把", py: "bǎ", rad: "扌 hand", mean: "to hold; handle" },
{ hz: "爬", py: "pá", rad: "爪 claw", mean: "to climb; to crawl" }
] },
{ root: "反", py: "fǎn", note: "opposite; to turn over", members: [
{ hz: "饭", py: "fàn", rad: "饣 food", mean: "cooked rice; meal" },
{ hz: "板", py: "bǎn", rad: "木 wood", mean: "board; plank" },
{ hz: "版", py: "bǎn", rad: "片 slice", mean: "edition; printing plate" },
{ hz: "贩", py: "fàn", rad: "贝 trade", mean: "to peddle" },
{ hz: "返", py: "fǎn", rad: "辶 walk", mean: "to return" }
] },
{ root: "方", py: "fāng", note: "square; direction", members: [
{ hz: "房", py: "fáng", rad: "户 door", mean: "house; room" },
{ hz: "访", py: "fǎng", rad: "讠 speech", mean: "to visit; to interview" },
{ hz: "放", py: "fàng", rad: "攵 action", mean: "to put; to release" },
{ hz: "芳", py: "fāng", rad: "艹 plant", mean: "fragrant" },
{ hz: "防", py: "fáng", rad: "阝 mound", mean: "to defend; to prevent" }
] },
{ root: "古", py: "gǔ", note: "ancient", members: [
{ hz: "姑", py: "gū", rad: "女 woman", mean: "paternal aunt" },
{ hz: "枯", py: "kū", rad: "木 wood", mean: "withered" },
{ hz: "估", py: "gū", rad: "亻 person", mean: "to estimate" },
{ hz: "故", py: "gù", rad: "攵 action", mean: "reason; former" },
{ hz: "苦", py: "kǔ", rad: "艹 plant", mean: "bitter" }
] },
{ root: "分", py: "fēn", note: "to divide; minute", members: [
{ hz: "粉", py: "fěn", rad: "米 rice", mean: "powder; pink" },
{ hz: "芬", py: "fēn", rad: "艹 plant", mean: "fragrance" },
{ hz: "纷", py: "fēn", rad: "纟 thread", mean: "numerous; tangled" },
{ hz: "份", py: "fèn", rad: "亻 person", mean: "portion; share" }
] },
{ root: "乍", py: "zhà", note: "suddenly", members: [
{ hz: "作", py: "zuò", rad: "亻 person", mean: "to do; to make" },
{ hz: "昨", py: "zuó", rad: "日 sun", mean: "yesterday" },
{ hz: "怎", py: "zěn", rad: "心 heart", mean: "how" },
{ hz: "诈", py: "zhà", rad: "讠 speech", mean: "to cheat" }
] },
{ root: "每", py: "měi", note: "every", members: [
{ hz: "海", py: "hǎi", rad: "氵 water", mean: "sea" },
{ hz: "悔", py: "huǐ", rad: "忄 heart", mean: "to regret" },
{ hz: "梅", py: "méi", rad: "木 wood", mean: "plum" }
] }
];

const MEASURE_WORDS = [
{ mw: "个", py: "gè", use: "General classifier for people, objects and abstract things", nouns: [["人", "rén", "person"], ["朋友", "péngyou", "friend"], ["问题", "wèntí", "question; problem"], ["苹果", "píngguǒ", "apple"], ["星期", "xīngqī", "week"]] },
{ mw: "本", py: "běn", use: "Bound volumes: books, notebooks, magazines", nouns: [["书", "shū", "book"], ["词典", "cídiǎn", "dictionary"], ["杂志", "zázhì", "magazine"], ["笔记本", "bǐjìběn", "notebook"]] },
{ mw: "张", py: "zhāng", use: "Flat surfaces: paper, tickets, tables, beds, photos", nouns: [["桌子", "zhuōzi", "table"], ["床", "chuáng", "bed"], ["纸", "zhǐ", "paper"], ["票", "piào", "ticket"], ["照片", "zhàopiàn", "photo"]] },
{ mw: "条", py: "tiáo", use: "Long, narrow things: fish, roads, rivers, trousers", nouns: [["鱼", "yú", "fish"], ["裤子", "kùzi", "trousers"], ["河", "hé", "river"], ["路", "lù", "road"], ["狗", "gǒu", "dog"], ["新闻", "xīnwén", "news item"]] },
{ mw: "件", py: "jiàn", use: "Clothing (upper body), luggage, matters, gifts", nouns: [["衣服", "yīfu", "clothes"], ["衬衫", "chènshān", "shirt"], ["事", "shì", "matter"], ["礼物", "lǐwù", "gift"], ["行李", "xíngli", "luggage"]] },
{ mw: "辆", py: "liàng", use: "Wheeled vehicles", nouns: [["汽车", "qìchē", "car"], ["自行车", "zìxíngchē", "bicycle"], ["公共汽车", "gōnggòng qìchē", "bus"], ["出租车", "chūzūchē", "taxi"]] },
{ mw: "把", py: "bǎ", use: "Objects with a handle or that you grasp", nouns: [["椅子", "yǐzi", "chair"], ["伞", "sǎn", "umbrella"], ["刀", "dāo", "knife"], ["钥匙", "yàoshi", "key"]] },
{ mw: "位", py: "wèi", use: "Polite measure word for people", nouns: [["老师", "lǎoshī", "teacher"], ["客人", "kèrén", "guest"], ["先生", "xiānsheng", "gentleman"], ["顾客", "gùkè", "customer"]] },
{ mw: "只", py: "zhī", use: "Small animals, birds, one of a pair", nouns: [["猫", "māo", "cat"], ["鸟", "niǎo", "bird"], ["手", "shǒu", "hand"], ["眼睛", "yǎnjing", "eye"]] },
{ mw: "双", py: "shuāng", use: "Pairs of things", nouns: [["鞋", "xié", "shoes"], ["筷子", "kuàizi", "chopsticks"], ["袜子", "wàzi", "socks"]] },
{ mw: "杯", py: "bēi", use: "A cup or glass of a drink", nouns: [["水", "shuǐ", "water"], ["茶", "chá", "tea"], ["咖啡", "kāfēi", "coffee"], ["牛奶", "niúnǎi", "milk"]] },
{ mw: "家", py: "jiā", use: "Families, businesses and establishments", nouns: [["医院", "yīyuàn", "hospital"], ["公司", "gōngsī", "company"], ["饭馆", "fànguǎn", "restaurant"], ["银行", "yínháng", "bank"]] },
{ mw: "座", py: "zuò", use: "Large, fixed structures", nouns: [["山", "shān", "mountain"], ["桥", "qiáo", "bridge"], ["城市", "chéngshì", "city"], ["大楼", "dàlóu", "building"]] },
{ mw: "棵", py: "kē", use: "Trees and plants", nouns: [["树", "shù", "tree"], ["草", "cǎo", "grass"], ["白菜", "báicài", "cabbage"]] },
{ mw: "台", py: "tái", use: "Machines, appliances, performances", nouns: [["电脑", "diànnǎo", "computer"], ["电视", "diànshì", "television"], ["洗衣机", "xǐyījī", "washing machine"]] },
{ mw: "封", py: "fēng", use: "Sealed items such as letters", nouns: [["信", "xìn", "letter"], ["电子邮件", "diànzǐ yóujiàn", "email"]] },
{ mw: "份", py: "fèn", use: "Portions, jobs, newspapers, documents", nouns: [["工作", "gōngzuò", "job"], ["报纸", "bàozhǐ", "newspaper"], ["礼物", "lǐwù", "gift"], ["午饭", "wǔfàn", "lunch"]] },
{ mw: "次", py: "cì", use: "Occasions and times (also counts actions)", nouns: [["旅行", "lǚxíng", "trip"], ["机会", "jīhuì", "opportunity"], ["考试", "kǎoshì", "exam"], ["经验", "jīngyàn", "experience"]] },
{ mw: "块", py: "kuài", use: "Chunks, pieces, lumps; also yuan (money)", nouns: [["蛋糕", "dàngāo", "cake"], ["手表", "shǒubiǎo", "watch"], ["肉", "ròu", "meat"], ["石头", "shítou", "stone"]] },
{ mw: "种", py: "zhǒng", use: "Kinds and types", nouns: [["水果", "shuǐguǒ", "fruit"], ["颜色", "yánsè", "color"], ["方法", "fāngfǎ", "method"], ["动物", "dòngwù", "animal"]] },
{ mw: "场", py: "chǎng", use: "Events: rain, films, matches, games", nouns: [["雨", "yǔ", "rain"], ["电影", "diànyǐng", "movie"], ["比赛", "bǐsài", "match"], ["雪", "xuě", "snow"]] },
{ mw: "部", py: "bù", use: "Films, phones, novels, machines", nouns: [["电影", "diànyǐng", "movie"], ["手机", "shǒujī", "mobile phone"], ["小说", "xiǎoshuō", "novel"]] },
{ mw: "朵", py: "duǒ", use: "Flowers and clouds", nouns: [["花", "huā", "flower"], ["云", "yún", "cloud"]] },
{ mw: "支", py: "zhī", use: "Stick-like things, songs, teams", nouns: [["笔", "bǐ", "pen"], ["歌", "gē", "song"], ["队伍", "duìwu", "team"]] },
{ mw: "瓶", py: "píng", use: "Bottles of liquid", nouns: [["啤酒", "píjiǔ", "beer"], ["可乐", "kělè", "cola"], ["水", "shuǐ", "water"]] },
{ mw: "碗", py: "wǎn", use: "Bowls of food", nouns: [["米饭", "mǐfàn", "rice"], ["面条", "miàntiáo", "noodles"], ["汤", "tāng", "soup"]] },
{ mw: "名", py: "míng", use: "People with a role or profession", nouns: [["学生", "xuésheng", "student"], ["医生", "yīshēng", "doctor"], ["记者", "jìzhě", "reporter"], ["运动员", "yùndòngyuán", "athlete"]] },
{ mw: "头", py: "tóu", use: "Large domestic animals", nouns: [["牛", "niú", "cow"], ["猪", "zhū", "pig"], ["驴", "lǘ", "donkey"]] },
{ mw: "句", py: "jù", use: "Sentences, lines of speech or verse", nouns: [["话", "huà", "words"], ["诗", "shī", "poem line"]] },
{ mw: "套", py: "tào", use: "Sets and suites", nouns: [["房子", "fángzi", "apartment"], ["衣服", "yīfu", "outfit"], ["书", "shū", "set of books"]] },
{ mw: "篇", py: "piān", use: "Written pieces", nouns: [["文章", "wénzhāng", "article"], ["作文", "zuòwén", "essay"], ["论文", "lùnwén", "paper"]] },
{ mw: "间", py: "jiān", use: "Rooms and enclosed spaces", nouns: [["房间", "fángjiān", "room"], ["教室", "jiàoshì", "classroom"], ["屋子", "wūzi", "room"]] },
{ mw: "顿", py: "dùn", use: "Meals", nouns: [["饭", "fàn", "meal"], ["早饭", "zǎofàn", "breakfast"]] },
{ mw: "首", py: "shǒu", use: "Songs and poems", nouns: [["歌", "gē", "song"], ["诗", "shī", "poem"]] },
{ mw: "道", py: "dào", use: "Dishes, questions, long thin things", nouns: [["菜", "cài", "dish"], ["题", "tí", "question"], ["门", "mén", "door"]] },
{ mw: "节", py: "jié", use: "Class periods, sections, batteries", nouns: [["课", "kè", "class"], ["电池", "diànchí", "battery"]] },
{ mw: "群", py: "qún", use: "Groups and crowds", nouns: [["人", "rén", "crowd"], ["鸟", "niǎo", "flock of birds"], ["孩子", "háizi", "group of children"]] },
{ mw: "根", py: "gēn", use: "Slender, rod-like things", nouns: [["香蕉", "xiāngjiāo", "banana"], ["头发", "tóufa", "hair"], ["绳子", "shéngzi", "rope"]] }
];

const BUILTIN_SENTENCES = [
["我非常喜欢学习汉语和了解中国文化。", "I really like learning Chinese and getting to know Chinese culture."],
["因为今天下大雨，所以我们决定留在家里看书。", "Because it rained heavily today, we decided to stay home and read."],
["虽然这道题很难，但是他还是好不容易做出来了。", "Although this question was very hard, he finally managed to solve it."],
["如果你明天有空，我们一起去喝杯咖啡怎么样？", "If you are free tomorrow, how about we get a coffee together?"],
["这两个词的意思差不多，但是在用法上有一点儿区别。", "These two words mean almost the same, but there is a slight difference in usage."],
["他正在跟朋友们讨论周末去哪儿旅游呢。", "He is discussing with his friends where to travel this weekend."],
["你好！我叫李明，我是学生。", "Hello! My name is Li Ming and I am a student."],
["你今天想吃什么？", "What do you want to eat today?"],
["我每天早上七点起床。", "I get up at seven every morning."],
["这个多少钱？", "How much is this?"],
["请问，洗手间在哪儿？", "Excuse me, where is the restroom?"],
["我不知道他是谁。", "I don't know who he is."],
["他的汉语说得很好。", "He speaks Chinese very well."],
["明天天气怎么样？", "What will the weather be like tomorrow?"],
["我想买一本书和两支笔。", "I want to buy a book and two pens."],
["我们一起去公园散步吧。", "Let's go for a walk in the park together."],
["你住在哪里？", "Where do you live?"],
["我有一个哥哥和一个妹妹。", "I have an older brother and a younger sister."],
["请你再说一遍。", "Please say it one more time."],
["现在几点了？", "What time is it now?"],
["这件衣服太贵了，能便宜一点儿吗？", "This piece of clothing is too expensive. Can it be a bit cheaper?"],
["他每个周末都去游泳。", "He goes swimming every weekend."],
["我昨天晚上看了一部很有意思的电影。", "Last night I watched a very interesting movie."],
["如果不努力学习，你就不能通过考试。", "If you don't study hard, you won't be able to pass the exam."],
["虽然他很忙，但是每天都坚持锻炼身体。", "Although he is busy, he keeps exercising every day."],
["你能帮我拿一下这个箱子吗？", "Could you help me carry this suitcase?"],
["千里之行，始于足下。", "A journey of a thousand miles begins with a single step."],
["好好学习，天天向上。", "Study hard and improve every day."],
["我手机没电了，可以用一下你的吗？", "My phone is out of battery. May I use yours for a moment?"],
["不管遇到什么困难，我们都不会放弃。", "No matter what difficulties we meet, we will not give up."]
];

const SEED_DICT = `
爱|ài|to love; to be fond of|1
八|bā|eight|1
爸爸|bàba|dad; father|1
杯子|bēizi|cup; glass|1
北京|Běijīng|Beijing|1
本|běn|measure word for books|1
不|bù|not; no|1
不客气|bù kèqi|you're welcome; don't mention it|1
菜|cài|dish; vegetable|1
茶|chá|tea|1
吃|chī|to eat|1
出租车|chūzūchē|taxi|1
打电话|dǎ diànhuà|to make a phone call|1
大|dà|big; large|1
的|de|possessive particle; of|1
点|diǎn|o'clock; dot; a little|1
电脑|diànnǎo|computer|1
电视|diànshì|television|1
电影|diànyǐng|movie; film|1
东西|dōngxi|thing; stuff|1
都|dōu|all; both|1
读|dú|to read aloud; to study|1
对不起|duìbuqǐ|sorry; I beg your pardon|1
多|duō|many; much|1
多少|duōshao|how many; how much|1
儿子|érzi|son|1
二|èr|two|1
饭馆|fànguǎn|restaurant|1
飞机|fēijī|airplane|1
分钟|fēnzhōng|minute|1
高兴|gāoxìng|happy; glad|1
个|gè|general measure word|1
工作|gōngzuò|to work; job|1
狗|gǒu|dog|1
汉语|Hànyǔ|Chinese language|1
好|hǎo|good; well; fine|1
喝|hē|to drink|1
和|hé|and; with|1
很|hěn|very|1
后面|hòumiàn|back; behind|1
回|huí|to return; to go back|1
会|huì|can; to be able to; will|1
几|jǐ|how many; several|1
家|jiā|home; family|1
叫|jiào|to be called; to call|1
今天|jīntiān|today|1
九|jiǔ|nine|1
开|kāi|to open; to drive; to start|1
看|kàn|to look; to watch; to read|1
看见|kànjiàn|to see; to catch sight of|1
块|kuài|piece; yuan (colloquial)|1
来|lái|to come|1
老师|lǎoshī|teacher|1
了|le|particle for completed action or change|1
冷|lěng|cold|1
里|lǐ|inside; in|1
六|liù|six|1
吗|ma|question particle|1
买|mǎi|to buy|1
猫|māo|cat|1
没关系|méi guānxi|it doesn't matter; never mind|1
没有|méiyǒu|not have; there is not|1
米饭|mǐfàn|cooked rice|1
明天|míngtiān|tomorrow|1
名字|míngzi|name|1
那|nà|that|1
哪|nǎ|which|1
呢|ne|particle for follow-up questions|1
能|néng|can; to be able to|1
你|nǐ|you|1
你好|nǐ hǎo|hello; hi|1
年|nián|year|1
女儿|nǚ'ér|daughter|1
朋友|péngyou|friend|1
漂亮|piàoliang|pretty; beautiful|1
苹果|píngguǒ|apple|1
七|qī|seven|1
钱|qián|money|1
前面|qiánmiàn|front; ahead|1
请|qǐng|please; to invite|1
去|qù|to go|1
热|rè|hot|1
人|rén|person; people|1
认识|rènshi|to know (someone); to recognize|1
三|sān|three|1
商店|shāngdiàn|shop; store|1
上|shàng|up; above; to go up|1
上午|shàngwǔ|morning|1
少|shǎo|few; less|1
谁|shéi|who|1
什么|shénme|what|1
十|shí|ten|1
时候|shíhou|time; moment|1
是|shì|to be; yes|1
书|shū|book|1
水|shuǐ|water|1
水果|shuǐguǒ|fruit|1
睡觉|shuìjiào|to sleep|1
说|shuō|to speak; to say|1
四|sì|four|1
岁|suì|years old; year of age|1
他|tā|he; him|1
她|tā|she; her|1
太|tài|too; extremely|1
天气|tiānqì|weather|1
听|tīng|to listen|1
同学|tóngxué|classmate|1
喂|wèi|hello (on the phone)|1
我|wǒ|I; me|1
我们|wǒmen|we; us|1
五|wǔ|five|1
喜欢|xǐhuan|to like|1
下|xià|down; below; next|1
下午|xiàwǔ|afternoon|1
下雨|xià yǔ|to rain|1
先生|xiānsheng|Mr.; sir; husband|1
现在|xiànzài|now|1
想|xiǎng|to want to; to think|1
小|xiǎo|small; little|1
小姐|xiǎojiě|Miss; young lady|1
些|xiē|some; a few|1
写|xiě|to write|1
谢谢|xièxie|thanks; thank you|1
星期|xīngqī|week|1
学生|xuésheng|student|1
学习|xuéxí|to study; to learn|1
学校|xuéxiào|school|1
一|yī|one|1
衣服|yīfu|clothes|1
医生|yīshēng|doctor|1
医院|yīyuàn|hospital|1
椅子|yǐzi|chair|1
有|yǒu|to have; there is|1
月|yuè|month; moon|1
在|zài|to be at; in; at|1
再见|zàijiàn|goodbye|1
怎么|zěnme|how; why|1
怎么样|zěnmeyàng|how about; how is it|1
这|zhè|this|1
中国|Zhōngguó|China|1
中午|zhōngwǔ|noon|1
住|zhù|to live; to stay|1
桌子|zhuōzi|table; desk|1
字|zì|character; word|1
昨天|zuótiān|yesterday|1
坐|zuò|to sit; to travel by|1
做|zuò|to do; to make|1
吧|ba|particle for suggestion|2
白|bái|white|2
百|bǎi|hundred|2
帮助|bāngzhù|to help|2
报纸|bàozhǐ|newspaper|2
比|bǐ|to compare; than|2
别|bié|don't; other|2
长|cháng|long|2
唱歌|chàng gē|to sing|2
穿|chuān|to wear; to put on|2
次|cì|time; occasion|2
从|cóng|from|2
错|cuò|wrong; mistake|2
但是|dànshì|but; however|2
到|dào|to arrive; to reach|2
得|de|structural particle after verb|2
等|děng|to wait|2
弟弟|dìdi|younger brother|2
懂|dǒng|to understand|2
非常|fēicháng|very; extremely|2
告诉|gàosu|to tell|2
哥哥|gēge|older brother|2
给|gěi|to give; for|2
公司|gōngsī|company|2
贵|guì|expensive|2
国|guó|country|2
过|guò|to pass; to spend (time); experienced|2
还|hái|still; also|2
孩子|háizi|child|2
黑|hēi|black|2
红|hóng|red|2
觉得|juéde|to feel; to think|2
姐姐|jiějie|older sister|2
考试|kǎoshì|exam; to take an exam|2
可能|kěnéng|maybe; possible|2
可以|kěyǐ|can; may|2
课|kè|class; lesson|2
快|kuài|fast; quick|2
累|lèi|tired|2
离|lí|to be away from|2
两|liǎng|two (before measure words)|2
路|lù|road|2
旅游|lǚyóu|to travel; tourism|2
卖|mài|to sell|2
慢|màn|slow|2
忙|máng|busy|2
每|měi|every; each|2
妹妹|mèimei|younger sister|2
门|mén|door; gate|2
面条|miàntiáo|noodles|2
您|nín|you (polite)|2
牛奶|niúnǎi|milk|2
旁边|pángbiān|beside; next to|2
跑步|pǎobù|to run; to jog|2
便宜|piányi|cheap|2
起床|qǐchuáng|to get up|2
千|qiān|thousand|2
晴|qíng|clear; sunny|2
去年|qùnián|last year|2
让|ràng|to let; to make; to allow|2
上班|shàngbān|to go to work|2
身体|shēntǐ|body; health|2
生病|shēngbìng|to fall ill|2
生日|shēngrì|birthday|2
手机|shǒujī|mobile phone|2
送|sòng|to give as a gift; to see off|2
虽然|suīrán|although|2
所以|suǒyǐ|so; therefore|2
它|tā|it|2
题|tí|question; problem|2
跳舞|tiàowǔ|to dance|2
外|wài|outside; foreign|2
完|wán|to finish; to complete|2
玩|wán|to play; to have fun|2
晚上|wǎnshang|evening; night|2
为什么|wèishénme|why|2
问|wèn|to ask|2
问题|wèntí|question; problem|2
希望|xīwàng|to hope; hope|2
洗|xǐ|to wash|2
笑|xiào|to smile; to laugh|2
新|xīn|new|2
一起|yīqǐ|together|2
已经|yǐjīng|already|2
因为|yīnwèi|because|2
眼睛|yǎnjing|eye|2
药|yào|medicine|2
要|yào|to want; to need; will|2
也|yě|also; too|2
意思|yìsi|meaning; idea|2
游泳|yóuyǒng|to swim|2
鱼|yú|fish|2
远|yuǎn|far|2
运动|yùndòng|sport; to exercise|2
再|zài|again; then|2
早上|zǎoshang|morning|2
丈夫|zhàngfu|husband|2
找|zhǎo|to look for|2
着|zhe|particle for continuing state|2
真|zhēn|really; truly|2
正在|zhèngzài|in the process of|2
知道|zhīdào|to know|2
准备|zhǔnbèi|to prepare; to plan|2
走|zǒu|to walk; to go|2
最|zuì|most; -est|2
左边|zuǒbian|left side|2
爱好|àihào|hobby|3
安静|ānjìng|quiet|3
把|bǎ|to hold; marker for handled objects|3
班|bān|class; team|3
半|bàn|half|3
办法|bànfǎ|method; way|3
帮忙|bāngmáng|to help; to do a favor|3
比较|bǐjiào|relatively; to compare|3
比赛|bǐsài|match; competition|3
必须|bìxū|must; have to|3
变化|biànhuà|change|3
别人|biéren|other people|3
才|cái|only then; not until|3
参加|cānjiā|to participate in|3
超市|chāoshì|supermarket|3
成绩|chéngjì|result; grades|3
城市|chéngshì|city|3
词典|cídiǎn|dictionary|3
聪明|cōngmíng|clever; smart|3
打算|dǎsuàn|to plan; plan|3
带|dài|to bring; to take along|3
担心|dānxīn|to worry|3
蛋糕|dàngāo|cake|3
当然|dāngrán|of course|3
地|de|adverbial particle (-ly)|3
地方|dìfang|place|3
地铁|dìtiě|subway|3
发现|fāxiàn|to discover|3
方便|fāngbiàn|convenient|3
放心|fàngxīn|to rest assured|3
复习|fùxí|to review|3
干净|gānjìng|clean|3
感冒|gǎnmào|to catch a cold; a cold|3
公园|gōngyuán|park|3
故事|gùshi|story|3
关系|guānxi|relationship|3
关于|guānyú|about; regarding|3
国家|guójiā|country; nation|3
还是|háishi|or; still|3
害怕|hàipà|to be afraid|3
环境|huánjìng|environment|3
黄|huáng|yellow|3
会议|huìyì|meeting|3
机会|jīhuì|opportunity|3
记得|jìde|to remember|3
健康|jiànkāng|healthy; health|3
经常|jīngcháng|often|3
决定|juédìng|to decide; decision|3
如果|rúguǒ|if; in case|3
文化|wénhuà|culture|3
历史|lìshǐ|history|3
世界|shìjiè|world|3
一定|yídìng|surely; must|3
奇怪|qíguài|strange|3
散步|sànbù|to take a walk|4
坚持|jiānchí|to persevere; to insist on|4
锻炼|duànliàn|to exercise; to train|4
语法|yǔfǎ|grammar|4
区别|qūbié|difference|4
讨论|tǎolùn|to discuss|4
通过|tōngguò|to pass through; by means of|4
努力|nǔlì|to try hard; effort|4
放弃|fàngqì|to give up|4
困难|kùnnan|difficulty; difficult|4
欢迎|huānyíng|to welcome|2
光临|guānglín|to honor with one's presence|5
迅速|xùnsù|rapid; swift|5
改变|gǎibiàn|to change|4
日常|rìcháng|daily; everyday|5
深刻|shēnkè|profound; deep|6
人工智能|réngōng zhìnéng|artificial intelligence|6
科学|kēxué|science|3
技术|jìshù|technology; skill|5
发展|fāzhǎn|to develop; development|4
挑战|tiǎozhàn|challenge|5
企业|qǐyè|enterprise; company|5
创新|chuàngxīn|to innovate; innovation|5
国际|guójì|international|5
市场|shìchǎng|market|5
成就|chéngjiù|achievement|5
令人瞩目|lìng rén zhǔmù|eye-catching; remarkable|7
面临|miànlín|to face; to be confronted with|5
诸多|zhūduō|many; numerous|7
尽管|jǐnguǎn|although; despite|5
最终|zuìzhōng|finally; ultimately|5
依然|yīrán|still; as before|5
取得|qǔdé|to obtain; to achieve|5
今|jīn|now; present; today|1
天|tiān|day; sky; heaven|1
气|qì|air; gas; spirit; weather|1
公|gōng|public; common; fair|2
园|yuán|garden; park|2
散|sàn|to scatter; leisurely|4
步|bù|step; pace; walk|2
们|men|plural marker for people|1
学|xué|to learn; to study|1
习|xí|to practice; habit|1
汉|hàn|Han Chinese|1
语|yǔ|language; speech|1
法|fǎ|law; method|3
欢|huān|joyful; happy|1
迎|yíng|to welcome|2
光|guāng|light; bright; only|4
临|lín|to face; to arrive|5
喜|xǐ|to like; happy|1
起|qǐ|to rise; to start|1
道|dào|road; way; to say|2
里|lǐ|inside; lining|1
行|xíng|to walk; capable; all right|2
始|shǐ|to begin; start|2
于|yú|at; in; from|3
足|zú|foot; enough|3
如|rú|if; as; like|3
果|guǒ|fruit; result|1
持|chí|to hold; to maintain|4
定|dìng|to fix; to decide|3
越|yuè|to exceed; the more|3
向|xiàng|toward; direction|3
而|ér|and; but; yet|4
思|sī|to think; to consider|2
则|zé|rule; then|4
知|zhī|to know|2
为|wéi|to act as; for|3
全|quán|whole; complete|3
面|miàn|face; surface; noodles|2
科|kē|branch of study; division|3
发|fā|to send out; to develop|3
展|zhǎn|to spread out; to exhibit|4
挑|tiāo|to choose; to carry|5
战|zhàn|war; to fight|5
新闻|xīnwén|news|3
好好学习|hǎohǎo xuéxí|study hard|2
天天向上|tiāntiān xiàngshàng|improve every day|3
千里之行|qiān lǐ zhī xíng|a journey of a thousand miles|6
始于足下|shǐ yú zú xià|begins with a single step|6
`;

