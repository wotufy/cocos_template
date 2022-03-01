import * as chalk from 'chalk';
import BuilderData from './BuilderData';
import BuilderUtils from './BuilderUtils';

export class BuilderCocos {
    public async build(): Promise<void> {
        // cocos 引擎地址
        let cocosPath: string = 'C:/MyPrograms/CocosDashboard/resources/.editors/Creator/version/CocosCreator.exe';
        // 根据输入的cocos版本修改引擎路径
        cocosPath = cocosPath.replace('version', BuilderData.cocosVersion);

        await BuilderUtils.runCmd(
            cocosPath,
            [
                BuilderData.projectPath,
                '--build',
                `platform=${BuilderData.buildEnv}`
            ]
        );

        console.log(chalk.green.bold('\ncocos build 成功！\n'));
    }
}


// /** 调用命令行打包项目 */
// cocosBuild(): Promise < void> {
//     let cmdString: string = 'C:/MyPrograms/CocosDashboard/resources/.editors/Creator/2.4.7/CocosCreator.exe C:/dev/project/ZombieShooter --build platform=huawei';
//     // let cmdString: string = 'ls';
//     await runCmd(cmdString);