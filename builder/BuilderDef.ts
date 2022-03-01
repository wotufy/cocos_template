/** 游戏实际运行的环境。比如华为快游戏、华为apk、华为无广告版apk */
export enum GameEnv {
    /** 华为apk */
    huawei_apk = 'huawei_apk',
    /** 华为快游戏 */
    huawei_qg = 'huawei_qg',
    /** 微信小游戏 */
    wx = 'wx',
    /** 网页 */
    web = 'web',
    /** 网页-无视频激励版本 */
    web_no_ad = 'web_no_ad'
};

/** 根据 GameEnv 决定 cocos 打包时选择的环境。比如 gp版本 和 华为apk 都要选择安卓打包 */
export enum BuildEnv {
    /** 手机版 web */
    web_mobile = 'web-mobile',
    /** 微信 */
    wechatgame = 'wechatgame',
    /** 华为快游戏 */
    huawei_qg = 'huawei',
    /** 安卓 apk */
    android = 'android',
};
