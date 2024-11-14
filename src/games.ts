
const games = [
    {
        title: '超级魂93 (简)',
        type: 'ACT',
    },
    {
        title: '赌马1991 (繁)',
        type: 'PUZ',
    },
    {
        title: '飞人战士 (简)',
        type: 'STG',
    },
    {
        title: '恶魔城 (简)',
        type: 'ACT',
    },
    {
        title: '弹射球 (修正版) (简)',
        type: 'PUZ',
    },
    {
        title: '蝙蝠侠 (简)',
        type: 'ACT',
    },
    {
        title: '超惑星战记 (修正版) (简)',
        type: 'ACT',
    },
    {
        title: '楚汉争霸 (简)',
        type: 'SLG',
    },
    {
        title: '成龙之龙 (简)',
        type: 'ACT',
    },
    {
        title: '大战略 (简)',
        type: 'SLG',
    },
    {
        title: '地道战 (繁)',
        type: 'ACT',
    },
    {
        title: '机器猫小叮当 (简)',
        type: 'ACT',
    },
    {
        title: '双截龙3 - 神秘魔石之谜 (简)',
        type: 'ACT',
    },
    {
        title: '勇者斗恶龙6 (简)',
        type: 'RPG',
    },
    {
        title: '玛莉医生 (简)',
        type: 'PUZ',
    },
    {
        title: '疯狂鸡蛋仔 (简)',
        type: 'ETC',
    },
    {
        title: '无尽的任务 (简)',
        type: 'RPG',
    },
    {
        title: '银河时代 (简)',
        type: 'RPG',
    },
    {
        title: '宇宙战将 (简)',
        type: 'RPG',
    },
    {
        title: '空中魂斗罗 (简)',
        type: 'STG',
    },
    {
        title: '古巴战士 (简)',
        type: 'STG',
    },
    {
        title: '七宝奇谋 (修正版) (简)',
        type: 'ACT',
    },
    {
        title: '哈利传奇 (简)',
        type: 'ACT',
    },
    {
        title: '霹雳神兵 (简)',
        type: 'ACT',
    },
    {
        title: '战国群雄传 (繁)',
        type: 'SLG',
    },
    {
        title: '甲A - 中国足球俱乐部之经营 (简)',
        type: 'SLG',
    },
    {
        title: '基督山恩仇记 (繁)',
        type: 'SLG',
    },
    {
        title: '星际魂斗罗 (修正版) (简)',
        type: 'ACT',
    },
    {
        title: '电视玛琍 (繁)',
        type: 'TAB',
    },
    {
        title: '月宫桌球 (修正版) (简)',
        type: 'TAB',
    },
    {
        title: '绿野仙踪 (简)',
        type: 'ACT',
    },
    {
        title: '魔法门 - 英雄无敌 (简)',
        type: 'SLG',
    },
    {
        title: '猫捉老鼠 (简)',
        type: 'ACT',
    },
    {
        title: '扑克精灵 (繁)',
        type: 'TAB',
    },
    {
        title: '魔道士阴谋 (修正版) (简)',
        type: 'SLG',
    },
    {
        title: '未来小子 (简)',
        type: 'STG',
    },
    {
        title: '魔神法师 (简)',
        type: 'RPG',
    },
    {
        title: '帝国风暴 (简)',
        type: 'SLG',
    },
    {
        title: '星空飞箭 (简)',
        type: 'STG',
    },
    {
        title: '忍者龙剑传2 - 暗黑邪神剑 (简)',
        type: 'ACT',
    },
    {
        title: '忍者龙剑传3 - 黄泉方舟 (简)',
        type: 'ACT',
    },
    {
        title: '公路赛车 (简)',
        type: 'RAC',
    },
    {
        title: '洛克人6 - 史上最长的战斗！ (简)',
        type: 'ACT',
    },
    {
        title: '绿色兵团 (简)',
        type: 'ACT',
    },
    {
        title: 'SD英雄总决战 - 打倒！恶之军团 (简)',
        type: 'ACT',
    },
    {
        title: '星际武士 (繁)',
        type: 'FTG',
    },
    {
        title: '双截龙2 - 复仇 (简)',
        type: 'ACT',
    },
    {
        title: '红巾特攻队 (简)',
        type: 'STG',
    },
    {
        title: '小玛琍 (繁)',
        type: 'TAB',
    },
    {
        title: '隋唐演义 (简)',
        type: 'SLG',
    },
    {
        title: '烈火92 (修正版) (简)',
        type: 'STG',
    },
    {
        title: '超级魂 (简)',
        type: 'ACT',
    },
    {
        title: '超级魂斗罗X (简)',
        type: 'ACT',
    },
    {
        title: '网球 (简)',
        type: 'SPG',
    },
    {
        title: '俄罗斯方块 (修正版) (简)',
        type: 'PUZ',
    },
    {
        title: '挖金 (简)',
        type: 'PUZ',
    },
    {
        title: '三国志英杰传 (简)',
        type: 'RPG',
    },
    {
        title: '创世纪英雄 (繁)',
        type: 'RPG',
    },
    {
        title: '杨家将 (简)',
        type: 'SLG',
    },
    {
        title: '耀奇之神奇蛋仔 (简)',
        type: 'PUZ',
    },
    {
        title: '东方的传说 (繁)',
        type: 'RPG',
    },
    {
        title: '超级战魂 (简)',
        type: 'ACT',
    },
    {
        title: '东风 (繁)',
        type: 'TAB',
    },
    {
        title: '恶魔之剑 (修正版) (简)',
        type: 'ACT',
    },
    {
        title: '荒野大镖客 (v3) (修正版) (简)',
        type: 'STG',
    },
    {
        title: '假面忍者 - 花丸 (简)',
        type: 'ACT',
    },
    {
        title: '龙珠英雄 (简)',
        type: 'SLG',
    },
    {
        title: '洛克人2 - Dr.Wily之谜 (简)',
        type: 'ACT',
    },
    {
        title: '马戏团 (修正版) (简)',
        type: 'ACT',
    },
    {
        title: '高桥名人的冒险岛2 (修正版) (简)',
        type: 'ACT',
    },
    {
        title: '高桥名人的冒险岛3 (简)',
        type: 'ACT',
    },
    {
        title: '欧陆之战 (繁)',
        type: 'SLG',
    },
    {
        title: '匹诺槽的复苏 (简)',
        type: 'RPG',
    },
    {
        title: '有趣的方块游戏 (简)',
        type: 'PUZ',
    },
    {
        title: '国夫君的热血新记录！ - 要得到所有金牌 (简)',
        type: 'SPG',
    },
    {
        title: '杀虫大战 (修正版) (简)',
        type: 'STG',
    },
    {
        title: '泰坦尼克号 (简)',
        type: 'RPG',
    },
    {
        title: '坦克游戏大战 (简)',
        type: 'STG',
    },
    {
        title: '坦克仔 (简)',
        type: 'STG',
    },
    {
        title: '特救指令 (简)',
        type: 'ACT',
    },
    {
        title: '特库摩世界杯足球 (修正版) (简)',
        type: 'SPG',
    },
    {
        title: '淘气厨师 - 食物的世界 (简)',
        type: 'ACT',
    },
    {
        title: '脱狱 - 被俘之战 (修正版) (简)',
        type: 'ACT',
    },
    {
        title: '围棋大战 (简)',
        type: 'TAB',
    },
    {
        title: '侠客情 - 荆轲刺秦王 (简)',
        type: 'RPG',
    },
    {
        title: '希特勒复活 (简)',
        type: 'ACT',
    },
    {
        title: '古墓丽影 (简)',
        type: 'RPG',
    },
    {
        title: '1942 (简)',
        type: 'STG',
    },
    {
        title: '1944 (v1.0) (简)',
        type: 'STG',
    },
    {
        title: 'F1赛车 (简)',
        type: 'RAC',
    },
    {
        title: '魔域英雄传 (简)',
        type: 'RPG',
    },
    {
        title: '绝代英雄 (繁)',
        type: 'SLG',
    },
    {
        title: 'JuJu传说 (v1.1) (简)',
        type: 'ACT',
    },
    {
        title: '筋肉人 (简)',
        type: 'FTG',
    },
    {
        title: '马里奥兄弟 (简)',
        type: 'ACT',
    },
    {
        title: '魔神英雄传外传 (v2.0) (简)',
        type: 'RPG',
    },
    {
        title: '梦之勇士 (简)',
        type: 'ACT',
    },
    {
        title: 'Q版沙罗曼蛇 (简)',
        type: 'STG',
    },
    {
        title: '神探柯南 (简)',
        type: 'AVG',
    },
    {
        title: '剑王 (简)',
        type: 'ACT',
    },
    {
        title: '汤姆历险记 (简)',
        type: 'RPG',
    },
    {
        title: '坦克大战 (简)',
        type: 'STG',
    },
    {
        title: '街头格斗小子 (简)',
        type: 'FTG',
    },
    {
        title: '西天取经2 (简)',
        type: 'ACT',
    },
    {
        title: '超一流烟山杯围棋 (简)',
        type: 'TAB',
    },
    {
        title: '阿尔戈斯战士 (修正版) (简)',
        type: 'ACT',
    },
    {
        title: '埃及 (简)',
        type: 'PUZ',
    },
    {
        title: '林则徐禁烟 (修正版) (繁)',
        type: 'RPG',
    },
    {
        title: '企鹅先生冒险之旅 (简)',
        type: 'PUZ',
    },
    {
        title: '超级铁板阵 - 加索布之谜 (简)',
        type: 'STG',
    },
    {
        title: '超时空要塞 (简)',
        type: 'STG',
    },
    {
        title: '成龙踢馆 (简)',
        type: 'ACT',
    },
    {
        title: '城堡探险 (简)',
        type: 'ACT',
    },
    {
        title: '吃豆小精灵 (简)',
        type: 'PUZ',
    },
    {
        title: '假面的忍者 - 赤影 (v1.0) (简)',
        type: 'ACT',
    },
    {
        title: '大蜜蜂 (简)',
        type: 'STG',
    },
    {
        title: '弹珠台 (简)',
        type: 'TAB',
    },
    {
        title: '魂斗罗力量 (简)',
        type: 'ACT',
    },
    {
        title: '洛克人 (简)',
        type: 'ACT',
    },
    {
        title: '洛克人5 - 布鲁斯的圈套！ (简)',
        type: 'ACT',
    },
    {
        title: '洛克人Exile (简)',
        type: 'ACT',
    },
    {
        title: '魔法总动员 (修正版) (简)',
        type: 'ACT',
    },
    {
        title: '口袋里的魔鬼 (简)',
        type: 'ACT',
    },
    {
        title: '碰碰车 (v1.0) (简)',
        type: 'ACT',
    },
    {
        title: '气球大战 (v1.0) (简)',
        type: 'ACT',
    },
    {
        title: '前线大作战 (简)',
        type: 'ACT',
    },
    {
        title: '敲冰块 (简)',
        type: 'ACT',
    },
    {
        title: '热血高校躲避球部 (简)',
        type: 'SPG',
    },
    {
        title: '街头 - 热血进行曲 (简)',
        type: 'SPG',
    },
    {
        title: '三目童子 (简)',
        type: 'ACT',
    },
    {
        title: '时空小子 (简)',
        type: 'ACT',
    },
    {
        title: '水管工马里奥 (v2) (简)',
        type: 'ACT',
    },
    {
        title: '汤姆和杰瑞和塔菲 (简)',
        type: 'ACT',
    },
    {
        title: '铁血战士 (简)',
        type: 'STG',
    },
    {
        title: '屠龙记4 (简)',
        type: 'ACT',
    },
    {
        title: '小美人鱼 - 人鱼公主 (简)',
        type: 'ACT',
    },
    {
        title: '新人类 (简)',
        type: 'ACT',
    },
    {
        title: '异域诛魂 (简)',
        type: 'ACT',
    },
    {
        title: '月之水晶 (简)',
        type: 'ACT',
    },
    {
        title: '战国无双 (繁)',
        type: 'SLG',
    },
    {
        title: '金曲KTV (简)',
        type: 'ETC',
    },
    {
        title: '斗者的挽歌 (简)',
        type: 'ACT',
    },
    {
        title: '光之神话 - 天使岛传说 (简)',
        type: 'ACT',
    },
    {
        title: '洛克人4 - 新的野心!! (简)',
        type: 'ACT',
    },
    {
        title: '虎穴行动 (简)',
        type: 'ACT',
    },
    {
        title: '锄大D (繁)',
        type: 'TAB',
    },
    {
        title: '筋肉人 - 摔角大赛 (简)',
        type: 'FTG',
    },
    {
        title: '空中魂斗罗 - 纽约行动 (简)',
        type: 'STG',
    },
    {
        title: '热血物语 (简)',
        type: 'ACT',
    },
    {
        title: '双截龙 (简)',
        type: 'ACT',
    },
    {
        title: '外星战将 (简)',
        type: 'ACT',
    },
    {
        title: '东方传说 - 封印岛 (简)',
        type: 'RPG',
    },
    {
        title: '汉堡包 (简)',
        type: 'PUZ',
    },
    {
        title: 'FC原人 (简)',
        type: 'ACT',
    },
    {
        title: '皮卡丘Y2K (简)',
        type: 'ACT',
    },
    {
        title: '扑克 (简)',
        type: 'TAB',
    },
    {
        title: '国夫君的热血足球联盟 (简)',
        type: 'SPG',
    },
    {
        title: '大力水手 (简)',
        type: 'ACT',
    },
    {
        title: '导弹坦克 (简)',
        type: 'STG',
    },
    {
        title: '赤影战士 (小字版) (简)',
        type: 'ACT',
    },
    {
        title: '救火英雄 (简)',
        type: 'ACT',
    },
    {
        title: '快乐猫 (简)',
        type: 'ACT',
    },
    {
        title: '洛克人3 - Dr.Wily的末日！ (简)',
        type: 'ACT',
    },
    {
        title: '洛克人X (简)',
        type: 'ACT',
    },
    {
        title: '忍者神龟2 (修正版) (简)',
        type: 'ACT',
    },
    {
        title: '四川麻雀 - 制服篇 (简)',
        type: 'TAB',
    },
    {
        title: 'AV麻将俱乐部 (简)',
        type: 'TAB',
    },
    {
        title: '菩故须苛战争 (繁)',
        type: 'ACT',
    },
    {
        title: '挖掘 (v2) (简)',
        type: 'PUZ',
    },
    {
        title: '冰山登山者 (简)',
        type: 'ACT',
    },
    {
        title: '热血！街头篮球 - 加油吧！灌篮高手们！ (简)',
        type: 'SPG',
    },
    {
        title: '忍者 - 阿修罗之章 (简)',
        type: 'ACT',
    },
    {
        title: '双鹰 - 乔兄弟的复仇 (简)',
        type: 'STG',
    },
    {
        title: '挖地雷 (简)',
        type: 'PUZ',
    },
    {
        title: '星之卡比 - 梦之泉的物语 (简)',
        type: 'ACT',
    },
    {
        title: '撞球传说 - 花撞2 (繁)',
        type: 'PUZ',
    },
    {
        title: '坦克大作战 (简)',
        type: 'STG',
    },
    {
        title: '楚留香 - 香帅传奇之血海飘零 (简)',
        type: 'RPG',
    },
    {
        title: '兴奋自动二轮 (繁)',
        type: 'RAC',
    },
    {
        title: '黑客 (简)',
        type: 'ACT',
    },
    {
        title: '帝国直升机 (简)',
        type: 'STG',
    },
    {
        title: '怪物制造者1 (简)',
        type: 'RPG',
    },
    {
        title: '怪物制造者2 (简)',
        type: 'RPG',
    },
    {
        title: '最游记 - 唐三藏 (简)',
        type: 'RPG',
    },
    {
        title: '异形 - 太空探险者 (简)',
        type: 'RPG',
    },
    {
        title: '武林外传 (简)',
        type: 'RPG',
    },
    {
        title: '阿拉丁 (v1.0) (简)',
        type: 'ACT',
    },
    {
        title: '三国志英杰传 (繁)',
        type: 'RPG',
    },
    {
        title: '守护者坦克 (简)',
        type: 'STG',
    },
    {
        title: '坦克大战2008 (简)',
        type: 'STG',
    },
    {
        title: '忍者特训 (简)',
        type: 'ACT',
    },
    {
        title: '剑侠情缘 (简)',
        type: 'RPG',
    },
    {
        title: '武士魂 (简)',
        type: 'FTG',
    },
    {
        title: '灵界护法 (繁)',
        type: 'ACT',
    },
    {
        title: '火龙 (繁)',
        type: 'ACT',
    },
    {
        title: '中国兔宝宝 (繁)',
        type: 'ACT',
    },
    {
        title: '港京拉力赛 (简)',
        type: 'RAC',
    },
    {
        title: '突然君 (简)',
        type: 'ACT',
    },
    {
        title: '智慧方块 (简)',
        type: 'PUZ',
    },
    {
        title: '暗棋 (繁)',
        type: 'TAB',
    },
    {
        title: '小红帽 (繁)',
        type: 'ACT',
    },
    {
        title: '四川麻将 (繁)',
        type: 'TAB',
    },
    {
        title: '盗帅 (繁)',
        type: 'ACT',
    },
    {
        title: '动动脑2 - 国中英文 (繁)',
        type: 'ETC',
    },
    {
        title: '双响炮 (简)',
        type: 'TAB',
    },
    {
        title: '扑克集锦 (繁)',
        type: 'TAB',
    },
    {
        title: '超级玛利欧兄弟3 (v20160603) (美繁)',
        type: 'ACT',
    },
    {
        title: '哆啦A梦 (v20090616) (繁)',
        type: 'ACT',
    },
    {
        title: '快打旋风 (简)',
        type: 'ACT',
    },
    {
        title: '中国象棋 (繁)',
        type: 'TAB',
    },
    {
        title: '坦克风云 (简)',
        type: 'STG',
    },
    {
        title: '超级贪吃蛇 (简)',
        type: 'ACT',
    },
    {
        title: '松鼠大作战 (简)',
        type: 'ACT',
    },
    {
        title: '松鼠大作战2 (简)',
        type: 'ACT',
    },
    {
        title: '麻雀 (v1.1a) (简)',
        type: 'TAB',
    },
    {
        title: '偷看扑克 (简)',
        type: 'TAB',
    },
    {
        title: '宇宙巡航机 (繁)',
        type: 'STG',
    },
    {
        title: '轰炸超人 (v20100411) (繁)',
        type: 'PUZ',
    },
    {
        title: '太空射击战 (v20220219) (繁)',
        type: 'STG',
    },
    {
        title: '打砖块 (v20100513) (繁)',
        type: 'PUZ',
    },
    {
        title: '4人麻将 (简)',
        type: 'TAB',
    },
    {
        title: '激龟格斗 (v1.0) (简)',
        type: 'FTG',
    },
    {
        title: '空中魂斗罗 - 最终任务 (v1.0) (简)',
        type: 'STG',
    },
    {
        title: '米老鼠大冒险 (简)',
        type: 'ACT',
    },
    {
        title: '人间兵器 (v2.0) (简)',
        type: 'ACT',
    },
    {
        title: '超越地平线 (v1.1) (简)',
        type: 'STG',
    },
    {
        title: '花式九球 (日简)',
        type: 'SPG',
    },
    {
        title: '赤影战士 (v2.0) (简)',
        type: 'ACT',
    },
    {
        title: '一揆 (简)',
        type: 'ACT',
    },
    {
        title: '泡泡龙 (v20101230) (繁)',
        type: 'ACT',
    },
    {
        title: '忍者龟2 (v20101223) (繁)',
        type: 'ACT',
    },
    {
        title: '坦克1990 (简)',
        type: 'STG',
    },
    {
        title: '导弹坦克 (v1.0) (简)',
        type: 'STG',
    },
    {
        title: '马里奥医生 (v2.0) (简)',
        type: 'PUZ',
    },
    {
        title: 'Raf世界 (v2.0) (简)',
        type: 'ACT',
    },
    {
        title: 'YieAr功夫 (v1.0) (简)',
        type: 'FTG',
    },
    {
        title: '超级魂斗罗 (v2.0) (简)',
        type: 'ACT',
    },
    {
        title: '大眼蛙大冒险 (v1.0) (简)',
        type: 'PUZ',
    },
    {
        title: '公路之星 (v1.0) (简)',
        type: 'RAC',
    },
    {
        title: '公路之星2 (v1.0) (简)',
        type: 'RAC',
    },
    {
        title: '黑白棋 (v1.0) (简)',
        type: 'TAB',
    },
    {
        title: '火箭飞车 (v1.2) (简)',
        type: 'RAC',
    },
    {
        title: '高桥名人的冒险岛4 (v3.0) (简)',
        type: 'ACT',
    },
    {
        title: '水果狸 (v1.1) (简)',
        type: 'TAB',
    },
    {
        title: '暴走淘金者 (简)',
        type: 'PUZ',
    },
    {
        title: '暴走淘金者2 (简)',
        type: 'PUZ',
    },
    {
        title: '铁板阵 (v1.0) (简)',
        type: 'STG',
    },
    {
        title: '耀西的饼干 (v1.3) (简)',
        type: 'PUZ',
    },
    {
        title: '财神到 (繁)',
        type: 'TAB',
    },
    {
        title: '水浒新传 (繁)',
        type: 'SLG',
    },
    {
        title: '英雄无敌 (繁)',
        type: 'SLG',
    },
    {
        title: '影子传说 (简)',
        type: 'ACT',
    },
    {
        title: '加纳战机 (v1.0) (简)',
        type: 'STG',
    },
    {
        title: '镜花缘 (简)',
        type: 'ACT',
    },
    {
        title: '塞外奇侠传 (简)',
        type: 'RPG',
    },
    {
        title: '轰炸超人2 (v20110309) (繁)',
        type: 'PUZ',
    },
    {
        title: '超魔兽大战 (简)',
        type: 'SLG',
    },
    {
        title: '玛利欧兄弟 (v20110401) (繁)',
        type: 'ACT',
    },
    {
        title: '超级玛利欧兄弟2 (v20110328) (繁)',
        type: 'ACT',
    },
    {
        title: '玛利欧兄弟拆屋工 (v20110409) (繁)',
        type: 'ACT',
    },
    {
        title: '屠龙刀 (繁)',
        type: 'ACT',
    },
    {
        title: '夜明珠 (繁)',
        type: 'FTG',
    },
    {
        title: '快乐比奇3 - 地球战士 (解密版) (繁)',
        type: 'ACT',
    },
    {
        title: '天王降魔传 (解密版) (简)',
        type: 'ACT',
    },
    {
        title: '孙小毛奇幻岛 (繁)',
        type: 'ACT',
    },
    {
        title: '真假猴王 (简)',
        type: 'ACT',
    },
    {
        title: '康体舞王 (繁)',
        type: 'ETC',
    },
    {
        title: '超级马里奥兄弟 - 路易基之谜团 (简)',
        type: 'ACT',
    },
    {
        title: '兴奋摩托车 (简)',
        type: 'RAC',
    },
    {
        title: '拯救世纪 (繁)',
        type: 'RPG',
    },
    {
        title: '风云 (简)',
        type: 'RPG',
    },
    {
        title: '光明之神 (繁)',
        type: 'RPG',
    },
    {
        title: '超级大战略 (解密版) (简)',
        type: 'SLG',
    },
    {
        title: '东周列国志 (简)',
        type: 'SLG',
    },
    {
        title: '争霸世纪 (繁)',
        type: 'SLG',
    },
    {
        title: '荣誉勋章 (简)',
        type: 'AVG',
    },
    {
        title: '幽灵列车 (简)',
        type: 'AVG',
    },
    {
        title: '龙魂 (简)',
        type: 'RPG',
    },
    {
        title: '龙之谷 (繁)',
        type: 'RPG',
    },
    {
        title: '虎门硝烟 (繁)',
        type: 'RPG',
    },
    {
        title: '红楼梦 (简)',
        type: 'TAB',
    },
    {
        title: '忍者茶茶丸君 (v20111227) (繁)',
        type: 'ACT',
    },
    {
        title: '乱世三国 (简)',
        type: 'SLG',
    },
    {
        title: '太阳勇者 - 火鸟 (简)',
        type: 'STG',
    },
    {
        title: '挖掘2 (v2) (简)',
        type: 'TAB',
    },
    {
        title: '摩艾君 (简)',
        type: 'PUZ',
    },
    {
        title: '愤怒的小鸟 (简)',
        type: 'PUZ',
    },
    {
        title: '原始人 (简)',
        type: 'ACT',
    },
    {
        title: '大话水浒 (简)',
        type: 'RPG',
    },
    {
        title: '口袋怪兽2 (简)',
        type: 'RPG',
    },
    {
        title: '最终幻想1 - 黑暗篇 (简)',
        type: 'RPG',
    },
    {
        title: '最终幻想2 - 光明篇 (简)',
        type: 'RPG',
    },
    {
        title: '狮王传奇 (简)',
        type: 'ACT',
    },
    {
        title: '超级冲刺赛 (简)',
        type: 'RAC',
    },
    {
        title: '推箱子 (简)',
        type: 'PUZ',
    },
    {
        title: '哆啦A梦 - 超时空历险 (简)',
        type: 'RPG',
    },
    {
        title: '最终幻想3 - 终结篇 (简)',
        type: 'RPG',
    },
    {
        title: '战神世界 (简)',
        type: 'RPG',
    },
    {
        title: '加菲猫一周 (简)',
        type: 'ACT',
    },
    {
        title: '热血硬派国雄君 (简)',
        type: 'ACT',
    },
    {
        title: '魔道劫 (简)',
        type: 'RPG',
    },
    {
        title: '合金风暴 (简)',
        type: 'RPG',
    },
    {
        title: '气球大战 (简)',
        type: 'ACT',
    },
    {
        title: '红问号 (简)',
        type: 'RPG',
    },
    {
        title: '吞食天地2 - 诸葛孔明传 (简)',
        type: 'RPG',
    },
    {
        title: '铁甲威龙 (v1.1) (简)',
        type: 'ACT',
    },
    {
        title: '火焰使者 (繁)',
        type: 'RPG',
    },
    {
        title: '梦幻仙境 (简)',
        type: 'RPG',
    },
    {
        title: '拳霸4 (繁)',
        type: 'SLG',
    },
    {
        title: '中华英雄 (简)',
        type: 'SLG',
    },
    {
        title: '神奇宝贝 (简)',
        type: 'RPG',
    },
    {
        title: '神魔大陆 (简)',
        type: 'RPG',
    },
    {
        title: '超级马里奥兄弟 (简)',
        type: 'ACT',
    },
    {
        title: '变形战机Z (简)',
        type: 'STG',
    },
    {
        title: '列车奇案 (简)',
        type: 'AVG',
    },
    {
        title: '勇者黑暗世界 - 混沌世界 (简)',
        type: 'RPG',
    },
    {
        title: '三国群英传 (简)',
        type: 'SLG',
    },
    {
        title: '口袋怪兽 绿 - 绿叶版 (简)',
        type: 'RPG',
    },
    {
        title: '口袋妖怪 - 绿叶版 (简)',
        type: 'RPG',
    },
    {
        title: '口袋怪兽 - 水晶版 (简)',
        type: 'RPG',
    },
    {
        title: '口袋怪兽 - 钻石版 (简)',
        type: 'RPG',
    },
    {
        title: '口袋怪兽 - 珍珠版 (简)',
        type: 'RPG',
    },
    {
        title: '口袋怪兽 - 白金版 (简)',
        type: 'RPG',
    },
    {
        title: '口袋怪兽 - 绿叶版 (简)',
        type: 'RPG',
    },
    {
        title: '合金装备 (公测2) (简)',
        type: 'AVG',
    },
    {
        title: '原始人2 (简)',
        type: 'ACT',
    },
    {
        title: '戈德曼 (简)',
        type: 'ACT',
    },
    {
        title: '王牌海战 (简)',
        type: 'TAB',
    },
    {
        title: '勇者斗恶龙3 - 罪恶渊源 (简)',
        type: 'RPG',
    },
    {
        title: '勇者斗恶龙 - 勇者的试练 (简)',
        type: 'RPG',
    },
    {
        title: '口袋怪兽 - 翡翠版 (简)',
        type: 'RPG',
    },
    {
        title: '口袋怪兽 - 白玉版 (简)',
        type: 'RPG',
    },
    {
        title: '吞食天地 (简)',
        type: 'RPG',
    },
    {
        title: '嘉蒂外传 (v1.1) (简)',
        type: 'STG',
    },
    {
        title: '美猴王 (解密版) (简)',
        type: 'ACT',
    },
    {
        title: '魔塔 (简)',
        type: 'RPG',
    },
    {
        title: '魔幻三国志 (简)',
        type: 'SLG',
    },
    {
        title: '机器战士高达 (繁)',
        type: 'SLG',
    },
    {
        title: '轩辕剑 - 天之痕 (简)',
        type: 'RPG',
    },
    {
        title: '新魔界 (简)',
        type: 'RPG',
    },
    {
        title: '失落的神器 (简)',
        type: 'RPG',
    },
    {
        title: '轩辕剑 - 云的彼端 (简)',
        type: 'RPG',
    },
    {
        title: '落日征战 (简)',
        type: 'RPG',
    },
    {
        title: '伏魔英雄传 (简)',
        type: 'RPG',
    },
    {
        title: '轩辕剑 - 王者归来 (简)',
        type: 'RPG',
    },
    {
        title: '刀剑英雄传 (简)',
        type: 'RPG',
    },
    {
        title: '亡灵崛起 (简)',
        type: 'RPG',
    },
    {
        title: '轩辕剑 - 枫之舞 (简)',
        type: 'RPG',
    },
    {
        title: '无双乱舞 (简)',
        type: 'RPG',
    },
    {
        title: '三国志 - 蜀魏争霸 (简)',
        type: 'RPG',
    },
    {
        title: '傲视天地 (简)',
        type: 'RPG',
    },
    {
        title: '三国志 - 蜀汉风云 (简)',
        type: 'RPG',
    },
    {
        title: '征战天下 (简)',
        type: 'RPG',
    },
    {
        title: '趣味方块 (简)',
        type: 'PUZ',
    },
    {
        title: '炸弹人 (简)',
        type: 'PUZ',
    },
    {
        title: '阿尔戈斯战士 (v1.11) (简)',
        type: 'ACT',
    },
    {
        title: '超级魂斗罗 (简)',
        type: 'ACT',
    },
    {
        title: '魂斗罗 (简)',
        type: 'ACT',
    },
    {
        title: '中国麻将 (简)',
        type: 'TAB',
    },
    {
        title: '冲冲赖皮狗 (简)',
        type: 'ACT',
    },
    {
        title: '银河战士 (v2) (简)',
        type: 'ACT',
    },
    {
        title: '魔城传说2 - 大魔司教加里奥斯 (v2.2) (简)',
        type: 'ACT',
    },
    {
        title: '大力工头阿源君 (v1.0) (简)',
        type: 'ACT',
    },
    {
        title: '唐老鸭历险记2 (v1.2) (简)',
        type: 'ACT',
    },
    {
        title: '地狱极乐丸 (v1.0) (简)',
        type: 'ACT',
    },
    {
        title: '异形3 (v1.1) (简)',
        type: 'ACT',
    },
    {
        title: '俄罗斯方块 (简)',
        type: 'PUZ',
    },
    {
        title: '雪人兄弟',
        type: 'ACT',
    },
    {
        title: '萨尔达传说1 - 海拉尔的幻想 (v20220314) (繁)',
        type: 'RPG',
    },
    {
        title: '爱情小屋 (简)',
        type: 'ACT',
    },
    {
        title: '兵蜂 (简)',
        type: 'STG',
    },
    {
        title: '茶茶丸大冒险 (v1.0) (简)',
        type: 'ACT',
    },
    {
        title: '打空气 (简)',
        type: 'PUZ',
    },
    {
        title: '大金刚 (简)',
        type: 'ACT',
    },
    {
        title: '大金刚Jr (简)',
        type: 'ACT',
    },
    {
        title: '大金刚3 (简)',
        type: 'ACT',
    },
    {
        title: '小蜜蜂 (简)',
        type: 'STG',
    },
    {
        title: '斗者挽歌 (简)',
        type: 'ACT',
    },
    {
        title: '三只小猪 (简)',
        type: 'STG',
    },
    {
        title: '杀戮战场 (简)',
        type: 'STG',
    },
    {
        title: '圣铃传说 (简)',
        type: 'ACT',
    },
    {
        title: '淘金者 (简)',
        type: 'PUZ',
    },
    {
        title: '星际战机 (v1) (简)',
        type: 'STG',
    },
    {
        title: '中东战争 (简)',
        type: 'STG',
    },
    {
        title: '火之鸟凤凰篇',
        type: 'ACT',
    },
].sort((a, b) => a.title.localeCompare(b.title))

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
