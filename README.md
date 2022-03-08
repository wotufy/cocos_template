# 自动化打包流程：打包前处理 => cocos打包 => 压缩图片，一行代码搞定

下文展示了 “构建前把环境写入代码” ==> “cocos 构建” ==> “压缩构建后的图片” ==> “恢复构建前修改的代码” 的一种处理方式。

这不是一篇傻瓜式教程贴，一般开始研究自动化打包流程都是有一定经验的老猿了，下面主要提供一个思路，肯定不是最优解，但是能用，扩展性也还不错，具体实现细节可以看git代码，大部分都注释了。

git地址：https://github.com/leeeklink/cocos_template.git

## 一、用到的知识点： 
npm script：打包触发方式，用 jenkins 也是可以的

cocos命令行发布：cocos 自带功能

nodejs：用于打包流程控制、修改代码内容等

ts-node: 直接运行 ts 版本的 nodejs，ts爱好者的福音

pngquant： 图片压缩插件。此处用大城小胖推荐的 pngquant，直接 npm install 就能用，比 tinypng 方便

## 二、核心知识点：nodejs.spawn
假如我们要实现开头的功能，用 npm script 写大概会是下面这样，写起来不美观，处理复杂逻辑也很费力：
```
node changeFile.ts && cocos build && pngquant *.png && node changeFile.ts
```
spawn 可以在 nodejs 执行命令行命令。这意味着我们简单封装一下，就可以用 nodejs 控制所有能够用命令行做的事。

完成版只需要在 npm script 里写成下面这样，具体的打包流程完全由 nodejs 控制，其中第一个参数是引擎版本号，第二个参数是目标发布平台：
```
ts-node ./builder/Builder 2.4.7 web
```

## 三、具体实现的拆解

### 1、创建一个 nodejs 文件作为入口
在根目录创建打包相关的文件夹。

```
|--project
    |--builder
        |--Builder.ts
```

这里选择把所有的功能代码塞到 class 里，比单函数写法优美一些2333
```
/** 打包流程控制类 */
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

    // 省略若干具体实现
}

/** 接收调用 */
function handleInput(argv: string[]) {
    let builder: Builder = new Builder();
    builder.handle(argv);
}

/** 接收调用 */
handleInput(process.argv);
```
可以看到 Builder.handle 这个函数控制了整个构建流程，可读性、可维护性都还不错。

### 2、写入环境参数
我相信一定有人用 if (wx != null) { this.platform = 'wx' } 来判断是否是微信小游戏平台，或者自己在项目中实现 getPlatform() 之类的方法。

我的选择是直接在打包流程中把目标平台写入一个文件里，代码直接读取就好了。
```
|--project
    |--assets
    |   |--Script
    |       |--GameConfig.ts
    |--builder
    |   |--Builder.ts
    |   |--BuilderReplaceFile.ts
```
GameConfig.ts
```
class GameConfig {
    public platform: Platform = null;
}

export default new GameConfig();
```
只需要在构建之前把 GameConfig 的 platform 字段写为实际的环境，代码中就可以直接调用 GameConfig.platform 拿到当前运行环境。

用正则找到对应代码，再用 fs 模块写入即可，代码如下：
```
    /** 打包前改变项目中的环境文本，并在打包结束后调用 resumeFile 恢复 */
    public replace(): void {
        let filePath: string = `${BuilderData.projectPath}/assets/Script/GameConfig.ts`;
        let words: string = fs.readFileSync(filePath, 'utf8');

        let targetWords = this._getReplacedWords(words, `'${BuilderData.gameEnv}'`);

        fs.writeFileSync(filePath, targetWords, 'utf8');

        console.log(chalk.green.bold('改写文件成功\n'));
    }
    
    private _getReplacedWords(words: string, replaceWords: string): string {
        let startString: string = 'public platform: Platform = ';
        let endString: string = ';';

        // 找到 public platform: Platform = null; 这句代码，并替换其中的字符
        words = words.replace(new RegExp(`(?<=${startString}).*?(?=${endString})`), replaceWords);

        return words;
    }
```

