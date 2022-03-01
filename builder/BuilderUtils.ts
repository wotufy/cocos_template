import { spawn } from 'child_process';

class BuilderUtils {

    /** 执行cmd的命令 */
    public async runCmd(cmd: string, args: string[] = null): Promise<void> {
        console.log(`开始执行 cmd 命令，cmdString:\n${cmd} ${args != null ? args.join(' ') : ''}\n`);
        return new Promise((resolve) => {
            // 具体原因请见这个链接： https://juejin.cn/post/6844904022059515918
            let spawnObj = spawn(
                cmd,
                args,
                {
                    // { shell:  } 这个参数是因为 windows 上执行 npm 命令会报错，需要显式调用 cmd；
                    // mac/linux不受此影响
                    shell: process.platform === 'win32'
                }
            );

            spawnObj.stdout.on('data', function (data) {
                console.log(data.toString());
            });

            spawnObj.stderr.on('data', (data) => {
                // console.error(`stderr: ${data}`);
                console.log(data.toString());
            });

            spawnObj.on('exit', (code) => {
                console.log('exit code : ' + code);
            });

            spawnObj.on('close', function (code) {
                console.log('close code : ' + code);
                resolve();
            });
        });
    }

}

export default new BuilderUtils();