"use strict";
const WORD_CATS = [
{ id: "questions", short: "Questions", zh: "疑问词", title: "Question words", icon: "search", desc: "Ask who, what, where, when, why and how. Chinese keeps the word order of a statement: the question word simply takes the place of the answer.", tips: ["Replace the missing information with a question word: 你去哪儿？ (Where are you going?) – answer 我去学校。", "Never combine 吗 with another question word: say 你叫什么名字？, not 你叫什么名字吗？", "吗 turns any statement into a yes/no question; A-不-A (好不好, 是不是) is the neutral alternative.", "多 + adjective asks degree: 多大 (how old/big), 多高 (how tall), 多远 (how far), 多久 (how long)."], raw: `
#Who, what, which
谁|shéi|who; whom|1|他是谁？|Who is he?
什么|shénme|what; any|1|你想吃什么？|What do you want to eat?
哪|nǎ|which|1|你是哪国人？|Which country are you from?
哪个|nǎge|which one|1|你喜欢哪个？|Which one do you like?
什么样|shénmeyàng|what kind of|3|你喜欢什么样的人？|What kind of person do you like?
#Where, when
哪儿|nǎr|where (colloquial)|1|你去哪儿？|Where are you going?
哪里|nǎlǐ|where; (modest denial)|1|洗手间在哪里？|Where is the restroom?
什么时候|shénme shíhou|when|2|你什么时候下班？|When do you get off work?
几点|jǐ diǎn|what time|1|现在几点？|What time is it now?
多久|duōjiǔ|how long|3|你学了多久中文？|How long have you studied Chinese?
#How many, how much
几|jǐ|how many (small numbers)|1|你家有几口人？|How many people are in your family?
多少|duōshao|how many; how much|1|这个多少钱？|How much is this?
多|duō|how (+ adjective)|2|你多大了？|How old are you?
多远|duō yuǎn|how far|3|学校离这儿多远？|How far is the school from here?
多长|duō cháng|how long (length)|3|这条路多长？|How long is this road?
#How and why
怎么|zěnme|how; why|1|这个字怎么读？|How do you read this character?
怎么样|zěnmeyàng|how about; how is|1|今天天气怎么样？|How is the weather today?
怎样|zěnyàng|how; in what way|2|你怎样去学校？|How do you get to school?
怎么办|zěnme bàn|what to do|3|我们现在怎么办？|What should we do now?
为什么|wèishénme|why|2|你为什么不来？|Why aren't you coming?
干吗|gànmá|why; what for|4|你干吗哭？|Why are you crying?
如何|rúhé|how (formal)|5|你打算如何解决问题？|How do you plan to solve the problem?
#Question particles and tags
吗|ma|yes/no question particle|1|你是学生吗？|Are you a student?
呢|ne|and you?; what about?|1|我很好，你呢？|I'm fine, and you?
吧|ba|right?; suggestion|2|你是老师吧？|You're a teacher, right?
是不是|shì bu shì|is it true that…?|3|你是不是累了？|Are you tired?
好不好|hǎo bu hǎo|okay?|2|我们去看电影，好不好？|Shall we go to a movie, okay?
对不对|duì bu duì|right?|3|这样做对不对？|Is it right to do it this way?
可不可以|kě bu kěyǐ|may I?|3|我可不可以坐这儿？|May I sit here?
难道|nándào|could it be that…? (rhetorical)|5|难道你不知道吗？|Don't tell me you didn't know?
是否|shìfǒu|whether or not (formal)|6|请告诉我你是否同意。|Please tell me whether you agree.
`},
{ id: "pronouns", short: "Pronouns", zh: "代词", title: "Pronouns", icon: "eye", desc: "Personal, demonstrative and indefinite pronouns. Chinese pronouns never change form for case: 我 is both “I” and “me”.", tips: ["Add 们 for plurals: 我们, 你们, 他们 (not for 大家).", "他, 她 and 它 sound identical (tā) and differ only in writing.", "咱们 includes the listener; 我们 may or may not.", "这/那 need a measure word before a noun: 这本书, 那个人."], raw: `
#Personal pronouns
我|wǒ|I; me|1|我是中国人。|I am Chinese.
你|nǐ|you|1|你好！|Hello!
您|nín|you (polite)|2|您请坐。|Please sit down.
他|tā|he; him|1|他是我朋友。|He is my friend.
她|tā|she; her|1|她很漂亮。|She is beautiful.
它|tā|it|3|它是一只小狗。|It is a little dog.
我们|wǒmen|we; us|1|我们一起去吧。|Let's go together.
你们|nǐmen|you (plural)|1|你们好！|Hello, everyone!
他们|tāmen|they (people)|1|他们在看书。|They are reading.
她们|tāmen|they (women)|2|她们是同学。|They are classmates.
咱们|zánmen|we (including listener)|3|咱们走吧。|Let's go.
大家|dàjiā|everyone|2|大家好！|Hello, everyone!
自己|zìjǐ|oneself; own|3|我自己做饭。|I cook for myself.
别人|biéren|other people|3|别人怎么想不重要。|What others think isn't important.
人家|rénjia|others; I (coquettish)|5|人家都走了。|The others have all left.
彼此|bǐcǐ|each other|6|我们彼此了解。|We understand each other.
#Demonstratives
这|zhè|this|1|这是我的书。|This is my book.
那|nà|that|1|那是什么？|What is that?
这个|zhège|this one|1|这个多少钱？|How much is this one?
那个|nàge|that one|1|我要那个。|I want that one.
这些|zhèxiē|these|2|这些都是我的。|These are all mine.
那些|nàxiē|those|2|那些书很贵。|Those books are expensive.
这里|zhèlǐ|here|1|这里很安静。|It is quiet here.
那里|nàlǐ|there|1|那里有一家商店。|There is a store over there.
这儿|zhèr|here (colloquial)|1|你过来这儿。|Come over here.
那儿|nàr|there (colloquial)|1|他在那儿。|He is over there.
这样|zhèyàng|like this; so|2|不要这样说。|Don't say it like that.
那样|nàyàng|like that|3|他不是那样的人。|He is not that kind of person.
这么|zhème|so; this way|2|今天这么冷！|It's so cold today!
那么|nàme|so; that way|2|他那么高！|He is so tall!
#Indefinite and universal
每|měi|every; each|2|每天我都学习。|I study every day.
各|gè|each; various|4|各位同学好。|Hello, classmates.
某|mǒu|a certain|5|某人给你打电话了。|Someone called you.
所有|suǒyǒu|all|4|所有人都来了。|Everyone came.
一切|yīqiè|everything|4|一切都会好的。|Everything will be fine.
任何|rènhé|any|5|任何人都可以参加。|Anyone can take part.
其他|qítā|other; else|3|其他人呢？|Where are the others?
别的|biéde|other; else|3|你还要别的吗？|Do you want anything else?
有的|yǒude|some|3|有的人喜欢茶。|Some people like tea.
另外|lìngwài|another; in addition|4|另外一个人是谁？|Who is the other person?
`},
{ id: "prepositions", short: "Prepositions", zh: "介词", title: "Prepositions", icon: "link", desc: "Chinese prepositions (coverbs) come before the verb and introduce location, direction, target, means, cause or comparison.", tips: ["Place the prepositional phrase before the verb: 我在家学习 (I study at home).", "把 moves the object before the verb: 请把门关上。", "被/让/叫 mark the agent in a passive sentence: 杯子被他打破了。", "比 is for comparing: A 比 B + adjective: 我比他高。"], raw: `
#Place and direction
在|zài|at; in; on|1|我在学校学习。|I study at school.
从|cóng|from|2|我从北京来。|I come from Beijing.
到|dào|to; until|2|我们走到公园。|We walk to the park.
往|wǎng|toward|3|往前走。|Go straight ahead.
向|xiàng|toward; to|3|他向我走来。|He walks toward me.
朝|cháo|facing; toward|5|窗户朝南。|The window faces south.
离|lí|away from|2|学校离我家很近。|The school is close to my home.
沿着|yánzhe|along|5|沿着这条路走。|Walk along this road.
经过|jīngguò|pass through; via|4|我们经过一座桥。|We pass over a bridge.
#Target and companion
对|duì|to; toward; regarding|2|他对我很好。|He is very good to me.
给|gěi|to; for|2|我给妈妈打电话。|I call my mom.
跟|gēn|with; from|2|我跟朋友一起去。|I go with a friend.
和|hé|with; and|1|我和他说话。|I talk with him.
同|tóng|with (formal)|6|他同我商量过。|He discussed it with me.
替|tì|on behalf of|5|我替你拿。|I'll carry it for you.
为|wèi|for; on behalf of|3|为你高兴。|I'm happy for you.
向|xiàng|to (someone)|3|我向老师请教。|I ask the teacher for advice.
#Purpose, topic and basis
为了|wèile|in order to|3|为了健康，他每天跑步。|He runs daily for his health.
关于|guānyú|about; concerning|3|关于这件事，我不知道。|I know nothing about this matter.
对于|duìyú|regarding|4|对于这个问题，大家有不同意见。|People differ on this question.
至于|zhìyú|as for|5|至于价格，我们再谈。|As for the price, we'll talk later.
按|àn|according to|4|请按顺序排队。|Please line up in order.
按照|ànzhào|in accordance with|4|按照规定办理。|Handle it according to the rules.
根据|gēnjù|based on|4|根据天气决定。|Decide based on the weather.
通过|tōngguò|through; by means of|4|我通过朋友认识他。|I met him through a friend.
用|yòng|with; using|1|我用筷子吃饭。|I eat with chopsticks.
由|yóu|by; from|4|这件事由他负责。|He is responsible for this.
随着|suízhe|along with|5|随着时间过去，一切都变了。|As time passes, everything changes.
#Time
当|dāng|when; at the time of|4|当我到家时，天已经黑了。|When I got home it was already dark.
自从|zìcóng|since|5|自从毕业，我们没见过。|We haven't met since graduation.
趁|chèn|take advantage of|5|趁热吃吧。|Eat it while it's hot.
除了|chúle|except; besides|3|除了他，大家都来了。|Everyone came except him.
#Comparison, passive and disposal
比|bǐ|than; compared with|2|我比他高。|I am taller than him.
像|xiàng|like; as|3|她像她妈妈。|She looks like her mom.
把|bǎ|(object marker)|3|请把门关上。|Please close the door.
被|bèi|by (passive)|3|杯子被他打破了。|The cup was broken by him.
让|ràng|by; let|2|我的钱包让人偷了。|My wallet was stolen.
叫|jiào|by; call|2|书叫他拿走了。|The book was taken by him.
`},
{ id: "modals", short: "Modal verbs", zh: "能愿动词", title: "Modal & auxiliary verbs", icon: "target", desc: "Modal verbs express ability, permission, possibility, desire, obligation and willingness. They sit directly before the main verb.", tips: ["Negate the modal, not the verb: 我不能去, 他不想吃.", "Ask with A-not-A on the modal: 你会不会游泳？", "能 = physical ability or permission, 会 = learned skill or prediction, 可以 = permission.", "得 (děi) means must only before a verb; it never appears in negatives (use 不用/不必)."], raw: `
#Ability and permission
能|néng|can; be able to|1|我能说一点儿中文。|I can speak a little Chinese.
会|huì|can (learned); will|1|她会开车。|She can drive.
可以|kěyǐ|may; can|2|这里可以坐吗？|May I sit here?
能够|nénggòu|be able to|4|他能够完成任务。|He is able to complete the task.
得以|déyǐ|be able to (formal)|6|他们得以平安回家。|They were able to get home safely.
#Possibility
可能|kěnéng|may; possibly|3|明天可能下雨。|It might rain tomorrow.
应该|yīnggāi|should; ought to|2|你应该多休息。|You should rest more.
该|gāi|ought to|4|该走了。|It's time to go.
应当|yīngdāng|should (formal)|5|我们应当尊重别人。|We should respect others.
会|huì|will (prediction)|2|明天会下雨。|It will rain tomorrow.
#Desire and plan
想|xiǎng|want to; would like|1|我想喝水。|I want to drink water.
要|yào|want; need; will|1|我要一杯咖啡。|I'd like a coffee.
愿意|yuànyì|be willing|3|我愿意帮你。|I'm willing to help you.
肯|kěn|be willing to|5|他不肯说。|He refuses to say.
打算|dǎsuan|plan to|3|我打算明年去中国。|I plan to go to China next year.
希望|xīwàng|hope to|3|我希望你成功。|I hope you succeed.
敢|gǎn|dare|4|你敢一个人去吗？|Do you dare go alone?
#Necessity and obligation
得|děi|must; have to|3|我得走了。|I have to go.
必须|bìxū|must|3|你必须按时到。|You must arrive on time.
需要|xūyào|need|3|我需要你的帮助。|I need your help.
不得不|bùdébù|have no choice but to|5|我不得不加班。|I have to work overtime.
不用|búyòng|no need|3|你不用来。|You don't need to come.
不必|búbì|needn't|5|你不必担心。|You needn't worry.
值得|zhídé|be worth|4|这本书值得读。|This book is worth reading.
#Pairing with negatives
不能|bùnéng|cannot; must not|2|这里不能抽烟。|You cannot smoke here.
不会|búhuì|cannot; won't|2|我不会游泳。|I can't swim.
不可以|bù kěyǐ|may not|2|你不可以迟到。|You may not be late.
不想|bù xiǎng|don't want to|2|我不想去。|I don't want to go.
`},
{ id: "conjunctions", short: "Conjunctions", zh: "连词", title: "Conjunctions & connectors", icon: "shuffle", desc: "Connect words, clauses and ideas: addition, contrast, cause, condition, concession and sequence. Many work in pairs.", tips: ["Paired connectors often split across the clauses: 因为…所以…, 虽然…但是….", "Chinese rarely drops the second connector: 虽然…但是… is normal and natural.", "和 joins nouns only; join verbs or clauses with 而且, 并且 or 又.", "或者 is for statements, 还是 for questions."], raw: `
#Addition and choice
和|hé|and|1|我和你|you and me
跟|gēn|and (colloquial)|2|我跟他都喜欢茶。|He and I both like tea.
与|yǔ|and; with (formal)|5|健康与幸福|health and happiness
及|jí|and; as well as|6|老师及学生|teachers and students
而且|érqiě|moreover|3|他很聪明，而且很努力。|He is smart and also hard-working.
并且|bìngqiě|and also|4|他会说中文，并且说得很好。|He speaks Chinese, and speaks it well.
另外|lìngwài|in addition|4|另外，我还想说一件事。|In addition, I want to say one more thing.
或者|huòzhě|or (statements)|3|你可以喝茶或者咖啡。|You can drink tea or coffee.
还是|háishi|or (questions)|2|你喝茶还是咖啡？|Do you drink tea or coffee?
#Contrast
但是|dànshì|but|2|我想去，但是没有时间。|I want to go, but I have no time.
可是|kěshì|but|2|天气很冷，可是他穿得很少。|It's cold, but he wears little.
不过|búguò|however|3|我喜欢它，不过太贵了。|I like it, but it's too expensive.
然而|rán'ér|however|5|他很努力，然而没有成功。|He worked hard, yet did not succeed.
而|ér|yet; and (formal)|5|他高而瘦。|He is tall and thin.
却|què|but; yet|4|他很累，却睡不着。|He is tired but can't sleep.
#Cause and result
因为|yīnwèi|because|2|因为下雨，所以我没去。|I didn't go because it rained.
所以|suǒyǐ|so; therefore|2|他病了，所以没来。|He was sick, so he didn't come.
由于|yóuyú|due to|4|由于堵车，我迟到了。|Because of traffic, I was late.
因此|yīncǐ|therefore|4|他很努力，因此成绩很好。|He works hard, hence good grades.
于是|yúshì|so; then|5|他饿了，于是去吃饭。|He got hungry, so he went to eat.
既然|jìrán|since; now that|5|既然你来了，就坐吧。|Since you're here, have a seat.
#Condition and supposition
如果|rúguǒ|if|3|如果下雨，我就不去。|If it rains, I won't go.
要是|yàoshi|if (colloquial)|3|要是我有钱就好了。|If only I had money.
假如|jiǎrú|supposing|5|假如我是你，我会去。|If I were you, I would go.
只要|zhǐyào|as long as|4|只要努力，就能成功。|As long as you work hard, you'll succeed.
只有|zhǐyǒu|only if|4|只有坚持，才能成功。|Only by persevering can you succeed.
除非|chúfēi|unless|5|除非你来，否则我不去。|Unless you come, I won't go.
否则|fǒuzé|otherwise|4|快点儿，否则会迟到。|Hurry up, otherwise we'll be late.
不然|bùrán|otherwise|4|快走吧，不然来不及了。|Go quickly, or it'll be too late.
要不|yàobù|otherwise; or how about|5|要不我们坐地铁吧。|Or how about we take the subway?
#Concession
虽然|suīrán|although|3|虽然很累，但是很开心。|Although tired, I'm very happy.
尽管|jǐnguǎn|even though|4|尽管下雨，他还是来了。|He came despite the rain.
即使|jíshǐ|even if|4|即使失败，也不要放弃。|Even if you fail, don't give up.
哪怕|nǎpà|even if|5|哪怕很难，我也要试。|Even if it's hard, I'll try.
无论|wúlùn|no matter|4|无论多忙，他都来。|No matter how busy, he comes.
不管|bùguǎn|regardless of|4|不管天气怎么样，我们都去。|We go regardless of the weather.
#Sequence
首先|shǒuxiān|first of all|3|首先，请坐下。|First of all, please sit down.
然后|ránhòu|then; afterwards|2|先吃饭，然后看电影。|Eat first, then watch a movie.
接着|jiēzhe|next; then|4|他说完，接着我说。|After he finished, I spoke.
最后|zuìhòu|finally; last|2|最后，我们回家了。|Finally, we went home.
以便|yǐbiàn|so that|6|早点儿睡，以便明天早起。|Sleep early so you can wake early.
以免|yǐmiǎn|lest; so as not to|6|多穿点儿，以免感冒。|Wear more so as not to catch a cold.
#Paired patterns
因为…所以…|yīnwèi… suǒyǐ…|because… therefore…|2|因为很忙，所以没来。|Because I was busy, I didn't come.
虽然…但是…|suīrán… dànshì…|although… but…|3|虽然贵，但是很好。|Although expensive, it's good.
如果…就…|rúguǒ… jiù…|if… then…|3|如果你去，我就去。|If you go, I'll go.
不但…而且…|búdàn… érqiě…|not only… but also…|3|他不但聪明，而且努力。|He is not only smart but also diligent.
只要…就…|zhǐyào… jiù…|as long as… then…|4|只要练习，就会进步。|As long as you practice, you'll improve.
只有…才…|zhǐyǒu… cái…|only if… then…|4|只有学习，才能进步。|Only by studying can you improve.
无论…都…|wúlùn… dōu…|no matter… still…|4|无论谁来，都欢迎。|Whoever comes is welcome.
即使…也…|jíshǐ… yě…|even if… still…|4|即使下雨，也要去。|Even if it rains, we'll go.
一边…一边…|yìbiān… yìbiān…|while… while…|3|他一边走，一边听音乐。|He listens to music while walking.
越…越…|yuè… yuè…|the more… the more…|3|雨越下越大。|The rain falls harder and harder.
既…又…|jì… yòu…|both… and…|4|她既聪明又漂亮。|She is both smart and pretty.
先…再…|xiān… zài…|first… then…|2|先做作业，再玩儿。|Do homework first, then play.
一…就…|yī… jiù…|as soon as…|3|他一到家就睡觉。|He sleeps as soon as he gets home.
不是…而是…|búshì… érshì…|not… but rather…|4|不是他不想，而是他不能。|It's not that he doesn't want to, but that he can't.
与其…不如…|yǔqí… bùrú…|rather than… better…|6|与其等，不如去找他。|Rather than wait, better go find him.
宁可…也不…|nìngkě… yě bù…|would rather… than…|6|我宁可走路，也不坐车。|I'd rather walk than ride.
`},
{ id: "adverbs", short: "Adverbs", zh: "副词", title: "Adverbs", icon: "sparkle", desc: "Adverbs modify verbs and adjectives and always stand before them (and after the subject). They express degree, range, time, frequency, attitude and manner.", tips: ["Adverbs come after the subject and before the verb: 我也去, 他已经来了.", "很 is often just a linking word before adjectives: 她很高.", "都 refers to things mentioned before it: 我们都是学生.", "就 and 才 both relate to time or quantity: 他八点就到了 (early) vs 他八点才到 (late)."], raw: `
#Degree
很|hěn|very|1|今天很热。|It's very hot today.
非常|fēicháng|extremely|2|我非常高兴。|I'm extremely happy.
太|tài|too; so|1|太贵了！|Too expensive!
真|zhēn|really|2|你真聪明！|You're really smart!
特别|tèbié|especially|3|这个特别好吃。|This is especially tasty.
最|zuì|most|2|我最喜欢春天。|I like spring most.
更|gèng|even more|3|今天更冷。|It's even colder today.
比较|bǐjiào|fairly; relatively|3|这个比较便宜。|This is relatively cheap.
有点儿|yǒudiǎnr|a bit (negative)|2|我有点儿累。|I'm a little tired.
挺|tǐng|quite|4|这家店挺不错。|This shop is quite good.
十分|shífēn|very|4|他十分努力。|He works very hard.
相当|xiāngdāng|quite; fairly|5|这道题相当难。|This question is quite hard.
极|jí|extremely|4|这里美极了。|It's extremely beautiful here.
稍微|shāowēi|slightly|5|请稍微等一下。|Please wait a moment.
越来越|yuèláiyuè|more and more|3|天气越来越冷。|It's getting colder and colder.
几乎|jīhū|almost|4|我几乎忘了。|I almost forgot.
#Scope and quantity
都|dōu|all; both|1|我们都是学生。|We are all students.
也|yě|also; too|1|我也想去。|I want to go too.
还|hái|still; also|2|你还要什么？|What else do you want?
只|zhǐ|only|2|我只有一本书。|I only have one book.
就|jiù|just; right away|2|他八点就到了。|He arrived already at eight.
才|cái|only then; just|3|他十点才起床。|He didn't get up until ten.
一共|yígòng|altogether|2|一共多少钱？|How much altogether?
一起|yìqǐ|together|2|我们一起走吧。|Let's walk together.
全|quán|entirely|3|全家都来了。|The whole family came.
又|yòu|again (past)|3|他又迟到了。|He was late again.
再|zài|again (future)|2|请再说一遍。|Please say it once more.
仅仅|jǐnjǐn|merely|6|仅仅一天就完成了。|It was finished in just one day.
#Time and frequency
已经|yǐjīng|already|2|他已经走了。|He has already left.
正在|zhèngzài|in the process of|3|我正在吃饭。|I'm eating right now.
刚|gāng|just now|3|我刚到家。|I just got home.
刚刚|gānggāng|just now|4|他刚刚离开。|He just left.
马上|mǎshàng|at once|3|我马上来。|I'll be right there.
立刻|lìkè|immediately|4|请立刻出发。|Set off immediately.
常常|chángcháng|often|3|我常常去图书馆。|I often go to the library.
经常|jīngcháng|frequently|3|他经常迟到。|He is often late.
总是|zǒngshì|always|4|她总是很忙。|She is always busy.
往往|wǎngwǎng|often (tends to)|5|周末他往往在家。|He tends to stay home on weekends.
有时候|yǒushíhou|sometimes|3|我有时候走路上班。|Sometimes I walk to work.
从来|cónglái|ever; never (with 不/没)|4|我从来没去过。|I've never been there.
曾经|céngjīng|once; formerly|4|我曾经住在上海。|I once lived in Shanghai.
终于|zhōngyú|finally|4|我终于到了。|I finally arrived.
一直|yìzhí|all along|3|他一直在等你。|He has been waiting for you all along.
永远|yǒngyuǎn|forever|4|我永远爱你。|I'll love you forever.
突然|tūrán|suddenly|3|他突然笑了。|He suddenly laughed.
渐渐|jiànjiàn|gradually|5|天渐渐黑了。|It gradually got dark.
先|xiān|first|2|你先走吧。|You go first.
本来|běnlái|originally|4|我本来想去。|I originally wanted to go.
仍然|réngrán|still|5|他仍然在等。|He is still waiting.
将|jiāng|will (formal)|5|会议将于明天举行。|The meeting will be held tomorrow.
#Attitude and manner
一定|yídìng|certainly|3|我一定来。|I will definitely come.
当然|dāngrán|of course|3|当然可以！|Of course!
其实|qíshí|actually|3|其实我不累。|Actually I'm not tired.
确实|quèshí|indeed|4|这确实很好。|This is indeed good.
也许|yěxǔ|perhaps|3|也许他不知道。|Perhaps he doesn't know.
大概|dàgài|probably; roughly|4|他大概六十岁。|He's about sixty.
恐怕|kǒngpà|I'm afraid|5|恐怕来不及了。|I'm afraid it's too late.
居然|jūrán|unexpectedly|5|他居然没来。|Unexpectedly, he didn't come.
竟然|jìngrán|to one's surprise|5|她竟然哭了。|To my surprise, she cried.
果然|guǒrán|as expected|5|果然下雨了。|Sure enough, it rained.
反而|fǎn'ér|instead; on the contrary|5|药吃了，他反而更难受。|He took medicine, but felt worse.
到底|dàodǐ|after all; on earth|4|你到底想怎么样？|What on earth do you want?
究竟|jiūjìng|exactly; after all|5|你究竟去不去？|Are you going or not?
千万|qiānwàn|by all means|5|千万别忘了。|Don't forget, whatever you do.
互相|hùxiāng|mutually|4|我们互相帮助。|We help each other.
亲自|qīnzì|personally|5|他亲自送来。|He delivered it in person.
故意|gùyì|deliberately|5|他故意不说。|He deliberately didn't say.
顺便|shùnbiàn|conveniently|5|顺便买点儿水果。|Buy some fruit while you're at it.
尤其|yóuqí|especially|5|我喜欢水果，尤其是苹果。|I like fruit, especially apples.
简直|jiǎnzhí|simply; virtually|6|这简直不可能。|This is simply impossible.
根本|gēnběn|at all; simply|5|我根本不知道。|I don't know at all.
完全|wánquán|completely|4|我完全同意。|I completely agree.
差点儿|chàdiǎnr|almost|5|我差点儿摔倒。|I almost fell.
好像|hǎoxiàng|seem; as if|4|他好像生病了。|He seems to be ill.
幸亏|xìngkuī|fortunately|6|幸亏你来了。|Luckily you came.
难怪|nánguài|no wonder|6|难怪他不高兴。|No wonder he's unhappy.
随便|suíbiàn|casual; as you like|4|你随便坐。|Sit anywhere you like.
`},
{ id: "particles", short: "Particles", zh: "助词", title: "Particles", icon: "pen", desc: "Small function words that carry grammar rather than meaning: structure, aspect, mood and tone. They are almost always unstressed (neutral tone).", tips: ["的 links a modifier with a noun, 地 links an adverbial with a verb, 得 links a verb with its complement.", "了 marks a completed action or a change of state; 过 marks past experience; 着 marks a continuing state.", "Sentence-final particles (吗, 呢, 吧, 啊, 嘛, 啦) color the speaker's tone.", "All of these take the neutral tone, so they are never written with a tone mark."], raw: `
#Structural particles
的|de|(possessive / modifier)|1|这是我的书。|This is my book.
地|de|(adverbial marker)|3|他慢慢地走。|He walks slowly.
得|de|(complement marker)|2|她说得很好。|She speaks very well.
所|suǒ|(relative marker)|5|这是我所知道的。|This is what I know.
的|de|(shì … de emphasis)|2|我是昨天来的。|It was yesterday that I came.
#Aspect particles
了|le|(completed / change)|1|我吃了饭。|I have eaten.
着|zhe|(continuing state)|3|门开着。|The door is open.
过|guo|(past experience)|2|我去过中国。|I have been to China.
#Sentence-final particles
吗|ma|(yes/no question)|1|你好吗？|How are you?
呢|ne|(and you / ongoing)|1|他在看书呢。|He is reading.
吧|ba|(suggestion / assumption)|2|我们走吧。|Let's go.
啊|a|(softener; exclamation)|3|你真好啊！|You're so nice!
嘛|ma|(obviousness)|5|这很简单嘛。|It's simple, you know.
呀|ya|(softener after a vowel)|3|你来呀！|Come on over!
啦|la|(了 + 啊)|3|他来啦！|He's here!
哦|ó|(realization)|4|哦，我明白了。|Oh, I see.
罢了|bàle|that's all|6|我只是开玩笑罢了。|I'm just joking, that's all.
而已|éryǐ|merely|6|这只是个小问题而已。|It's merely a small problem.
似的|shìde|as if; like|5|他高兴得像孩子似的。|He is happy like a child.
来着|láizhe|(was doing)|6|你刚才说什么来着？|What were you saying just now?
#Other function morphemes
们|men|(plural marker)|1|孩子们在玩儿。|The children are playing.
等|děng|etc.; and so on|4|苹果、香蕉等水果|apples, bananas and other fruit
等等|děngděng|and so on|5|买了书、笔等等。|Bought books, pens and so on.
之|zhī|(literary 的)|5|百分之五十|fifty percent
`},
{ id: "negation", short: "Negation", zh: "否定词", title: "Negation words", icon: "x", desc: "Say no, deny, forbid or say something has not happened. The choice among 不, 没 and 别 depends on time and mood.", tips: ["不 negates habits, facts, wishes and the future: 我不吃肉.", "没(有) negates the past and possession: 我没去, 我没有钱.", "别 / 不要 forbids: 别说话！", "不 becomes bú before a fourth tone: 不是, 不要, 不对."], raw: `
#The core three
不|bù|not|1|我不喝咖啡。|I don't drink coffee.
没|méi|not (past); lack|1|我没去过。|I haven't been there.
没有|méiyǒu|do not have; haven't|1|我没有钱。|I have no money.
别|bié|don't|2|别说话！|Don't talk!
不要|búyào|don't; don't want|2|不要担心。|Don't worry.
#Not necessary, not allowed
不用|búyòng|no need|3|不用谢。|No need to thank me.
不必|búbì|needn't|5|你不必来。|You needn't come.
不能|bùnéng|cannot|2|你不能去。|You can't go.
不会|búhuì|can't; won't|2|他不会来。|He won't come.
不可以|bù kěyǐ|not allowed|2|这里不可以拍照。|No photos here.
禁止|jìnzhǐ|prohibit|5|禁止吸烟。|Smoking is prohibited.
#Never, no longer, not yet
从不|cóngbù|never (habit)|4|他从不迟到。|He is never late.
从来没|cónglái méi|have never|4|我从来没吃过。|I've never eaten it.
不再|búzài|no longer|4|他不再抽烟了。|He no longer smokes.
还没|hái méi|not yet|2|我还没吃饭。|I haven't eaten yet.
未|wèi|not yet (formal)|6|未成年人|minors
无|wú|without; none|5|无人知道。|Nobody knows.
非|fēi|non-; not|6|非常|extremely
毫不|háobù|not in the least|6|他毫不在意。|He doesn't care at all.
#Emphatic denial
并|bìng|actually not|4|我并不累。|I'm actually not tired.
并不|bìng bù|not at all|4|这并不难。|This isn't hard at all.
根本不|gēnběn bù|simply not|5|他根本不知道。|He doesn't know at all.
没什么|méi shénme|it's nothing|2|没什么，别担心。|It's nothing, don't worry.
没关系|méi guānxi|never mind|1|没关系，没问题。|It's okay, no problem.
无法|wúfǎ|unable|6|我无法同意。|I cannot agree.
未必|wèibì|not necessarily|6|贵的未必好。|Expensive isn't necessarily good.
`},
{ id: "time", short: "Time words", zh: "时间词", title: "Time words", icon: "repeat", desc: "Days, months, parts of the day and relative times. Time words stand before the verb (after the subject) or at the very start of the sentence.", tips: ["Order is big-to-small: 2026年11月20日星期五下午三点.", "Time when comes before the verb; duration comes after: 我昨天学了两个小时.", "Use 号 in speech and 日 in writing for the day of the month.", "Months are number + 月: 一月, 十二月 (no word for each name)."], raw: `
#Days
今天|jīntiān|today|1|今天是星期五。|Today is Friday.
明天|míngtiān|tomorrow|1|明天见！|See you tomorrow!
昨天|zuótiān|yesterday|1|昨天我很忙。|I was busy yesterday.
前天|qiántiān|the day before yesterday|3|前天下雨了。|It rained the day before yesterday.
后天|hòutiān|the day after tomorrow|3|后天是周末。|The day after tomorrow is the weekend.
每天|měitiān|every day|2|我每天学习中文。|I study Chinese every day.
天|tiān|day|1|三天|three days
#Parts of the day
早上|zǎoshang|morning|1|我早上七点起床。|I get up at seven in the morning.
上午|shàngwǔ|before noon|1|上午有课。|There are classes in the morning.
中午|zhōngwǔ|noon|1|中午我吃面条。|I eat noodles at noon.
下午|xiàwǔ|afternoon|1|下午三点开会。|The meeting is at three p.m.
晚上|wǎnshang|evening; night|1|晚上我看电视。|I watch TV in the evening.
半夜|bànyè|midnight|4|半夜下雨了。|It rained at midnight.
#Weeks and weekdays
星期|xīngqī|week|1|一个星期有七天。|A week has seven days.
星期一|xīngqīyī|Monday|1|星期一有考试。|There is an exam on Monday.
星期二|xīngqīèr|Tuesday|1|星期二我去游泳。|I swim on Tuesday.
星期三|xīngqīsān|Wednesday|1|星期三很忙。|Wednesday is busy.
星期四|xīngqīsì|Thursday|1|星期四放假。|There's a holiday on Thursday.
星期五|xīngqīwǔ|Friday|1|星期五见！|See you Friday!
星期六|xīngqīliù|Saturday|1|星期六我休息。|I rest on Saturday.
星期天|xīngqītiān|Sunday|1|星期天我在家。|I'm home on Sunday.
周末|zhōumò|weekend|2|周末你做什么？|What do you do at the weekend?
上周|shàngzhōu|last week|3|上周我去北京了。|I went to Beijing last week.
下周|xiàzhōu|next week|3|下周有考试。|There is an exam next week.
#Months and years
年|nián|year|1|一年有十二个月。|A year has twelve months.
月|yuè|month|1|三月|March
号|hào|date (spoken)|1|今天几号？|What's the date today?
日|rì|date (written); sun|2|十月一日|October 1st
今年|jīnnián|this year|2|今年我二十岁。|I'm twenty this year.
去年|qùnián|last year|2|去年我在上海。|I was in Shanghai last year.
明年|míngnián|next year|2|明年我去中国。|I'll go to China next year.
前年|qiánnián|year before last|4|前年我毕业了。|I graduated two years ago.
后年|hòunián|year after next|4|后年他回国。|He returns home in two years.
这个月|zhège yuè|this month|2|这个月很忙。|This month is busy.
上个月|shàng ge yuè|last month|2|上个月我搬家了。|I moved last month.
下个月|xià ge yuè|next month|2|下个月是我生日。|Next month is my birthday.
#Seasons
春天|chūntiān|spring|2|春天很漂亮。|Spring is beautiful.
夏天|xiàtiān|summer|2|夏天很热。|Summer is hot.
秋天|qiūtiān|autumn|2|秋天很凉快。|Autumn is cool.
冬天|dōngtiān|winter|2|冬天很冷。|Winter is cold.
#Clock time
点|diǎn|o'clock|1|现在三点。|It's three o'clock.
分钟|fēnzhōng|minute|1|等五分钟。|Wait five minutes.
刻|kè|quarter hour|3|三点一刻|a quarter past three
半|bàn|half|1|五点半|half past five
秒|miǎo|second|4|等十秒。|Wait ten seconds.
小时|xiǎoshí|hour|2|我学了两个小时。|I studied for two hours.
差|chà|to; short of|3|差五分三点|five to three
#Relative time
现在|xiànzài|now|1|现在几点？|What time is it now?
以前|yǐqián|before; formerly|2|以前我住在这儿。|I used to live here.
以后|yǐhòu|after; later|2|以后见！|See you later!
刚才|gāngcái|just now|3|刚才谁来了？|Who came just now?
最近|zuìjìn|recently|3|最近你忙吗？|Are you busy recently?
目前|mùqián|at present|4|目前没有问题。|There are no problems at present.
过去|guòqù|the past|4|过去的事别提了。|Don't bring up the past.
将来|jiānglái|the future|4|将来我想当老师。|In the future I want to be a teacher.
当时|dāngshí|at that time|4|当时我不在。|I wasn't there at that time.
同时|tóngshí|at the same time|4|我们同时到了。|We arrived at the same time.
平时|píngshí|usually; normally|4|我平时不喝酒。|I normally don't drink.
待会儿|dāihuìr|in a moment|5|待会儿见。|See you in a bit.
从前|cóngqián|in the past|5|从前有座山。|Once upon a time there was a mountain.
早|zǎo|early|1|你起得真早！|You get up so early!
晚|wǎn|late|2|今天回来得晚。|I came back late today.
`},
{ id: "location", short: "Location", zh: "方位词", title: "Location & direction words", icon: "grid", desc: "Positions, directions and the verbs of movement that combine with them. Place words follow the thing they locate: 桌子上, 学校里.", tips: ["Add 面/边 to make a standalone place word: 上面, 里边.", "Location pattern: place + 有 + thing (房间里有一张床) or thing + 在 + place (床在房间里).", "Short forms (上, 里, 下) attach to nouns: 桌上, 手里, 地下.", "Directional complements (来, 去, 上, 下, 进, 出, 回, 过, 起) follow verbs: 走进来, 拿出去."], raw: `
#Basic positions
上|shàng|above; on|1|书在桌子上。|The book is on the table.
下|xià|below; under|1|猫在椅子下。|The cat is under the chair.
前|qián|front; before|2|学校前有一家店。|There's a shop in front of the school.
后|hòu|back; after|2|房子后有一棵树。|There's a tree behind the house.
左|zuǒ|left|1|向左转。|Turn left.
右|yòu|right|1|向右转。|Turn right.
里|lǐ|inside|1|包里有书。|There are books in the bag.
外|wài|outside|2|门外有人。|Someone is outside the door.
中|zhōng|middle; in|2|在中国|in China
中间|zhōngjiān|between; middle|2|他站在中间。|He stands in the middle.
旁边|pángbiān|beside|2|银行在邮局旁边。|The bank is next to the post office.
附近|fùjìn|nearby|2|附近有地铁站吗？|Is there a subway station nearby?
对面|duìmiàn|opposite|2|超市在学校对面。|The supermarket is opposite the school.
之间|zhījiān|between|4|我们之间没有秘密。|There are no secrets between us.
周围|zhōuwéi|surroundings|4|周围很安静。|It's quiet all around.
隔壁|gébì|next door|5|他住在我隔壁。|He lives next door to me.
门口|ménkǒu|doorway|3|我在门口等你。|I'll wait for you at the door.
#Full forms
上面|shàngmiàn|above; on top|2|桌子上面有书。|There are books on the table.
下面|xiàmiàn|below; next|2|下面请听。|Please listen to the next one.
前面|qiánmiàn|in front|2|前面有一家店。|There's a shop ahead.
后面|hòumiàn|behind|2|学校后面有山。|There are mountains behind the school.
里面|lǐmiàn|inside|2|里面很热。|It's hot inside.
外面|wàimiàn|outside|2|外面下雨了。|It's raining outside.
左边|zuǒbian|left side|2|银行在左边。|The bank is on the left.
右边|yòubian|right side|2|我住在右边。|I live on the right.
#Compass directions
东|dōng|east|2|太阳从东边升起。|The sun rises in the east.
南|nán|south|2|他去南方了。|He went to the south.
西|xī|west|2|西边有山。|There are mountains in the west.
北|běi|north|2|北京在北方。|Beijing is in the north.
东边|dōngbian|east side|2|东边有一条河。|There's a river on the east side.
南边|nánbian|south side|2|学校在南边。|The school is on the south side.
西边|xībian|west side|2|太阳在西边落下。|The sun sets in the west.
北边|běibian|north side|2|北边很冷。|It's cold in the north.
#Relative position
之前|zhīqián|before (time/place)|4|三天之前|three days ago
之后|zhīhòu|after|4|吃饭之后|after eating
以内|yǐnèi|within|5|一小时以内|within an hour
以外|yǐwài|beyond; outside|5|除此以外|besides this
到处|dàochù|everywhere|4|到处都是人。|There are people everywhere.
四周|sìzhōu|all around|5|四周都是山。|Mountains all around.
#Directional verbs & complements
来|lái|come; (toward the speaker)|1|他走过来了。|He walked over.
去|qù|go; (away from the speaker)|1|他走过去了。|He walked over there.
进|jìn|enter|2|请进！|Please come in!
出|chū|exit; out|2|他走出房间。|He walked out of the room.
回|huí|return|2|我回家了。|I went home.
过|guò|cross; pass|2|请过来。|Please come over.
起来|qǐlái|up; begin|3|请站起来。|Please stand up.
上来|shànglái|come up|3|你上来吧。|Come on up.
下去|xiàqù|go down|3|他走下去了。|He went down.
开|kāi|open; away|2|请把门打开。|Please open the door.
`},
{ id: "numbers", short: "Numbers", zh: "数词", title: "Numbers & quantity words", icon: "list", desc: "Numerals, ordinals, fractions and approximate quantities. A number needs a measure word before a noun: 三本书, 五个人.", tips: ["二 is used for counting and numbering, 两 for amounts before a measure word: 两个人.", "Numbers up to ten: 一 二 三 四 五 六 七 八 九 十. Tens are number + 十: 二十, 三十五.", "Ordinals: 第 + number: 第一, 第三.", "Approximate numbers: 几, 多, 左右, 来 or two adjacent numbers: 三四个."], raw: `
#Digits
零|líng|zero|1|零点五|zero point five
一|yī|one|1|一个人|one person
二|èr|two|1|二月|February
三|sān|three|1|三点|three o'clock
四|sì|four|1|四个人|four people
五|wǔ|five|1|五块钱|five yuan
六|liù|six|1|六月|June
七|qī|seven|1|七天|seven days
八|bā|eight|1|八点|eight o'clock
九|jiǔ|nine|1|九月|September
十|shí|ten|1|十个|ten pieces
#Larger numbers
百|bǎi|hundred|2|一百块|one hundred yuan
千|qiān|thousand|3|三千人|three thousand people
万|wàn|ten thousand|3|五万块|fifty thousand yuan
亿|yì|hundred million|5|十亿人|a billion people
两|liǎng|two (before measure word)|2|两个人|two people
#Ordinals, fractions, multiples
第|dì|(ordinal prefix)|2|第一课|Lesson One
分之|fēnzhī|fraction|5|三分之一|one third
百分之|bǎifēnzhī|percent|5|百分之五十|fifty percent
倍|bèi|times; fold|4|这是那个的两倍。|This is twice that one.
半|bàn|half|1|半个苹果|half an apple
双|shuāng|pair|3|一双鞋|a pair of shoes
对|duì|pair; couple|3|一对夫妻|a married couple
#Approximate quantity
几|jǐ|a few; several|1|几个人|a few people
多|duō|more than|2|三十多岁|in their thirties
左右|zuǒyòu|about; around|3|三点左右|around three
来|lái|about|5|十来个人|about ten people
差不多|chàbuduō|about the same|3|差不多一样。|About the same.
许多|xǔduō|many|4|许多人都来了。|Many people came.
一些|yìxiē|some|2|我买了一些水果。|I bought some fruit.
一点儿|yìdiǎnr|a little|2|我会说一点儿中文。|I speak a little Chinese.
很多|hěn duō|many; a lot|1|很多人喜欢茶。|Many people like tea.
大约|dàyuē|approximately|4|大约十分钟。|About ten minutes.
#Quantity in sentences
每|měi|each; every|2|每个人|each person
全部|quánbù|all; whole|4|全部完成了。|All finished.
整|zhěng|whole|4|整个下午|the whole afternoon
一半|yíbàn|half|4|我吃了一半。|I ate half of it.
多少|duōshao|how many|1|你有多少书？|How many books do you have?
`},
{ id: "interjections", short: "Interjections", zh: "叹词与口语", title: "Interjections & fillers", icon: "chat", desc: "Exclamations, spoken fillers and sound words that make speech sound natural: surprise, hesitation, agreement, pain and onomatopoeia.", tips: ["Interjections have varying tones depending on emotion; the tones shown are the typical ones.", "嗯 is “mm-hmm”: 嗯 (èn, agree), 嗯？(ńg, what?).", "Fillers such as 那个, 就是 and 然后 give you time to think but overuse sounds hesitant.", "Onomatopoeia are often doubled: 汪汪, 哈哈, 滴答."], raw: `
#Attention and greeting
喂|wéi|hello (on the phone)|2|喂，你好！|Hello, hi there!
嘿|hēi|hey|5|嘿，你在这儿！|Hey, you're here!
哎|āi|hey; oh|5|哎，你等一下！|Hey, wait a moment!
#Surprise, realization, emotion
啊|ā|ah; oh!|3|啊，真的吗？|Ah, really?
哇|wā|wow|5|哇，好漂亮！|Wow, so beautiful!
哎呀|āiyā|oh dear|5|哎呀，我忘了！|Oh dear, I forgot!
哎哟|āiyō|ouch|5|哎哟，疼！|Ouch, it hurts!
哦|ò|oh (I see)|4|哦，原来是这样。|Oh, so that's how it is.
嗯|èn|mm; yes|4|嗯，我知道了。|Mm, I got it.
唉|āi|sigh|6|唉，真没办法。|Sigh, nothing can be done.
咦|yí|huh?|6|咦，这是什么？|Huh, what's this?
哼|hēng|hmph|6|哼，我不信。|Hmph, I don't believe it.
糟糕|zāogāo|oh no; terrible|4|糟糕，我迟到了！|Oh no, I'm late!
天哪|tiān na|oh my god|5|天哪，这么贵！|Oh my god, so expensive!
#Reactions and responses
是吗|shì ma|is that so?|2|是吗？我不知道。|Is that so? I didn't know.
真的吗|zhēn de ma|really?|2|真的吗？太好了！|Really? Great!
对了|duìle|by the way|3|对了，你吃饭了吗？|By the way, have you eaten?
没错|méi cuò|that's right|3|没错，就是他。|That's right, it's him.
太好了|tài hǎo le|great!|2|太好了！我们赢了！|Great! We won!
加油|jiāyóu|come on; good luck|3|加油！你能行！|Come on! You can do it!
不会吧|búhuì ba|no way|4|不会吧？这么快！|No way? So fast!
就是|jiùshì|exactly; that's it|3|就是，他说得对。|Exactly, he's right.
#Fillers
那个|nàge|um…; that…|2|那个……我想问一下。|Um… I wanted to ask something.
这个|zhège|well…; this…|2|这个……让我想想。|Well… let me think.
就是|jiùshì|I mean; like|3|我就是想问一下。|I just wanted to ask.
然后|ránhòu|and then|2|然后，我们去了公园。|And then we went to the park.
反正|fǎnzhèn|anyway|4|反正我不去。|Anyway, I'm not going.
你知道吗|nǐ zhīdào ma|you know?|2|你知道吗？他结婚了。|You know what? He got married.
#Onomatopoeia
哈哈|hāhā|haha|3|大家哈哈大笑。|Everyone laughed heartily.
嘻嘻|xīxī|hee-hee|6|她嘻嘻地笑。|She giggled.
呜呜|wūwū|sobbing|6|她呜呜地哭。|She sobbed.
汪汪|wāngwāng|woof woof|5|小狗汪汪叫。|The puppy barks.
喵|miāo|meow|5|小猫喵喵叫。|The kitten meows.
滴答|dīdā|tick; drip|6|雨滴答滴答地下。|The rain drips.
哗啦|huālā|splash; crash|6|水哗啦哗啦地流。|Water rushes along.
砰|pēng|bang|6|门砰的一声关上了。|The door slammed shut.
嘘|shū|shh|5|嘘，别说话！|Shh, don't talk!
`}
];
