import BuilderData from './BuilderData';
import BuilderUtils from './BuilderUtils';

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

        // 正常可以用 写法1 的，但是子线程 pngquant 无法解析 **.png ，因此优化成下面的 写法2 （PS: 只有子线程模式会失败，直接命令行调用解析是正常的）
        // issue 链接参考 https://forum.gitlab.com/t/pngquant-cannot-open-png-files-for-reading/45887
        // 写法1：
        // await BuilderUtils.runCmd(
        //     'pngquant',
        //     [
        //         '--quality=65-80',
        //         '--ext=.png',
        //         '--force',
        //         `${BuilderData.projectPath}/build/web-mobile/**.png`
        //     ]
        // );

        // 写法2：
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