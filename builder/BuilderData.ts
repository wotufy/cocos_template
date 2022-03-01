import { BuildEnv, GameEnv } from './BuilderDef';

class BuilderData {

    /** 项目绝对路径 */
    public projectPath: string;

    /** 游戏名称。目前是从路径中取项目文件夹的名字 */
    public gameName: string;

    /** 打包的cocos版本号 */
    public cocosVersion: string;

    /** 游戏运行环境 */
    public gameEnv: GameEnv;

    /** cocos 打包选择的构建环境 */
    public buildEnv: BuildEnv;
}

export default new BuilderData();