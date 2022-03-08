/**
 * 这个脚本需要有下面几个功能
 * 1、根据输入的环境改变项目中对应位置的环境文本
 * 2、调用 cocos 打包命令打包对应平台
 */

import { BuilderCocos } from './BuilderCocos';
import BuilderData from './BuilderData';
import { BuildEnv, GameEnv } from './BuilderDef';
import { BuilderReplaceFile } from './BuilderReplaceFile';

import * as chalk from 'chalk';
import { BuilderPNG } from './BuilderPng';

class Builder {

    public async handle(argv: string[]): Promise<void> {
        // 判断输入是否合法
        this._checkInput(argv);

        // 获取项目路径
        this._getProjectPath();

        // 获取游戏环境和打包环境
        this._getEnv();

        // 改写代码中的文件
        let replaceFile: BuilderReplaceFile = new BuilderReplaceFile();
        replaceFile.replace();

        // cocos 执行打包操作
        let cocos: BuilderCocos = new BuilderCocos();
        await cocos.build();

        // pngquant 进行图片压缩
        let builderPNG: BuilderPNG = new BuilderPNG();
        await builderPNG.handlePNG();

        // 恢复改写过的文件
        replaceFile.resumeFile();

        console.log(`构建完毕！\n目标平台: ${chalk.green.bold(BuilderData.gameEnv)}, cocos打包环境选项: ${chalk.green.bold(BuilderData.buildEnv)}\n`);
    }

    /** 判断输入是否合法。 如果合法，就保存输入值；不合法就退出，并 log 错误 */
    private _checkInput(argv: string[]): void {
        // 命令输入的参数，例：[2.4.7, wx, true, true]
        // 第一位是cocos版本号，第二位是打包环境，第三位是是否上传，第四位是是否刷新
        let args: string[] = argv.splice(2);
        console.log(`命令行输入参数为: ${chalk.green.bold(args.join(', '))}\n`);

        // cocos版本号
        BuilderData.cocosVersion = args[0];
        // 目标运行平台
        BuilderData.gameEnv = args[1] as GameEnv;

        if (GameEnv[BuilderData.gameEnv] == null) {
            let errWords: string = `打包环境输入错误: ${BuilderData.gameEnv}`;
            console.log(chalk.red.bold(errWords));
            throw (new Error(errWords));
        }
    }

    /** 获取项目路径 */
    private _getProjectPath(): void {
        BuilderData.projectPath = process.cwd().replace(/\\/g, '/');
    }

    /** 根据输入的 gameEnv 判断 cocos 打包环境 */
    private _getEnv(): void {
        console.log('\n开始处理 env');

        switch (BuilderData.gameEnv) {
            case GameEnv.huawei_apk: {
                BuilderData.buildEnv = BuildEnv.android; break;
            }
            case GameEnv.huawei_qg: {
                BuilderData.buildEnv = BuildEnv.huawei_qg; break;
            }
            case GameEnv.web: {
                BuilderData.buildEnv = BuildEnv.web_mobile; break;
            }
            case GameEnv.web_no_ad: {
                BuilderData.buildEnv = BuildEnv.web_mobile; break;
            }
            case GameEnv.wx: {
                BuilderData.buildEnv = BuildEnv.wechatgame; break;
            }
        }

        console.log(`处理 env 结束，目标平台: ${chalk.green.bold(BuilderData.gameEnv)}, cocos打包环境选项: ${chalk.green.bold(BuilderData.buildEnv)}\n`);
    }

}

function handleInput(argv: string[]) {
    let builder: Builder = new Builder();
    builder.handle(argv);
}

handleInput(process.argv);