### 3、封装 spawn
接下来的步骤要调用命令行，因为 spawn 是异步的，所以用 Promise 封装一下。
```
class BuilderUtils {
    /** 执行cmd的命令 */
    public async runCmd(cmd: string, args: string[] = null): Promise<void> {
        console.log(`开始执行 cmd 命令，cmdString:\n${cmd} ${args != null ? args.join(' ') : ''}\n`);
        return new Promise((resolve) => {
            // { shell:  } 这个参数是因为 windows 上执行 npm 命令会报错，需要显式调用 cmd；
            // 具体原因请见这个链接： https://juejin.cn/post/6844904022059515918
            // mac/linux不受此影响
            let spawnObj = spawn(cmd, args, { shell: process.platform === 'win32'});

            spawnObj.stdout.on('data', function (data) {
                console.log(data.toString());
            });

            spawnObj.stderr.on('data', (data) => {
                console.log(data.toString());
            });

            spawnObj.on('close', function (code) {
                console.log('close code : ' + code);
                resolve();
            });
        });
    }
}
```

### 4、执行 cocos 构建
创建一个 BuilderCocos 类，负责调用 cocos 命令行构建，由 Builder 调用。
```
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
```
这里的 cocos 引擎地址我用的是绝对路径，多人协作的情况下不是很方便。有大佬把 cocos 添加到环境变量中，通过命令行直接调用，是很不错的选择。

### 5、压缩所有图片
创建一个 BuilderPNG 类，负责调用 pngquant 压缩所有图片，由 Builder 调用。
```
export class BuilderPNG {
    /** 
     * 压缩构建之后的文件夹内所有图片。
     * - 此 demo 仅做演示，所以路径写死为 web-mobile 的构建路径
     */
    public async handlePNG(): Promise<void> {
        // 使用 pngquant --quality=65-80 --ext=.png --force ${BuilderData.projectPath}/build/web-mobile/**.png
        // 其中 --quality=65-80 表示压缩质量
        // --ext=.png --force 表示覆盖原图
        // ${BuilderData.projectPath}/build/web-mobile/**.png 表示 build 目录的所有图片路径
        await BuilderUtils.runCmd(
            'find',
            [
                `${BuilderData.projectPath}/build/web-mobile/`,
                '-name',
                '\'*.png\'',
                '-exec',
                'pngquant',
                '--quality=65-80',
                '--ext=.png',
                '--force',
                '{}',
                ';'
                // 这实际是 shell 的 find ..... -exec ..... {} ; 语句的应用。
                // 上面用 ';' 而不是 '\\;'，是因为 issue 里给的参考代码是直接在 bash 里运行的，所以需要用 \; 来转译 ; 这个标识符，标识语句结束。
                // spawn 里面可能是运行的时候对 ';' 这句话做过转译，或者做了其他底层操作，反正就是不需要手动转译 ; 符号了。
            ]
        );

    }
}
```
可以看到这里备注很长，是因为 spawn 执行 pngquant 命令的时候有个奇怪的 bug，无法识别 **.png 中的 ** 符号，所以被迫改用 find ..... -exec pngquant ..... {} ; 语句。

由于 spawn 是创建子线程执行任务，因为子线程上下文与主线程不同的原因可能会有一些奇怪的问题，实际项目中使用的时候还是需要注意一下。

### 5、恢复环境参数
这跟第二步异曲同工，重新调用一下 fs 模块即可。

### 6、完成品
最终项目结构如下：
```
|--project
    |--assets
    |   |--Script
    |       |--GameConfig.ts
    |--builder
    |   |--Builder.ts               // 流程控制主体 
    |   |--BuilderReplaceFile.ts    // 改写代码文件
    |   |--BuilderCocos.ts          // cocos 构建
    |   |--BuilderPng.ts            // 压缩图片
    |   |--BuilderUtils.ts          // spawn 封装
    |   |--BuilderData.ts           // 存储输入的参数、项目路径等
    |   |--BuilderDef.ts            // 一些定义文件
```

## PS：
1、理论上 builder 文件夹内的所有文件不要引入项目中的代码文件，否则 ts-node 编译的时候可能会把一部分项目代码一起编译，影响构建速度。

2、理论上可以通过命令行实现的事情，都可以通过封装的 spawn 实现，包括构建安卓包等，但是我没试验过，大佬们可以自行尝试。

3、每个使用到的构建类型，需要先用 cocos 手动构建一次，以生成基本构建配置（避免产生未知问题）。

4、如果 git clone 下来想要测试的话，请先执行 npm install。

5、引擎版本 2.4.x