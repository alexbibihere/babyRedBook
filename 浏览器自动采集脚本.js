/**
 * 小红书笔记批量采集脚本 - 浏览器 Console 版本
 *
 * 使用方法:
 * 1. 在已登录的小红书网站打开浏览器 Console (F12)
 * 2. 复制整个脚本内容并粘贴到 Console
 * 3. 按回车执行
 * 4. 等待自动采集完成(大约需要 5-10 分钟)
 * 5. 自动下载 JSON 文件
 *
 * 生成时间: 2026/1/12 11:12:01
 * 笔记数量: 18 篇
 */

(async function() {
    console.log('%c═══════════════════════════════════════', 'color: #ff2442; font-size: 16px; font-weight: bold');
    console.log('%c📝 小红书笔记批量采集工具', 'color: #ff2442; font-size: 16px; font-weight: bold');
    console.log('%c═══════════════════════════════════════', 'color: #ff2442; font-size: 16px; font-weight: bold');
    console.log('');

    // 笔记列表
    const notes = [
  {
    "title": "生产后1—3天，老公如何照顾孕妇",
    "content": "生产后1—3天，老公如何照顾孕妇\n🌟新手妈妈一定要发给宝爸！\n\t\n孕妇生完身体虚弱，宝爸一定要担当起自己的责任，不要埋头打游戏，要给宝妈情绪上的支持，实际的行动，以及温柔的呵护，让宝妈，丈母娘都放心，争取宝妈早日恢复，养好身体。这份详细的生产护理指南，干货满满，希望宝爸尽快熟练，照顾好宝妈和宝宝！\n\t\n#生产日记 #新手爸妈 #育儿干货 #顺产 #坐月子 #宝宝护理 #育儿 #产妇 #宝爸\n2024-09-23",
    "author": "陈如意",
    "likes": "1665",
    "url": "https://www.xiaohongshu.com/explore/66f17ccc000000001b0207d5?xsec_token=ABv3HmDYCka12b4A0QLB-5cKvS_nvcfexLvrmd15tz87w=&xsec_source=pc_collect"
  },
  {
    "title": "耻骨疼到睡不着？这4个按摩动作亲测有效！",
    "content": "卸货前，准爸爸必须得9项技能快转发给队友❗️\n孕妈怀胎十月已经够辛苦了，准爸爸可别当甩手掌柜，这9项技能赶紧码住，准爸爸们记住最好的胎教，就是爸爸爱妈妈❤#孕产经验分享 #新手爸妈 #孕产知识 #准爸爸必修课#待产攻略#孕期知识 #新手爸妈必看#孕期陪伴#准爸爸技能\n编辑于 2025-12-19 湖北",
    "author": "琪妈育儿干货社",
    "likes": "1612",
    "url": "https://www.xiaohongshu.com/explore/69429f92000000001f00968f?xsec_token=ABBN2ALnzuSKeSxqwqu9INuDoFFlT6EHPbpV-Zrz-_rNE=&xsec_source=pc_collect"
  },
  {
    "title": "卸货前，准爸爸必须得9项技能快转发给队友❗️",
    "content": "非深户新生儿出生最快买少儿医保办理社保卡\n非深户新生儿快速办理社保卡和购买医保流程!\n#新生儿证件办理 #新生儿证件办理 #医保卡 #出生证明\n2025-04-01",
    "author": "李李李a小颜宝",
    "likes": "288",
    "url": "https://www.xiaohongshu.com/explore/67ec0acb000000001c01ed59?xsec_token=ABf-xviP3YNVMeE23FUWpw7bqYwtBPCBE9CJgRmXej8J8=&xsec_source=pc_collect"
  },
  {
    "title": "卸货前，准爸爸必须得9项技能快转发给队友❗️",
    "content": "新生儿第一个月有多难照顾？附常见问题处理\n从宝宝一出生，爸爸妈妈们就走上了打怪升级之路，特别是第一个月，所有的问题都是新挑战，特意整理了新生儿第1️⃣个月常见的问题及办法，宝妈宝爸们收藏起来吧\n.\n第一个月，是充满喜悦与挑战，主要就是这三个困难点，大人最头疼：\n🔶睡眠碎片化：宝宝遵循“饿了就醒，吃了就睡”的模式，2-3小时一循环，不分昼夜。父母的睡眠被切割成碎片，睡不好是产后日常\n🔶喂养难题：无论是母乳还是奶粉，都可能遇到吮吸无力、胀气、吐奶等各种状况\n🔶皮肤娇嫩，问题频出：这是最让爸妈心疼的一点。新生儿皮肤屏障仅有成人的1/3薄，极易失水、干燥，出现红点点、干燥等问题。宝宝一痒就会用手抓，一抓就红，甚至破溃，让爸妈心急如焚\n.\n正因如此，为宝宝选择一款能真正解决问题、成分放心的面霜，就成了育儿路上的重要课题。而松达山茶油🍃，正是针对这些新生儿皮肤痛点而设计的。\n👉里面的强舒因山茶油三萜烯醇能舒缓泛红，宝宝一痒一抓就涂它，很快不修护了\n👉山茶油角鲨烯可以修护屏障，像给宝宝皮肤穿上一层“隐形护甲”，皮肤会越来越抗造；\n👉另外还有山茶油油酸超亲肤，能深层保湿，锁住水分一整天都不干\n.\n记住面霜的正确使用方法，就是在洗脸或者洗澡后3分钟⏰内涂抹，效果非常好，事半功倍，真心推荐给各位新手妈妈!\n#新生儿护理 #新手爸妈 #宝宝 #母婴日常 #育儿干货 #母婴知识 #宝宝护理#松达山茶油霜 #松达 #松达婴儿面霜 #松达必买清单 #宝宝面霜#干痒红早知道#宝宝好物推荐#强舒因山茶油三萜烯醇\n编辑于 2025-12-09",
    "author": "芳妈育儿笔记",
    "likes": "288",
    "url": "https://www.xiaohongshu.com/explore/6932a82f000000001e03b8d2?xsec_token=ABl5WgcDTHygacr9mUrbO6Z3_0vahzOUN5U0K7vcWjhgs=&xsec_source=pc_collect"
  },
  {
    "title": "孕期肋骨痛哭的姐妹，缓解办法来了！",
    "content": "李玫瑾教授的经典育儿法值得收藏\n育儿过程就是自己和孩子一起不断成长的过程\n需要不断不断学习\n\t\n#如何正确的教育孩子 #家庭教育 #育儿干货 #父母课堂育儿知识分享 #育儿书单 #教育的真谛 #心理抚养比物质抚养更重要\n2024-12-29",
    "author": "豆妈",
    "likes": "40",
    "url": "https://www.xiaohongshu.com/explore/67716103000000000b00e0f6?xsec_token=AB3JPl_X7l8QtcPjZfGBNRo0ZNPNZiJr49QZoR-90qx8k=&xsec_source=pc_collect"
  },
  {
    "title": "已瘦31斤｜一周低卡减脂三餐合集",
    "content": "👍新手爸爸必学9项技能，快转给老公学习\n宝贝降临倒计时❗️各位准妈妈们，是不是已经开始担心自家那位“大男孩”能不能搞定小祖宗了？\n\t\n别慌，趁宝宝还没出生，赶紧把这篇甩给他！Get这9大必备技能，为迎接小天使做好准备啦❗️提前练手，避免到时候手忙脚乱，全家鸡飞狗跳\n\t\n准爸爸们，赶紧收藏起来，自我检测一番哦！🌟#孕产知识 #新手爸妈 #卸货前准备 #母婴知识 #准爸爸必看 #奶爸育儿经 #新生儿护理 #怀孕那些事 #宝宝护理 #奶爸带娃\n编辑于 2025-06-20",
    "author": "是淇淇呀",
    "likes": "6354",
    "url": "https://www.xiaohongshu.com/explore/68340811000000002301f5a8?xsec_token=ABBj9Z0Z6Qozz91Bj0pnoPJCl-6_lYJ1CjkILGiBld_zg=&xsec_source=pc_collect"
  },
  {
    "title": "耻骨疼到睡不着？这4个按摩动作亲测有效！",
    "content": "出生后30天内办社保卡，报销多！\n天呐！新手爸妈们注意了！给宝宝办社保卡，真的有“黄金30天”！👶\n#社保卡  #深圳少儿医保 #宝爸宝妈  #新生儿 #社保卡办理 #少儿医保卡\n编辑于 2天前 广东",
    "author": "小猫爱吃冻干",
    "likes": "1612",
    "url": "https://www.xiaohongshu.com/explore/6960e0160000000022008645?xsec_token=AB6h9MSxX1H9cJf_wt9vnoyL57caFFOhJyBf7eswF_vlw=&xsec_source=pc_like"
  },
  {
    "title": "耻骨疼到睡不着？这4个按摩动作亲测有效！",
    "content": "准爸爸必备9项带娃技能｜快@老公抄作业！\n孕晚期妈妈请举手！🤰🏻是不是既期待又有点小紧张？别慌，先把这篇给娃他爸看，让他提前进入状态！带娃从来不是妈妈一个人的战斗，尤其是产后妈妈需要好好休息，准爸爸们更要主动扛起大旗！\n我生娃后，到出月子基本都是老公和家人在带，我就负责吃好、睡好、恢复好～真心建议所有准爸爸学会这9项技能：\n✅ 冲奶粉｜水温、水量、手法都有讲究\n✅ 拍嗝｜防止宝宝胀气、吐奶\n✅ 洗屁屁｜细节决定宝宝舒适度\n✅ 换尿不湿｜穿不对容易漏💦\n✅ 洗澡｜手法要稳，速度要快\n✅ 脐带护理｜每天都要认真做\n✅ 正确横抱｜护住头颈是关键\n✅ 吐奶/呛奶处理｜学会应急很重要\n✅ 哄睡+了解疝气｜轻松应对宝宝不适\n说到哄睡和应对宝宝疝气，我一定要强烈安利这个让我们家带娃幸福感直接拉满的带娃神器——佳尔优优安抚奶嘴！\n还记得我刚生完那会儿，随便买了个奶嘴凑合用，结果各种踩雷：挡板太贴嘴，宝宝吸一会儿唇周就红一圈；口水流得到处都是，小脸蛋总是黏糊糊的；头疼的是差点导致R头混淆，宝宝都不爱喝母乳了…老母亲真的欲哭无泪！😭直到这款的小细节设计才解决我们困扰：\n👍 仿拇指设计：完美贴合宝宝吃手习惯，接受度很高，秒变“安静小天使”，再也不用抱着满屋子转悠到手酸！\n👍 科学区分母乳形状：交替使用不怕混淆，亲喂和安抚两不误，将来戒断也更轻松～\n👍 45°反弧+双边透气孔：不贴嘴不闷汗，宝宝唇周保持干爽，告别“红圈圈”！\n👍 吮吸无负担：只有8g的重量，宝宝自己就能含得超稳，出门打疫苗、逛商场，带上它就能轻松搞定哭闹！\n特别要强调的是，如果宝宝有疝气，怕的就是大哭大闹加重腹压。有了这个安抚奶嘴，宝宝情绪很快就能平静下来，真的帮我们度过了很多难熬的时刻。\n其实带娃路上，选对工具真的太重要了！一个好用的安抚奶嘴，加上给力的队友，带娃真的能轻松很多～\n如果你家也有同款“高需求宝宝”，或者准爸爸正在手忙脚乱中，强烈建议试试这个安抚奶嘴，说不定能打开新世界的大门哦！\n#新生儿护理 #准爸爸孕期必学知识 #佳尔优优拇指安抚奶嘴#佳尔优优安抚奶嘴#疝气有什么症状#母婴好物分享#疝气#安抚奶嘴推荐 #爸爸带娃 #待产包准备清单\n2025-12-01",
    "author": "辰宝妈咪",
    "likes": "1612",
    "url": "https://www.xiaohongshu.com/explore/692a4a02000000001f00826f?xsec_token=ABRnTz9dmqfsGNXatxXhKnbgC16tQWgkaT3QQRtdfNHGo=&xsec_source=pc_like"
  },
  {
    "title": "卸货前，准爸爸必须得9项技能快转发给队友❗️",
    "content": "新手奶爸必学新生儿护理技能！准爸爸必看！\n生完娃的宝妈谁懂啊😭 身体像被拆了又重装，浑身酸软无力，还没从生产的剧痛里缓过来，喂奶、换尿布、拍嗝、哄睡…24小时连轴转，没有假期没有加班费，踏实睡一觉，简直是新手宝妈的终极奢望！\n\t\n养娃从来不是妈妈一个人的战斗，新手爸爸从不是“旁观者”，而是宝妈最坚实的战友！今天这份新生儿护理干货，专门给准爸爸和新手奶爸整理，每一步都写得明明白白，照着做就能变身满分奶爸❗️\n\t\n✅ 打襁褓：击退惊跳反射，对角折被→宝宝仰躺→裹紧两侧→固定后背，别裹太紧，留足呼吸空间，纱布浴巾就很合适～\n✅ 分月龄抱娃：托稳头脖是关键！0-1月摇篮抱/面对面抱；1-2月飞机抱，缓解肠胀气+拍嗝双buff；3月+竖抱护腰护颈；4月+哈喽抱，给宝宝开阔视野。\n✅ 空心掌拍嗝：新生儿俯肩拍，2月+搭背拍，3月+趴卧拍，轻拍后背3-5分钟，每秒1-2次，千万别碰腰和脊椎！\n✅ 新生儿洗澡：室温26-28℃、水温35-40℃，从颈到脚清洗褶皱处；脐带未脱落前，碘伏擦残端3-4次，穿拉拉裤时尿布往下折，沐浴露每周1-2次即可。\n✅ 洗屁屁：女宝从前往后擦，男宝从后往前擦，蘸干水分涂护臀膏，屁屁缝和大腿根部重点护理。\n这里必须强调！小月龄宝宝每2-3小时就要换一次拉拉裤，溢奶漏便还要随时换，拉拉裤选对真的太省妈！\n\t\n我家赫赫从新生儿期穿到现在的「十月结晶冒险家拉拉裤」，就是我和老公的带娃神器✨ 它的Air微触蜂窝设计，能提升33%干爽度，软乎乎不摩擦宝宝屁屁，敏感肌也能放心穿。\n\t\n吸水性更是拉满！哪怕是爱漏尿的胖宝宝，穿它也能一觉到天亮，不起坨不反渗，0.2cm薄芯体，闷热天也不闷屁屁。最戳我的是云朵泡泡腰围，弹力超大不勒圆滚滚的小肚肚，宝宝翻身打滚也不会侧漏后漏。\n新手爸妈都懂，宝宝睡整觉，我们才能有喘息的机会。照顾新生儿，是一场充满惊喜的旅程，更是一场需要耐心的挑战。\n希望这篇笔记，能帮各位奶爸快速上手，也能让各位宝妈，多一份轻松，少一份疲惫❤\n图1-9附详细步骤配图，准爸爸们快码住，产前学好，产后不慌！\n#新手爸妈枕边书#奶爸育儿经 #新生儿护理 #准爸爸产前学习带娃 #十月结晶冒险家拉拉裤#十月结晶拉拉裤 #拉拉裤推荐 #坐月子 #新生儿护理小技巧#母婴好物分享#新手爸妈#纸尿裤\n3天前 山东",
    "author": "赫赫妈妈",
    "likes": "288",
    "url": "https://www.xiaohongshu.com/explore/695f035c00000000220320be?xsec_token=ABbVq4p8nWCsdj9x1QYTIzz3F579DEV_XauIdw9EnoZ2M=&xsec_source=pc_like"
  },
  {
    "title": "新生儿第一个月有多难照顾？附常见问题处理",
    "content": "#新手妈妈 #宝宝证件 #出生证明 #宝宝户口 #疫苗 #新生儿保险 #宝宝户口 #生娃 #新生儿证件办理 #孕产知识\n2天前 安徽",
    "author": "好运蜜蜜",
    "likes": "433",
    "url": "https://www.xiaohongshu.com/explore/6960c54f0000000021030af3?xsec_token=AB6h9MSxX1H9cJf_wt9vnoyDz2WlY4iPWtP-avoMCRekw=&xsec_source=pc_like"
  },
  {
    "title": "新生儿第一个月有多难照顾？附常见问题处理",
    "content": "老婆快生了，老公要做什么❓\n准爸爸看过来！老婆从怀孕到生宝宝，这段日子特别需要你的陪伴和帮忙。提前把下面这些小事准备好，到时候就不用手忙脚乱啦～\n\t\n✅ 提前办好住院手续\n✅ 熟悉待产包\n✅ 提前学习护理知识\n✅ 提前熟悉去医院的路线和环境\n✅ 了解临产前的征兆\n✅ 提前把家收拾干净\n✅ 了解顺产的过程\n✅ 了解剖腹产的过程\n✅ 安排好住院期间的饮食\n✅ 生完孩子后，照顾老婆要做这些事\n✅ 照顾新生儿要做这些事\n✅ 出院回家后爸爸要做的\n\t\n准妈妈们，顺手转给自家那位看看吧～\n\t\n准爸爸也别压力太大，不用每一样都做得特别完美，能帮忙、有这份心就已经很棒了。你的每一点付出，老婆都会记得的❤️\n\t\n💐关注我，我会持续分享孕育干货\n一起备孕带娃不迷路\n\t\n#分娩 #临产 #孕晚期倒计时 #预产期 #临产准备 #临产期 #待产 #分享待产准备 #孕晚期 #临产前\n2025-12-30 广东",
    "author": "桃妈的孕期日记",
    "likes": "433",
    "url": "https://www.xiaohongshu.com/explore/6952b82b000000002202ecd7?xsec_token=AB8keEtDxcE6vtmLG0ImZ3U4ZBHdT5bb_3jeQSj0xrFGs=&xsec_source=pc_like"
  },
  {
    "title": "孕晚期凯格尔运动，一定要做这四个动作！",
    "content": "孕晚期准爸爸陪产测试题，快来试试吧！\n#婴儿成长和发展 #孕产经验分享 #新生儿护理 #产检  #孕产知识 #母婴护理 #胎教 #科学坐月子 #新手爸妈  #胎儿成长发育\n4天前 北京",
    "author": "初五麻麻",
    "likes": "7186",
    "url": "https://www.xiaohongshu.com/explore/695dd9eb000000001a02c08f?xsec_token=ABauGAh787-pdL3aVrdGt2b0n5XMS417wI0kZfZzr0QKs=&xsec_source=pc_like"
  },
  {
    "title": "孕期肋骨痛哭的姐妹，缓解办法来了！",
    "content": "陪产攻略｜孕晚期准爸爸能做什么｜转给老公\n新手妈妈一定要发给宝爸！\n终于熬到孕晚期啦，恭喜你们！即将迎来自己的小宝宝～怀孕真的不容易，准爸爸们也同样肩负重任，\n从产妇住院的第一天到第三天，每一个细节都至关重要，你的每个动作都有可能成为顺利分娩的「神助攻」\n\t\n为了让你们轻松应对，我们精心整理了一份“陪产攻略”，请提前学习，做好准备，让一切都有条不紊，展现你们的责任感和担当\n\t\n看到的准爸爸请自觉领取“任务”，准妈妈也可以转给老公学习，提前做好准备，遇事才能不慌张！一起迎接家庭的新成员吧！\n#科学坐月子 #孕产经验分享 #孕产知识 #待产必备 #新手爸妈 #新手爸妈枕边书 #生孩子 #孕产 #新手爸爸 #陪产\n2025-12-24 福建",
    "author": "嘻妈育儿笔记",
    "likes": "40",
    "url": "https://www.xiaohongshu.com/explore/694b9995000000001d03dee6?xsec_token=ABfOFUVJ_SIlM0Wx4YHF1hsrokaf1UrE8-eOhbHNm3er0=&xsec_source=pc_like"
  },
  {
    "title": "孕期肋骨痛哭的姐妹，缓解办法来了！",
    "content": "宝宝出生后这八件事千万别拖延！速存！\n宝宝出生后，这些重要事项可别拖延哦～新手爸妈赶紧码住，一件件搞定才能更安心！\n1️⃣ 出生证明：出院前记得想好名字，一个月内办理好，上户口、办医保都用得到。\n2️⃣ 户/口/本：带齐材料去派出所办理，越早越好，方便后面申请医保和补贴。\n3️⃣ 疫苗本：打疫苗必备，记得保管好，上学也会用到哦。\n4️⃣ 医保卡：尽早办理，可以报销宝宝出生时的医/疗费用。\n5️⃣ 身份证：等宝宝会坐了再去办，出行更方便。\n6️⃣ 生育津贴：一年内记得申请，能领到一笔不小的补贴。\n7️⃣ 育儿补贴：三岁前每年可领一笔，别忘了申请～\n8️⃣ 育儿退税：通过个税APP办理，每月能省下一笔钱。\n#月嫂推荐 #爱月宝 #科学月子餐#大连育儿 #宝妈必备 #家政服务 #月嫂怎么选 #月嫂 #坐月子 #新手妈妈\n01-03 辽宁",
    "author": "大连爱月宝",
    "likes": "40",
    "url": "https://www.xiaohongshu.com/explore/695880bd000000001e036183?xsec_token=ABHKta9oyD97LA8ZKSedIhaY3w29TDtjSNezsxqDqLCu8=&xsec_source=pc_like"
  },
  {
    "title": "交换减脂餐，不要网图",
    "content": "育儿干货｜新手爸爸必备9大技能｜快转给老公\n新手奶爸课堂开课啦📣\n\t\n👩带娃从不是妈妈一个人的事儿，特别是在月子里，妈妈的身体和心理都像被掏空一样虚弱，明明是很需要养身体的时候，却要不停歇的喂养，换尿布，哄睡，新手爸爸因为没有经验在旁边看着干着急却不知道该怎么帮忙分担，所以准爸爸们都赶紧学起来，让刚生完娃的老婆有更多的休息时间，爸爸们多多参与带娃，做个满分爸爸吧！\n\t\n🌟小编今天特意整理了一份新生儿护理指南，以下这9项爸爸必备技能，全是实用干货，快快学起来\n\t\n#新手爸妈枕边书 #奶爸育儿经 #育婴知识 #新生儿护理 #新手爸妈 #新手妈妈 #育儿干货 #宝妈记得收藏 #母婴日常\n编辑于 2025-12-25 福建",
    "author": "嘻妈育儿笔记",
    "likes": "4480",
    "url": "https://www.xiaohongshu.com/explore/69464066000000001e005235?xsec_token=ABmP5kf3jjpV86M3LKoklnkUkaDekBSq1UFMAkcjEHSnY=&xsec_source=pc_like"
  },
  {
    "title": "深圳医保，省外产检+分娩报销攻略",
    "content": "孕晚期准爸爸理论考试，不及格今晚睡沙发❗\n孕可不是妈妈一个人的事，爸爸要积极学习孕产知识，学习去照顾老婆和宝宝。\n看看自己的老公能考多少分❓不及格要罚他睡沙发哦⚠️\n#孕晚期准爸爸理论考试 #新手爸妈枕边书 #新手爸妈 #育儿知识 #产后护理 #怀孕 #准爸爸 #准妈妈 #生娃娃那些事 #准爸妈必看\n2025-12-07",
    "author": "钰钰妈妈",
    "likes": "227",
    "url": "https://www.xiaohongshu.com/explore/69359289000000001e02a5e7?xsec_token=ABGPrCbqjzjktOA-RPf9FZjYo3K7kERpeJOwjkW5F50mo=&xsec_source=pc_like"
  },
  {
    "title": "12孕期款控糖营养汤。简单易上手，附教程",
    "content": "当爸爸也是需要“持证上岗”的！\n当爸爸也是需要“持证上岗”的！📚\n23道产前自测题，你能答对多少？\n宝宝即将到来，准爸爸们是否已经准备好进入新角色？\n这份产前知识清单，帮你系统梳理从孕期到分娩的必备常识，让你在面对各种情况时都能沉着应对，成为宝妈最可靠的后盾。\n✅ 涵盖内容：\n→ 产前检查关键项\n→ 待产包准备清单\n→ 分娩阶段陪护指南\n→ 新生儿护理基础\n→ 产后情绪支持技巧\n提前掌握这些知识，不仅能减少临产时的慌乱，更能让伴侣感受到你的陪伴与用心。不妨发给准爸爸或家人一起学习，共同为迎接新生命做好扎实准备。\n✨ 孕育生命是两个人的事，共同准备才是最好的开始。\n#准爸爸必修课 #新生儿准备 #孕期知识 #产前准备 #爸爸也要学 #科学育儿 #待产指南 #家庭协作\n编辑于 2天前 江苏",
    "author": "苏雪产康",
    "likes": "2554",
    "url": "https://www.xiaohongshu.com/explore/6936e6fb000000001e0389cd?xsec_token=ABIcCMcCSdyWqV6rqm07wVvcrZ8cJAWmVcxwHVgX_VSWc=&xsec_source=pc_like"
  },
  {
    "title": "孕期每个月身体感受+注意事项+营养补充✅",
    "content": "老婆快生了，老公要做什么❓\n准爸爸看过来！媳妇怀孕生娃这段时间，最需要你的陪伴和支持。提前把这些小事准备好，到时候就能从容应对啦！\n\t\n✅ 提前办好住院手续\n✅ 熟悉待产包\n✅ 提前学习护理知识\n✅ 提前熟悉去医院的路线和环境\n✅ 了解临产前的征兆\n✅ 提前把家收拾干净\n✅ 了解顺产的过程\n✅ 了解剖腹产的过程\n✅ 安排好住院期间的饮食\n✅ 生完孩子后，照顾老婆要做这些事\n✅ 照顾新生儿要做这些事\n✅ 出院回家后爸爸要做的\n\t\n准妈妈们，快转给队友看！\n\t\n准爸爸们，不用样样完美，尽力就好。你的每份付出，媳妇都能感受到！一起开心迎接宝宝的到来吧～\n\t\n💐关注我，我会持续分享孕育干货\n新手妈妈备孕带娃不迷路\n\t\n#孕晚期 #孕晚期倒计时 #临产 #临产准备 #临产前 #临产前攻略 #临产的注意事项 #临产前注意事项 #预产期 #临产必学\n2025-11-16",
    "author": "桃妈的孕期日记",
    "likes": "2298",
    "url": "https://www.xiaohongshu.com/explore/6919c64d0000000019024067?xsec_token=ABduwnrIQVYa-v3sfuADcjkJQ2AJ76IlQLIMl0dxbQjCI=&xsec_source=pc_like"
  }
];

    console.log(`%c📚 待采集笔记数: ${notes.length}`, 'color: #00aa00; font-size: 14px');
    console.log('%c⏳ 开始采集... (预计需要 5-10 分钟)\n', 'color: #ff9800; font-size: 14px');

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // 遍历每篇笔记
    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        console.log(`%c[${i + 1}/${notes.length}] 正在采集: ${note.title || '无标题'}`, 'color: #2196f3');

        try {
            // 访问笔记页面
            window.location.href = note.url;

            // 等待页面加载
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 等待内容加载
            const maxWait = 10;
            let waited = 0;
            while (waited < maxWait) {
                const contentEl = document.querySelector('.note-content, .content, .post-content, [class*="desc"]');
                if (contentEl && contentEl.innerText.length > 50) {
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 500));
                waited++;
            }

            // 提取页面数据
            const pageData = await new Promise((resolve) => {
                setTimeout(() => {
                    const titleEl = document.querySelector('.title, .note-title, h1, [class*="title"]');
                    const contentEl = document.querySelector('.note-content, .content, .post-content, .desc, [class*="content"]');
                    const authorEl = document.querySelector('.author-name, .username, .user-name, [class*="author"]');
                    const likesEl = document.querySelector('.like-count, .praise-count, [class*="like"]');
                    const imagesEl = document.querySelectorAll('img[class*="image"], img[class*="photo"]');

                    const content = contentEl ? contentEl.innerText : '';

                    resolve({
                        ...note,
                        extractedTitle: titleEl ? titleEl.innerText.trim() : '',
                        content: content,
                        author: authorEl ? authorEl.innerText.trim() : '',
                        likes: likesEl ? parseInt(likesEl.innerText.replace(/\D/g, '')) || note.likes : note.likes,
                        images: Array.from(imagesEl).map(img => img.src).filter(src => src.includes('xhscdn.com')),
                        contentLength: content.length,
                        hasValidContent: content.length > 50 && !content.includes('用户协议'),
                        extractedAt: new Date().toISOString()
                    });
                }, 100);
            });

            // 检查是否是虚假内容
            const spamKeywords = ['用户协议', '隐私政策', '沪ICP备', '营业执照'];
            const isSpam = spamKeywords.some(kw => pageData.content.includes(kw));

            pageData.isSpam = isSpam;

            if (isSpam) {
                console.log(`%c   ⚠️  虚假内容 (用户协议)`, 'color: #ff9800');
                failCount++;
            } else if (pageData.content.length < 50) {
                console.log(`%c   ⚠️  内容过短 (${pageData.content.length} 字符)`, 'color: #ff9800');
                failCount++;
            } else {
                console.log(`%c   ✅ 成功! (${pageData.content.length} 字符)`, 'color: #00aa00');
                successCount++;
            }

            results.push(pageData);

            // 每 5 篇保存一次进度
            if ((i + 1) % 5 === 0) {
                console.log(`%c   💾 进度已保存 (${i + 1}/${notes.length})`, 'color: #2196f3');
                sessionStorage.setItem('xhs_collect_progress', JSON.stringify(results));
                sessionStorage.setItem('xhs_collect_index', i + 1);
            }

        } catch (error) {
            console.log(`%c   ❌ 失败: ${error.message}`, 'color: #f44336');
            failCount++;
            results.push({
                ...note,
                error: error.message,
                content: '',
                hasValidContent: false
            });
        }

        // 随机延迟,避免请求过快
        const delay = 2000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // 采集完成
    console.log('\n');
    console.log('%c═══════════════════════════════════════', 'color: #ff2442; font-size: 16px; font-weight: bold');
    console.log('%c✅ 采集完成!', 'color: #00aa00; font-size: 16px; font-weight: bold');
    console.log('%c═══════════════════════════════════════', 'color: #ff2442; font-size: 16px; font-weight: bold');
    console.log('');
    console.log(`%c📊 统计:`, 'color: #2196f3; font-size: 14px; font-weight: bold');
    console.log(`   - 总笔记数: ${results.length}`);
    console.log(`   - 成功采集: ${successCount} ✅`);
    console.log(`   - 失败/虚假: ${failCount} ⚠️`);
    console.log('');

    // 生成下载链接
    const jsonStr = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xhs-notes-${new Date().toISOString().slice(0,10)}.json`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`%c📁 文件已开始下载: xhs-notes-${new Date().toISOString().slice(0,10)}.json`, 'color: #00aa00; font-size: 14px');
    console.log('');
    console.log('%c💾 数据已保存到剪贴板,可直接粘贴使用', 'color: #2196f3; font-size: 12px');

    // 复制到剪贴板
    try {
        await navigator.clipboard.writeText(jsonStr);
    } catch (e) {
        console.log('%c⚠️  自动复制失败,请手动下载文件', 'color: #ff9800');
    }

    // 返回结果
    return results;

})();
