const games = [
    {
        image: '4',
        title: '超级魂93 (简)',
        type: 'ACT',
    },
    {
        image: '5',
        title: '赌马1991 (繁)',
        type: 'PUZ',
    },
    {
        image: '6',
        title: '飞人战士 (简)',
        type: 'STG',
    },
    {
        image: '7',
        title: '恶魔城 (简)',
        type: 'ACT',
    },
    {
        image: '8',
        title: '弹射球 (修正版) (简)',
        type: 'PUZ',
    },
    {
        image: '10',
        title: '蝙蝠侠 (简)',
        type: 'ACT',
    },
    {
        image: '13',
        title: '超惑星战记 (修正版) (简)',
        type: 'ACT',
    },
    {
        image: '14',
        title: '楚汉争霸 (简)',
        type: 'SLG',
    },
    {
        image: '16',
        title: '成龙之龙 (简)',
        type: 'ACT',
    },
    {
        image: '19',
        title: '大战略 (简)',
        type: 'SLG',
    },
    {
        image: '21',
        title: '地道战 (繁)',
        type: 'ACT',
    },
    {
        image: '22',
        title: '机器猫小叮当 (简)',
        type: 'ACT',
    },
    {
        image: '23',
        title: '双截龙3 - 神秘魔石之谜 (简)',
        type: 'ACT',
    },
    {
        image: '26',
        title: '勇者斗恶龙6 (简)',
        type: 'RPG',
    },
    {
        image: '28',
        title: '玛莉医生 (简)',
        type: 'PUZ',
    },
    {
        image: '29',
        title: '疯狂鸡蛋仔 (简)',
        type: 'ETC',
    },
    {
        image: '30',
        title: '无尽的任务 (简)',
        type: 'RPG',
    },
    {
        image: '32',
        title: '银河时代 (简)',
        type: 'RPG',
    },
    {
        image: '33',
        title: '宇宙战将 (简)',
        type: 'RPG',
    },
    {
        image: '34',
        title: '空中魂斗罗 (简)',
        type: 'STG',
    },
    {
        image: '35',
        title: '古巴战士 (简)',
        type: 'STG',
    },
    {
        image: '37',
        title: '七宝奇谋 (修正版) (简)',
        type: 'ACT',
    },
    {
        image: '39',
        title: '哈利传奇 (简)',
        type: 'ACT',
    },
    {
        image: '40',
        title: '霹雳神兵 (简)',
        type: 'ACT',
    },
    {
        image: '41',
        title: '战国群雄传 (繁)',
        type: 'SLG',
    },
    {
        image: '42',
        title: '甲A - 中国足球俱乐部之经营 (简)',
        type: 'SLG',
    },
    {
        image: '43',
        title: '基督山恩仇记 (繁)',
        type: 'SLG',
    },
    {
        image: '44',
        title: '星际魂斗罗 (修正版) (简)',
        type: 'ACT',
    },
    {
        image: '47',
        title: '电视玛琍 (繁)',
        type: 'TAB',
    },
    {
        image: '48',
        title: '月宫桌球 (修正版) (简)',
        type: 'TAB',
    },
    {
        image: '49',
        title: '绿野仙踪 (简)',
        type: 'ACT',
    },
    {
        image: '50',
        title: '魔法门 - 英雄无敌 (简)',
        type: 'SLG',
    },
    {
        image: '51',
        title: '猫捉老鼠 (简)',
        type: 'ACT',
    },
    {
        image: '52',
        title: '扑克精灵 (繁)',
        type: 'TAB',
    },
    {
        image: '53',
        title: '魔道士阴谋 (修正版) (简)',
        type: 'SLG',
    },
    {
        image: '54',
        title: '未来小子 (简)',
        type: 'STG',
    },
    {
        image: '56',
        title: '魔神法师 (简)',
        type: 'RPG',
    },
    {
        image: '59',
        title: '帝国风暴 (简)',
        type: 'SLG',
    },
    {
        image: '60',
        title: '星空飞箭 (简)',
        type: 'STG',
    },
    {
        image: '62',
        title: '忍者龙剑传2 - 暗黑邪神剑 (简)',
        type: 'ACT',
    },
    {
        image: '63',
        title: '忍者龙剑传3 - 黄泉方舟 (简)',
        type: 'ACT',
    },
    {
        image: '67',
        title: '公路赛车 (简)',
        type: 'RAC',
    },
    {
        image: '68',
        title: '洛克人6 - 史上最长的战斗！ (简)',
        type: 'ACT',
    },
    {
        image: '69',
        title: '绿色兵团 (简)',
        type: 'ACT',
    },
    {
        image: '72',
        title: 'SD英雄总决战 - 打倒！恶之军团 (简)',
        type: 'ACT',
    },
    {
        image: '73',
        title: '星际武士 (繁)',
        type: 'FTG',
    },
    {
        image: '76',
        title: '双截龙2 - 复仇 (简)',
        type: 'ACT',
    },
    {
        image: '77',
        title: '红巾特攻队 (简)',
        type: 'STG',
    },
    {
        image: '78',
        title: '小玛琍 (繁)',
        type: 'TAB',
    },
    {
        image: '80',
        title: '隋唐演义 (简)',
        type: 'SLG',
    },
    {
        image: '81',
        title: '烈火92 (修正版) (简)',
        type: 'STG',
    },
    {
        image: '82',
        title: '超级魂斗罗 (简)',
        type: 'ACT',
    },
    {
        image: '83',
        title: '超级魂 (简)',
        type: 'ACT',
    },
    {
        image: '85',
        title: '超级魂斗罗X (简)',
        type: 'ACT',
    },
    {
        image: '88',
        title: '网球 (简)',
        type: 'SPG',
    },
    {
        image: '89',
        title: '俄罗斯方块 (修正版) (简)',
        type: 'PUZ',
    },
    {
        image: '90',
        title: '挖金 (简)',
        type: 'PUZ',
    },
    {
        image: '92',
        title: '三国志英杰传 (简)',
        type: 'RPG',
    },
    {
        image: '97',
        title: '创世纪英雄 (繁)',
        type: 'RPG',
    },
    {
        image: '99',
        title: '杨家将 (简)',
        type: 'SLG',
    },
    {
        image: '101',
        title: '耀奇之神奇蛋仔 (简)',
        type: 'PUZ',
    },
    {
        image: '104',
        title: '东方的传说 (繁)',
        type: 'RPG',
    },
    {
        image: '107',
        title: '超级战魂 (简)',
        type: 'ACT',
    },
    {
        image: '110',
        title: '东风 (繁)',
        type: 'TAB',
    },
    {
        image: '111',
        title: '恶魔之剑 (修正版) (简)',
        type: 'ACT',
    },
    {
        image: '113',
        title: '荒野大镖客 (v3) (修正版) (简)',
        type: 'STG',
    },
    {
        image: '115',
        title: '假面忍者 - 花丸 (简)',
        type: 'ACT',
    },
    {
        image: '118',
        title: '龙珠英雄 (简)',
        type: 'SLG',
    },
    {
        image: '119',
        title: '洛克人2 - Dr.Wily之谜 (简)',
        type: 'ACT',
    },
    {
        image: '120',
        title: '马戏团 (修正版) (简)',
        type: 'ACT',
    },
    {
        image: '121',
        title: '高桥名人的冒险岛2 (修正版) (简)',
        type: 'ACT',
    },
    {
        image: '122',
        title: '高桥名人的冒险岛3 (简)',
        type: 'ACT',
    },
    {
        image: '123',
        title: '欧陆之战 (繁)',
        type: 'SLG',
    },
    {
        image: '124',
        title: '匹诺槽的复苏 (简)',
        type: 'RPG',
    },
    {
        image: '125',
        title: '有趣的方块游戏 (简)',
        type: 'PUZ',
    },
    {
        image: '128',
        title: '国夫君的热血新记录！ - 要得到所有金牌 (简)',
        type: 'SPG',
    },
    {
        image: '130',
        title: '杀虫大战 (修正版) (简)',
        type: 'STG',
    },
    {
        image: '132',
        title: '泰坦尼克号 (简)',
        type: 'RPG',
    },
    {
        image: '133',
        title: '坦克游戏大战 (简)',
        type: 'STG',
    },
    {
        image: '134',
        title: '坦克仔 (简)',
        type: 'STG',
    },
    {
        image: '135',
        title: '特救指令 (简)',
        type: 'ACT',
    },
    {
        image: '136',
        title: '特库摩世界杯足球 (修正版) (简)',
        type: 'SPG',
    },
    {
        image: '137',
        title: '淘气厨师 - 食物的世界 (简)',
        type: 'ACT',
    },
    {
        image: '138',
        title: '脱狱 - 被俘之战 (修正版) (简)',
        type: 'ACT',
    },
    {
        image: '139',
        title: '围棋大战 (简)',
        type: 'TAB',
    },
    {
        image: '140',
        title: '侠客情 - 荆轲刺秦王 (简)',
        type: 'RPG',
    },
    {
        image: '148',
        title: '希特勒复活 (简)',
        type: 'ACT',
    },
    {
        image: '151',
        title: '古墓丽影 (简)',
        type: 'RPG',
    },
    {
        image: '152',
        title: '1942 (简)',
        type: 'STG',
    },
    {
        image: '153',
        title: '1944 (v1.0) (简)',
        type: 'STG',
    },
    {
        image: '157',
        title: '双截龙2 - 复仇 (简)',
        type: 'ACT',
    },
    {
        image: '162',
        title: 'F1赛车 (简)',
        type: 'RAC',
    },
    {
        image: '163',
        title: 'F1赛车 (简)',
        type: 'RAC',
    },
    {
        image: '164',
        title: '魔域英雄传 (简)',
        type: 'RPG',
    },
    {
        image: '166',
        title: '绝代英雄 (繁)',
        type: 'SLG',
    },
    {
        image: '167',
        title: 'JuJu传说 (v1.1) (简)',
        type: 'ACT',
    },
    {
        image: '168',
        title: '筋肉人 (简)',
        type: 'FTG',
    },
    {
        image: '169',
        title: '马里奥兄弟 (简)',
        type: 'ACT',
    },
    {
        image: '170',
        title: '魔神英雄传外传 (v2.0) (简)',
        type: 'RPG',
    },
    {
        image: '171',
        title: '梦幻 - 香帅传奇之血海飘零 (简)',
        type: 'RPG',
    },
    {
        image: '172',
        title: '梦之勇士 (简)',
        type: 'ACT',
    },
    {
        image: '173',
        title: 'Q版沙罗曼蛇 (简)',
        type: 'STG',
    },
    {
        image: '179',
        title: '快打旋风 (简)',
        type: 'ACT',
    },
    {
        image: '180',
        title: '神探柯南 (简)',
        type: 'AVG',
    },
    {
        image: '184',
        title: '剑王 (简)',
        type: 'ACT',
    },
    {
        image: '185',
        title: '汤姆历险记 (简)',
        type: 'RPG',
    },
    {
        image: '186',
        title: '坦克大战 (简)',
        type: 'STG',
    },
    {
        image: '187',
        title: '网球 (简)',
        type: 'SPG',
    },
    {
        image: '188',
        title: '街头格斗小子 (简)',
        type: 'FTG',
    },
    {
        image: '189',
        title: '西天取经2 (简)',
        type: 'ACT',
    },
    {
        image: '190',
        title: '超一流烟山杯围棋 (简)',
        type: 'TAB',
    },
    {
        image: '193',
        title: '阿尔戈斯战士 (修正版) (简)',
        type: 'ACT',
    },
    {
        image: '194',
        title: '埃及 (简)',
        type: 'PUZ',
    },
    {
        image: '195',
        title: '林则徐禁烟 (修正版) (繁)',
        type: 'RPG',
    },
    {
        image: '196',
        title: '企鹅先生冒险之旅 (简)',
        type: 'PUZ',
    },
    {
        image: '201',
        title: '淘气厨师 - 食物的世界 (简)',
        type: 'ACT',
    },
    {
        image: '203',
        title: '超级铁板阵 - 加索布之谜 (简)',
        type: 'STG',
    },
    {
        image: '204',
        title: '超时空要塞 (简)',
        type: 'STG',
    },
    {
        image: '205',
        title: '成龙踢馆 (简)',
        type: 'ACT',
    },
    {
        image: '206',
        title: '城堡探险 (简)',
        type: 'ACT',
    },
    {
        image: '207',
        title: '吃豆小精灵 (简)',
        type: 'PUZ',
    },
    {
        image: '208',
        title: '假面的忍者 - 赤影 (v1.0) (简)',
        type: 'ACT',
    },
    {
        image: '211',
        title: '大金刚 (简)',
        type: 'ACT',
    },
    {
        image: '212',
        title: '大金刚3 (简)',
        type: 'ACT',
    },
    {
        image: '213',
        title: '大金刚Jr (简)',
        type: 'ACT',
    },
    {
        image: '214',
        title: '大蜜蜂 (简)',
        type: 'STG',
    },
    {
        image: '215',
        title: '弹珠台 (简)',
        type: 'TAB',
    },
    {
        image: '216',
        title: '魂斗罗力量 (简)',
        type: 'ACT',
    },
    {
        image: '218',
        title: '洛克人 (简)',
        type: 'ACT',
    },
    {
        image: '219',
        title: '洛克人5 - 布鲁斯的圈套！ (简)',
        type: 'ACT',
    },
    {
        image: '220',
        title: '洛克人Exile (简)',
        type: 'ACT',
    },
    {
        image: '221',
        title: '魔法总动员 (修正版) (简)',
        type: 'ACT',
    },
    {
        image: '222',
        title: '口袋里的魔鬼 (简)',
        type: 'ACT',
    },
    {
        image: '226',
        title: '碰碰车 (v1.0) (简)',
        type: 'ACT',
    },
    {
        image: '227',
        title: '气球大战 (v1.0) (简)',
        type: 'ACT',
    },
    {
        image: '228',
        title: '前线大作战 (简)',
        type: 'ACT',
    },
    {
        image: '229',
        title: '敲冰块 (简)',
        type: 'ACT',
    },
    {
        image: '230',
        title: '热血高校躲避球部 (简)',
        type: 'SPG',
    },
    {
        image: '231',
        title: '街头 - 热血进行曲 (简)',
        type: 'SPG',
    },
    {
        image: '233',
        title: '三目童子 (简)',
        type: 'ACT',
    },
    {
        image: '236',
        title: '时空小子 (简)',
        type: 'ACT',
    },
    {
        image: '237',
        title: '水管工马里奥 (v2) (简)',
        type: 'ACT',
    },
    {
        image: '238',
        title: '汤姆和杰瑞和塔菲 (简)',
        type: 'ACT',
    },
    {
        image: '240',
        title: '铁血战士 (简)',
        type: 'STG',
    },
    {
        image: '241',
        title: '屠龙记4 (简)',
        type: 'ACT',
    },
    {
        image: '242',
        title: '小美人鱼 - 人鱼公主 (简)',
        type: 'ACT',
    },
    {
        image: '244',
        title: '新人类 (简)',
        type: 'ACT',
    },
    {
        image: '247',
        title: '异域诛魂 (简)',
        type: 'ACT',
    },
    {
        image: '250',
        title: '月之水晶 (简)',
        type: 'ACT',
    },
    {
        image: '255',
        title: '战国无双 (繁)',
        type: 'SLG',
    },
    {
        image: '260',
        title: '金曲KTV (简)',
        type: 'ETC',
    },
    {
        image: '261',
        title: '斗者的挽歌 (简)',
        type: 'ACT',
    },
    {
        image: '263',
        title: '光之神话 - 天使岛传说 (简)',
        type: 'ACT',
    },
    {
        image: '264',
        title: '洛克人4 - 新的野心!! (简)',
        type: 'ACT',
    },
    {
        image: '265',
        title: '虎穴行动 (简)',
        type: 'ACT',
    },
    {
        image: '268',
        title: '超级魂斗罗 (简)',
        type: 'ACT',
    },
    {
        image: '269',
        title: '锄大D (繁)',
        type: 'TAB',
    },
    {
        image: '270',
        title: '筋肉人 - 摔角大赛 (简)',
        type: 'FTG',
    },
    {
        image: '271',
        title: '空中魂斗罗 - 纽约行动 (简)',
        type: 'STG',
    },
    {
        image: '272',
        title: '快打旋风 (简)',
        type: 'ACT',
    },
    {
        image: '275',
        title: '热血物语 (简)',
        type: 'ACT',
    },
    {
        image: '277',
        title: '双截龙 (简)',
        type: 'ACT',
    },
    {
        image: '278',
        title: '双截龙 (简)',
        type: 'ACT',
    },
    {
        image: '287',
        title: '外星战将 (简)',
        type: 'ACT',
    },
    {
        image: '302',
        title: '东方传说 - 封印岛 (简)',
        type: 'RPG',
    },
    {
        image: '303',
        title: '汉堡包 (简)',
        type: 'PUZ',
    },
    {
        image: '304',
        title: 'FC原人 (简)',
        type: 'ACT',
    },
    {
        image: '307',
        title: '皮卡丘Y2K (简)',
        type: 'ACT',
    },
    {
        image: '309',
        title: '扑克 (简)',
        type: 'TAB',
    },
    {
        image: '310',
        title: '国夫君的热血足球联盟 (简)',
        type: 'SPG',
    },
    {
        image: '314',
        title: '大力水手 (简)',
        type: 'ACT',
    },
    {
        image: '315',
        title: '导弹坦克 (简)',
        type: 'STG',
    },
    {
        image: '317',
        title: '赤影战士 (小字版) (简)',
        type: 'ACT',
    },
    {
        image: '320',
        title: '救火英雄 (简)',
        type: 'ACT',
    },
    {
        image: '321',
        title: '快乐猫 (简)',
        type: 'ACT',
    },
    {
        image: '324',
        title: '洛克人2 - Dr.Wily之谜 (简)',
        type: 'ACT',
    },
    {
        image: '325',
        title: '洛克人3 - Dr.Wily的末日！ (简)',
        type: 'ACT',
    },
    {
        image: '326',
        title: '洛克人4 - 新的野心!! (简)',
        type: 'ACT',
    },
    {
        image: '327',
        title: '洛克人5 - 布鲁斯的圈套！ (简)',
        type: 'ACT',
    },
    {
        image: '328',
        title: '洛克人6 - 史上最长的战斗！ (简)',
        type: 'ACT',
    },
    {
        image: '329',
        title: '洛克人X (简)',
        type: 'ACT',
    },
    {
        image: '332',
        title: '忍者神龟2 (修正版) (简)',
        type: 'ACT',
    },
    {
        image: '333',
        title: '三目童子 (简)',
        type: 'ACT',
    },
    {
        image: '334',
        title: '四川麻雀 - 制服篇 (简)',
        type: 'TAB',
    },
    {
        image: '338',
        title: 'AV麻将俱乐部 (简)',
        type: 'TAB',
    },
    {
        image: '339',
        title: '坦克大战 (简)',
        type: 'STG',
    },
    {
        image: '341',
        title: '菩故须苛战争 (繁)',
        type: 'ACT',
    },
    {
        image: '343',
        title: '挖掘 (v2) (简)',
        type: 'PUZ',
    },
    {
        image: '345',
        title: '冰山登山者 (简)',
        type: 'ACT',
    },
    {
        image: '348',
        title: '快打旋风 (简)',
        type: 'ACT',
    },
    {
        image: '349',
        title: '热血！街头篮球 - 加油吧！灌篮高手们！ (简)',
        type: 'SPG',
    },
    {
        image: '350',
        title: '忍者 - 阿修罗之章 (简)',
        type: 'ACT',
    },
    {
        image: '355',
        title: '双鹰 - 乔兄弟的复仇 (简)',
        type: 'STG',
    },
    {
        image: '356',
        title: '挖地雷 (简)',
        type: 'PUZ',
    },
    {
        image: '358',
        title: '高桥名人的冒险岛3 (简)',
        type: 'ACT',
    },
    {
        image: '359',
        title: '星之卡比 - 梦之泉的物语 (简)',
        type: 'ACT',
    },
    {
        image: '368',
        title: '撞球传说 - 花撞2 (繁)',
        type: 'PUZ',
    },
    {
        image: '369',
        title: '坦克大作战 (简)',
        type: 'STG',
    },
    {
        image: '370',
        title: '楚留香 - 香帅传奇之血海飘零 (简)',
        type: 'RPG',
    },
    {
        image: '373',
        title: '兴奋自动二轮 (繁)',
        type: 'RAC',
    },
    {
        image: '375',
        title: '黑客 (简)',
        type: 'ACT',
    },
    {
        image: '383',
        title: '猫捉老鼠 (简)',
        type: 'ACT',
    },
    {
        image: '390',
        title: '泰坦尼克号 (简)',
        type: 'ACT',
    },
    {
        image: '392',
        title: '帝国直升机 (简)',
        type: 'STG',
    },
    {
        image: '393',
        title: '怪物制造者1 (简)',
        type: 'RPG',
    },
    {
        image: '394',
        title: '怪物制造者2 (简)',
        type: 'RPG',
    },
    {
        image: '395',
        title: '最游记 - 唐三藏 (简)',
        type: 'RPG',
    },
    {
        image: '401',
        title: '异形 - 太空探险者 (简)',
        type: 'RPG',
    },
    {
        image: '402',
        title: '武林外传 (简)',
        type: 'RPG',
    },
    {
        image: '411',
        title: '阿拉丁 (v1.0) (简)',
        type: 'ACT',
    },
    {
        image: '414',
        title: '三国志英杰传 (繁)',
        type: 'RPG',
    },
    {
        image: '416',
        title: '守护者坦克 (简)',
        type: 'STG',
    },
    {
        image: '417',
        title: '洛克人X (简)',
        type: 'TAB',
    },
    {
        image: '418',
        title: '坦克大战2008 (简)',
        type: 'STG',
    },
    {
        image: '419',
        title: '忍者特训 (简)',
        type: 'ACT',
    },
    {
        image: '422',
        title: '剑侠情缘 (简)',
        type: 'RPG',
    },
    {
        image: '423',
        title: '武士魂 (简)',
        type: 'FTG',
    },
    {
        image: '424',
        title: '武士魂 (简)',
        type: 'FTG',
    },
    {
        image: '425',
        title: '灵界护法 (繁)',
        type: 'ACT',
    },
    {
        image: '426',
        title: '火龙 (繁)',
        type: 'ACT',
    },
    {
        image: '427',
        title: '中国兔宝宝 (繁)',
        type: 'ACT',
    },
    {
        image: '431',
        title: '大金刚 (简)',
        type: 'ACT',
    },
    {
        image: '433',
        title: '港京拉力赛 (简)',
        type: 'RAC',
    },
    {
        image: '437',
        title: '突然君 (简)',
        type: 'ACT',
    },
    {
        image: '452',
        title: '智慧方块 (简)',
        type: 'PUZ',
    },
    {
        image: '457',
        title: '暗棋 (繁)',
        type: 'TAB',
    },
    {
        image: '459',
        title: '小红帽 (繁)',
        type: 'ACT',
    },
    {
        image: '461',
        title: '四川麻将 (繁)',
        type: 'TAB',
    },
    {
        image: '462',
        title: '盗帅 (繁)',
        type: 'ACT',
    },
    {
        image: '463',
        title: '动动脑2 - 国中英文 (繁)',
        type: 'ETC',
    },
    {
        image: '465',
        title: '双响炮 (简)',
        type: 'TAB',
    },
    {
        image: '468',
        title: '扑克集锦 (繁)',
        type: 'TAB',
    },
    {
        image: '469',
        title: '吃豆小精灵 (简)',
        type: 'PUZ',
    },
    {
        image: '472',
        title: '超级玛利欧兄弟3 (v20160603) (美繁)',
        type: 'ACT',
    },
    {
        image: '474',
        title: '洛克人5 - 布鲁斯的圈套！ (简)',
        type: 'ACT',
    },
    {
        image: '479',
        title: '哆啦A梦 (v20090616) (繁)',
        type: 'ACT',
    },
    {
        image: '481',
        title: '快打旋风 (简)',
        type: 'ACT',
    },
    {
        image: '484',
        title: '中国象棋 (繁)',
        type: 'TAB',
    },
    {
        image: '486',
        title: '坦克风云 (简)',
        type: 'STG',
    },
    {
        image: '488',
        title: '超级贪吃蛇 (简)',
        type: 'ACT',
    },
    {
        image: '490',
        title: '松鼠大作战 (简)',
        type: 'ACT',
    },
    {
        image: '491',
        title: '松鼠大作战2 (简)',
        type: 'ACT',
    },
    {
        image: '494',
        title: '麻雀 (v1.1a) (简)',
        type: 'TAB',
    },
    {
        image: '497',
        title: '偷看扑克 (简)',
        type: 'TAB',
    },
    {
        image: '499',
        title: '魂斗罗 (简)',
        type: 'ACT',
    },
    {
        image: '501',
        title: '宇宙巡航机 (繁)',
        type: 'STG',
    },
    {
        image: '503',
        title: '轰炸超人 (v20100411) (繁)',
        type: 'PUZ',
    },
    {
        image: '504',
        title: '太空射击战 (v20220219) (繁)',
        type: 'STG',
    },
    {
        image: '506',
        title: '打砖块 (v20100513) (繁)',
        type: 'PUZ',
    },
    {
        image: '510',
        title: '4人麻将 (简)',
        type: 'TAB',
    },
    {
        image: '511',
        title: '激龟格斗 (v1.0) (简)',
        type: 'FTG',
    },
    {
        image: '512',
        title: '空中魂斗罗 - 最终任务 (v1.0) (简)',
        type: 'STG',
    },
    {
        image: '515',
        title: '绿色兵团 (简)',
        type: 'ACT',
    },
    {
        image: '516',
        title: '米老鼠大冒险 (简)',
        type: 'ACT',
    },
    {
        image: '517',
        title: '人间兵器 (v2.0) (简)',
        type: 'ACT',
    },
    {
        image: '519',
        title: '超越地平线 (v1.1) (简)',
        type: 'STG',
    },
    {
        image: '525',
        title: '花式九球 (日简)',
        type: 'SPG',
    },
    {
        image: '526',
        title: 'AV麻将俱乐部 (简)',
        type: 'TAB',
    },
    {
        image: '532',
        title: '赤影战士 (v2.0) (简)',
        type: 'ACT',
    },
    {
        image: '537',
        title: '一揆 (简)',
        type: 'ACT',
    },
    {
        image: '541',
        title: '泡泡龙 (v20101230) (繁)',
        type: 'ACT',
    },
    {
        image: '542',
        title: '忍者龟2 (v20101223) (繁)',
        type: 'ACT',
    },
    {
        image: '543',
        title: '坦克1990 (简)',
        type: 'STG',
    },
    {
        image: '544',
        title: '导弹坦克 (v1.0) (简)',
        type: 'STG',
    },
    {
        image: '546',
        title: '马里奥医生 (v2.0) (简)',
        type: 'PUZ',
    },
    {
        image: '547',
        title: 'Raf世界 (v2.0) (简)',
        type: 'ACT',
    },
    {
        image: '548',
        title: 'YieAr功夫 (v1.0) (简)',
        type: 'FTG',
    },
    {
        image: '549',
        title: '超级魂斗罗 (v2.0) (简)',
        type: 'ACT',
    },
    {
        image: '550',
        title: '超级马里奥兄弟 (简)',
        type: 'ACT',
    },
    {
        image: '551',
        title: '大眼蛙大冒险 (v1.0) (简)',
        type: 'PUZ',
    },
    {
        image: '553',
        title: '公路之星 (v1.0) (简)',
        type: 'RAC',
    },
    {
        image: '554',
        title: '公路之星2 (v1.0) (简)',
        type: 'RAC',
    },
    {
        image: '555',
        title: '黑白棋 (v1.0) (简)',
        type: 'TAB',
    },
    {
        image: '556',
        title: '魂斗罗 (简)',
        type: 'ACT',
    },
    {
        image: '557',
        title: '火箭飞车 (v1.2) (简)',
        type: 'RAC',
    },
    {
        image: '562',
        title: '高桥名人的冒险岛4 (v3.0) (简)',
        type: 'ACT',
    },
    {
        image: '564',
        title: '水果狸 (v1.1) (简)',
        type: 'TAB',
    },
    {
        image: '565',
        title: '暴走淘金者 (简)',
        type: 'PUZ',
    },
    {
        image: '566',
        title: '暴走淘金者2 (简)',
        type: 'PUZ',
    },
    {
        image: '567',
        title: '铁板阵 (v1.0) (简)',
        type: 'STG',
    },
    {
        image: '568',
        title: '耀西的饼干 (v1.3) (简)',
        type: 'PUZ',
    },
    {
        image: '571',
        title: '财神到 (繁)',
        type: 'TAB',
    },
    {
        image: '572',
        title: '水浒新传 (繁)',
        type: 'SLG',
    },
    {
        image: '573',
        title: '英雄无敌 (繁)',
        type: 'SLG',
    },
    {
        image: '578',
        title: '影子传说 (简)',
        type: 'ACT',
    },
    {
        image: '579',
        title: '加纳战机 (v1.0) (简)',
        type: 'STG',
    },
    {
        image: '580',
        title: '镜花缘 (简)',
        type: 'ACT',
    },
    {
        image: '581',
        title: '塞外奇侠传 (简)',
        type: 'RPG',
    },
    {
        image: '587',
        title: '轰炸超人2 (v20110309) (繁)',
        type: 'PUZ',
    },
    {
        image: '588',
        title: '小美人鱼 - 人鱼公主 (简)',
        type: 'ACT',
    },
    {
        image: '589',
        title: '超魔兽大战 (简)',
        type: 'SLG',
    },
    {
        image: '592',
        title: '玛利欧兄弟 (v20110401) (繁)',
        type: 'ACT',
    },
    {
        image: '593',
        title: '超级玛利欧兄弟2 (v20110328) (繁)',
        type: 'ACT',
    },
    {
        image: '594',
        title: '玛利欧兄弟拆屋工 (v20110409) (繁)',
        type: 'ACT',
    },
    {
        image: '595',
        title: '屠龙刀 (繁)',
        type: 'ACT',
    },
    {
        image: '596',
        title: '夜明珠 (繁)',
        type: 'FTG',
    },
    {
        image: '600',
        title: '快乐比奇3 - 地球战士 (解密版) (繁)',
        type: 'ACT',
    },
    {
        image: '601',
        title: '天王降魔传 (解密版) (简)',
        type: 'ACT',
    },
    {
        image: '602',
        title: '孙小毛奇幻岛 (繁)',
        type: 'ACT',
    },
    {
        image: '606',
        title: '真假猴王 (简)',
        type: 'ACT',
    },
    {
        image: '609',
        title: '康体舞王 (繁)',
        type: 'ETC',
    },
    {
        image: '610',
        title: '超级马里奥兄弟 (简)',
        type: 'ACT',
    },
    {
        image: '611',
        title: '超级马里奥兄弟 - 路易基之谜团 (简)',
        type: 'ACT',
    },
    {
        image: '612',
        title: '敲冰块 (简)',
        type: 'ACT',
    },
    {
        image: '613',
        title: '兴奋摩托车 (简)',
        type: 'RAC',
    },
    {
        image: '615',
        title: '拯救世纪 (繁)',
        type: 'RPG',
    },
    {
        image: '619',
        title: '风云 (简)',
        type: 'RPG',
    },
    {
        image: '622',
        title: '光明之神 (繁)',
        type: 'RPG',
    },
    {
        image: '625',
        title: '超级大战略 (解密版) (简)',
        type: 'SLG',
    },
    {
        image: '626',
        title: '东周列国志 (简)',
        type: 'SLG',
    },
    {
        image: '627',
        title: '争霸世纪 (繁)',
        type: 'SLG',
    },
    {
        image: '636',
        title: '荣誉勋章 (简)',
        type: 'AVG',
    },
    {
        image: '637',
        title: '幽灵列车 (简)',
        type: 'AVG',
    },
    {
        image: '638',
        title: '龙魂 (简)',
        type: 'RPG',
    },
    {
        image: '639',
        title: '龙之谷 (繁)',
        type: 'RPG',
    },
    {
        image: '644',
        title: '外星战将 (简)',
        type: 'ACT',
    },
    {
        image: '649',
        title: '虎门硝烟 (繁)',
        type: 'RPG',
    },
    {
        image: '650',
        title: '红楼梦 (简)',
        type: 'TAB',
    },
    {
        image: '661',
        title: '梦之勇士 (简)',
        type: 'ACT',
    },
    {
        image: '664',
        title: '忍者茶茶丸君 (v20111227) (繁)',
        type: 'ACT',
    },
    {
        image: '666',
        title: '乱世三国 (简)',
        type: 'SLG',
    },
    {
        image: '667',
        title: '太阳勇者 - 火鸟 (简)',
        type: 'STG',
    },
    {
        image: '670',
        title: '挖掘2 (v2) (简)',
        type: 'TAB',
    },
    {
        image: '671',
        title: '摩艾君 (简)',
        type: 'PUZ',
    },
    {
        image: '672',
        title: '愤怒的小鸟 (简)',
        type: 'PUZ',
    },
    {
        image: '673',
        title: '原始人 (简)',
        type: 'ACT',
    },
    {
        image: '677',
        title: '大话水浒 (简)',
        type: 'RPG',
    },
    {
        image: '678',
        title: '口袋怪兽2 (简)',
        type: 'RPG',
    },
    {
        image: '679',
        title: '最终幻想1 - 黑暗篇 (简)',
        type: 'RPG',
    },
    {
        image: '680',
        title: '最终幻想2 - 光明篇 (简)',
        type: 'RPG',
    },
    {
        image: '683',
        title: '外星战将 (简)',
        type: 'ACT',
    },
    {
        image: '684',
        title: '狮王传奇 (简)',
        type: 'ACT',
    },
    {
        image: '686',
        title: '超级冲刺赛 (简)',
        type: 'RAC',
    },
    {
        image: '687',
        title: '愤怒的小鸟 (简)',
        type: 'PUZ',
    },
    {
        image: '688',
        title: '推箱子 (简)',
        type: 'PUZ',
    },
    {
        image: '692',
        title: '哆啦A梦 - 超时空历险 (简)',
        type: 'RPG',
    },
    {
        image: '702',
        title: '最终幻想3 - 终结篇 (简)',
        type: 'RPG',
    },
    {
        image: '703',
        title: '战神世界 (简)',
        type: 'RPG',
    },
    {
        image: '704',
        title: '剑侠情缘 (简)',
        type: 'RPG',
    },
    {
        image: '705',
        title: '加菲猫一周 (简)',
        type: 'ACT',
    },
    {
        image: '708',
        title: '热血硬派国雄君 (简)',
        type: 'ACT',
    },
    {
        image: '709',
        title: '魔道劫 (简)',
        type: 'RPG',
    },
    {
        image: '715',
        title: '合金风暴 (简)',
        type: 'RPG',
    },
    {
        image: '721',
        title: '气球大战 (简)',
        type: 'ACT',
    },
    {
        image: '732',
        title: '红问号 (简)',
        type: 'RPG',
    },
    {
        image: '733',
        title: '吞食天地2 - 诸葛孔明传 (简)',
        type: 'RPG',
    },
    {
        image: '734',
        title: '铁甲威龙 (v1.1) (简)',
        type: 'ACT',
    },
    {
        image: '736',
        title: '特救指令 (简)',
        type: 'ACT',
    },
    {
        image: '746',
        title: '英雄无敌 (繁)',
        type: 'SLG',
    },
    {
        image: '757',
        title: '火焰使者 (繁)',
        type: 'RPG',
    },
    {
        image: '758',
        title: '梦幻仙境 (简)',
        type: 'RPG',
    },
    {
        image: '760',
        title: '拳霸4 (繁)',
        type: 'SLG',
    },
    {
        image: '764',
        title: '中华英雄 (简)',
        type: 'SLG',
    },
    {
        image: '768',
        title: '神奇宝贝 (简)',
        type: 'RPG',
    },
    {
        image: '769',
        title: '神魔大陆 (简)',
        type: 'RPG',
    },
    {
        image: '773',
        title: '超级马里奥兄弟 (简)',
        type: 'ACT',
    },
    {
        image: '774',
        title: '坦克大战 (简)',
        type: 'STG',
    },
    {
        image: '775',
        title: '洛克人 (简)',
        type: 'ACT',
    },
    {
        image: '776',
        title: '变形战机Z (简)',
        type: 'STG',
    },
    {
        image: '778',
        title: '列车奇案 (简)',
        type: 'AVG',
    },
    {
        image: '781',
        title: '勇者黑暗世界 - 混沌世界 (简)',
        type: 'RPG',
    },
    {
        image: '793',
        title: '三国群英传 (简)',
        type: 'SLG',
    },
    {
        image: '798',
        title: '口袋怪兽 绿 - 绿叶版 (简)',
        type: 'RPG',
    },
    {
        image: '799',
        title: '口袋妖怪 - 绿叶版 (简)',
        type: 'RPG',
    },
    {
        image: '800',
        title: '口袋怪兽 - 水晶版 (简)',
        type: 'RPG',
    },
    {
        image: '801',
        title: '口袋怪兽 - 钻石版 (简)',
        type: 'RPG',
    },
    {
        image: '802',
        title: '口袋怪兽 - 珍珠版 (简)',
        type: 'RPG',
    },
    {
        image: '803',
        title: '口袋怪兽 - 白金版 (简)',
        type: 'RPG',
    },
    {
        image: '804',
        title: '口袋怪兽 - 绿叶版 (简)',
        type: 'RPG',
    },
    {
        image: '805',
        title: '合金装备 (公测2) (简)',
        type: 'AVG',
    },
    {
        image: '810',
        title: '剑侠情缘 (简)',
        type: 'RPG',
    },
    {
        image: '811',
        title: '原始人2 (简)',
        type: 'ACT',
    },
    {
        image: '821',
        title: '戈德曼 (简)',
        type: 'ACT',
    },
    {
        image: '829',
        title: '王牌海战 (简)',
        type: 'TAB',
    },
    {
        image: '831',
        title: '勇者斗恶龙3 - 罪恶渊源 (简)',
        type: 'RPG',
    },
    {
        image: '832',
        title: '勇者斗恶龙 - 勇者的试练 (简)',
        type: 'RPG',
    },
    {
        image: '833',
        title: '口袋怪兽 - 翡翠版 (简)',
        type: 'RPG',
    },
    {
        image: '834',
        title: '口袋怪兽 - 白玉版 (简)',
        type: 'RPG',
    },
    {
        image: '845',
        title: '吞食天地 (简)',
        type: 'RPG',
    },
    {
        image: '851',
        title: '嘉蒂外传 (v1.1) (简)',
        type: 'STG',
    },
    {
        image: '853',
        title: '美猴王 (解密版) (简)',
        type: 'ACT',
    },
    {
        image: '854',
        title: '魔塔 (简)',
        type: 'RPG',
    },
    {
        image: '855',
        title: '魔幻三国志 (简)',
        type: 'SLG',
    },
    {
        image: '856',
        title: '机器战士高达 (繁)',
        type: 'SLG',
    },
    {
        image: '857',
        title: '轩辕剑 - 天之痕 (简)',
        type: 'RPG',
    },
    {
        image: '858',
        title: '新魔界 (简)',
        type: 'RPG',
    },
    {
        image: '859',
        title: '失落的神器 (简)',
        type: 'RPG',
    },
    {
        image: '860',
        title: '伊苏6 - 纳比斯订的方舟 (简)',
        type: 'RPG',
    },
    {
        image: '861',
        title: '伊苏的起源 - 尤格 (简)',
        type: 'RPG',
    },
    {
        image: '863',
        title: '伊苏 - 菲尔盖纳之誓约 (简)',
        type: 'RPG',
    },
    {
        image: '868',
        title: '轩辕剑 - 云的彼端 (简)',
        type: 'RPG',
    },
    {
        image: '869',
        title: '落日征战 (简)',
        type: 'RPG',
    },
    {
        image: '870',
        title: '伏魔英雄传 (简)',
        type: 'RPG',
    },
    {
        image: '871',
        title: '轩辕剑 - 王者归来 (简)',
        type: 'RPG',
    },
    {
        image: '872',
        title: '刀剑英雄传 (简)',
        type: 'RPG',
    },
    {
        image: '873',
        title: '亡灵崛起 (简)',
        type: 'RPG',
    },
    {
        image: '874',
        title: '轩辕剑 - 枫之舞 (简)',
        type: 'RPG',
    },
    {
        image: '875',
        title: '无双乱舞 (简)',
        type: 'RPG',
    },
    {
        image: '876',
        title: '三国志 - 蜀魏争霸 (简)',
        type: 'RPG',
    },
    {
        image: '877',
        title: '傲视天地 (简)',
        type: 'RPG',
    },
    {
        image: '878',
        title: '三国志 - 蜀汉风云 (简)',
        type: 'RPG',
    },
    {
        image: '879',
        title: '征战天下 (简)',
        type: 'RPG',
    },
    {
        image: '889',
        title: '趣味方块 (简)',
        type: 'PUZ',
    },
    {
        image: '890',
        title: '敲冰块 (简)',
        type: 'ACT',
    },
    {
        image: '891',
        title: '马里奥兄弟 (简)',
        type: 'ACT',
    },
    {
        image: '893',
        title: '炸弹人 (简)',
        type: 'PUZ',
    },
    {
        image: '899',
        title: '阿尔戈斯战士 (v1.11) (简)',
        type: 'ACT',
    },
    {
        image: '902',
        title: '超级玛利欧兄弟3 (v20160603) (日繁)',
        type: 'ACT',
    },
    {
        image: '914',
        title: '超级魂斗罗 (简)',
        type: 'ACT',
    },
    {
        image: '915',
        title: '魂斗罗 (简)',
        type: 'ACT',
    },
    {
        image: '916',
        title: '中国麻将 (简)',
        type: 'TAB',
    },
    {
        image: '920',
        title: '冲冲赖皮狗 (简)',
        type: 'ACT',
    },
    {
        image: '921',
        title: '银河战士 (v2) (简)',
        type: 'ACT',
    },
    {
        image: '923',
        title: '魂斗罗力量 (简)',
        type: 'ACT',
    },
    {
        image: '933',
        title: '魔城传说2 - 大魔司教加里奥斯 (v2.2) (简)',
        type: 'ACT',
    },
    {
        image: '940',
        title: '蝙蝠侠 (简)',
        type: 'ACT',
    },
    {
        image: '942',
        title: '热血！街头篮球 - 加油吧！灌篮高手们！ (简)',
        type: 'SPG',
    },
    {
        image: '949',
        title: '大力工头阿源君 (v1.0) (简)',
        type: 'ACT',
    },
    {
        image: '950',
        title: '唐老鸭历险记2 (v1.2) (简)',
        type: 'ACT',
    },
    {
        image: '952',
        title: '地狱极乐丸 (v1.0) (简)',
        type: 'ACT',
    },
    {
        image: '954',
        title: '异形3 (v1.1) (简)',
        type: 'ACT',
    },
    {
        image: '990',
        title: '吞食天地 (简)',
        type: 'RPG',
    },
    {
        image: '995',
        title: '特救指令 (简)',
        type: 'ACT',
    },
    {
        image: '1000',
        title: '俄罗斯方块 (简)',
        type: 'PUZ',
    },
    {
        image: '1016',
        title: '1942 (简)',
        type: 'STG',
    },
    {
        image: '1029',
        title: '雪人兄弟 (简)',
        type: 'ACT',
    },
    {
        image: '1034',
        title: '萨尔达传说1 - 海拉尔的幻想 (v20220314) (繁)',
        type: 'RPG',
    },
    {
        image: '1038',
        title: '1942 (简)',
        type: 'STG',
    },
    {
        image: '1040',
        title: '俄罗斯方块 (简)',
        type: 'PUZ',
    },
    {
        image: '1045',
        title: '爱情小屋 (简)',
        type: 'ACT',
    },
    {
        image: '1049',
        title: '兵蜂 (简)',
        type: 'STG',
    },
    {
        image: '1053',
        title: '超级冲刺赛 (简)',
        type: 'RAC',
    },
    {
        image: '1055',
        title: '茶茶丸大冒险 (v1.0) (简)',
        type: 'ACT',
    },
    {
        image: '1057',
        title: '超时空要塞 (简)',
        type: 'STG',
    },
    {
        image: '1059',
        title: '成龙踢馆 (简)',
        type: 'ACT',
    },
    {
        image: '1060',
        title: '吃豆小精灵 (简)',
        type: 'PUZ',
    },
    {
        image: '1062',
        title: '成龙之龙 (简)',
        type: 'ACT',
    },
    {
        image: '1063',
        title: '打空气 (简)',
        type: 'PUZ',
    },
    {
        image: '1066',
        title: '大金刚 (简)',
        type: 'ACT',
    },
    {
        image: '1067',
        title: '大金刚Jr (简)',
        type: 'ACT',
    },
    {
        image: '1068',
        title: '大金刚3 (简)',
        type: 'ACT',
    },
    {
        image: '1069',
        title: '大蜜蜂 (简)',
        type: 'STG',
    },
    {
        image: '1070',
        title: '小蜜蜂 (简)',
        type: 'STG',
    },
    {
        image: '1072',
        title: '弹珠台 (简)',
        type: 'TAB',
    },
    {
        image: '1073',
        title: '斗者挽歌 (简)',
        type: 'ACT',
    },
    {
        image: '1080',
        title: '红巾特攻队 (简)',
        type: 'STG',
    },
    {
        image: '1085',
        title: '筋肉人 (简)',
        type: 'FTG',
    },
    {
        image: '1093',
        title: '快乐猫 (简)',
        type: 'ACT',
    },
    {
        image: '1100',
        title: '摩艾君 (简)',
        type: 'PUZ',
    },
    {
        image: '1108',
        title: '霹雳神兵 (简)',
        type: 'ACT',
    },
    {
        image: '1110',
        title: '前线大作战 (简)',
        type: 'ACT',
    },
    {
        image: '1113',
        title: '三目童子 (简)',
        type: 'ACT',
    },
    {
        image: '1114',
        title: '三只小猪 (简)',
        type: 'STG',
    },
    {
        image: '1115',
        title: '杀戮战场 (简)',
        type: 'STG',
    },
    {
        image: '1117',
        title: '圣铃传说 (简)',
        type: 'ACT',
    },
    {
        image: '1120',
        title: '双截龙 (简)',
        type: 'ACT',
    },
    {
        image: '1121',
        title: '双鹰 - 乔兄弟的复仇 (简)',
        type: 'STG',
    },
    {
        image: '1123',
        title: '坦克大战 (简)',
        type: 'STG',
    },
    {
        image: '1124',
        title: '淘金者 (简)',
        type: 'PUZ',
    },
    {
        image: '1126',
        title: '特救指令 (简)',
        type: 'ACT',
    },
    {
        image: '1128',
        title: '突然君 (简)',
        type: 'ACT',
    },
    {
        image: '1131',
        title: '网球 (简)',
        type: 'SPG',
    },
    {
        image: '1132',
        title: '新人类 (简)',
        type: 'ACT',
    },
    {
        image: '1134',
        title: '星际战机 (v1) (简)',
        type: 'STG',
    },
    {
        image: '1145',
        title: '中东战争 (简)',
        type: 'STG',
    },
    {
        image: '1155',
        title: '三目童子 (简)',
        type: 'ACT',
    },
    {
        image: '1156',
        title: '双截龙3 - 神秘魔石之谜 (简)',
        type: 'ACT',
    },
    {
        image: '1157',
        title: '特救指令 (简)',
        type: 'ACT',
    },
]

const types = {
    ACT: '动作游戏',
    STG: '射击游戏',
    RPG: '角色扮演',
    SPG: '运动游戏',
    SLG: '策略游戏',
    FTG: '格斗游戏',
    AVG: '冒险解迷',
    PUZ: '益智游戏',
    RAC: '赛车竞赛',
    TAB: '桌面平台',
    ETC: '其他游戏',
}

const baseURL = 'https://taiyuuki.github.io/vscode-nes/games/'

export { games, types, baseURL }
