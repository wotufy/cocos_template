import * as chalk from 'chalk';
import * as fs from 'fs';
import BuilderData from './BuilderData';

export class BuilderReplaceFile {

    /** 打包前改变项目中的环境文本，并在打包结束后调用 resumeFile 恢复 */
    public replace(): void {
        let filePath: string = `${BuilderData.projectPath}/assets/Script/GameConfig.ts`;
        let words: string = fs.readFileSync(filePath, 'utf8');

        let targetWords = this._getReplacedWords(words, `'${BuilderData.gameEnv}'`);

        fs.writeFileSync(filePath, targetWords, 'utf8');

        console.log(chalk.green.bold('改写文件成功\n'));
    }

    /** 复原项目中的环境文本 */
    public resumeFile(): void {
        let filePath: string = `${BuilderData.projectPath}/assets/Script/GameConfig.ts`;
        let words: string = fs.readFileSync(filePath, 'utf8');

        let targetWords = this._getReplacedWords(words, 'null');

        fs.writeFileSync(filePath, targetWords, 'utf8');

        console.log(chalk.green.bold('\n恢复文件成功\n'));
    }

    private _getReplacedWords(words: string, replaceWords: string): string {
        let startString: string = 'public platform: Platform = ';
        let endString: string = ';';

        // 找到 public platform: Platform = null; 这句代码，并替换其中的字符
        words = words.replace(new RegExp(`(?<=${startString}).*?(?=${endString})`), replaceWords);

        return words;
    }
}
