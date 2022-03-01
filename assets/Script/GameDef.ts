/** 游戏实际运行的环境。比如华为快游戏、华为apk、华为无广告版apk */
export enum Platform {
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