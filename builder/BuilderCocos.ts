import * as chalk from 'chalk';
import BuilderData from './BuilderData';
import BuilderUtils from './BuilderUtils';

export class BuilderCocos {
    public async build(): Promise<void> {
        // cocos 引擎地址
        let cocosPath: string = `C:/MyPrograms/CocosDashboard/resources/.editors/Creator/${BuilderData.cocosVersion}/CocosCreator.exe`;

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
