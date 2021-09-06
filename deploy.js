// 引入scp2
const client = require('scp2');
const ora = require('ora');
const spinner = ora('正在发布到服务器...');
const readline = require('readline-sync');

const Client = require('ssh2').Client; // 创建shell脚本
const conn = new Client();

console.log('正在建立连接...');
(async () => {
  // 每次上传手动录入
  let host = readline.question('请输入服务器ip: ');
  let port = readline.question('请输入服务器port: ');
  let username = readline.question('请输入服务器用户名: ');
  let password = readline.question('请输入「' + username + '」密码: ');
  let pathNmae = readline.question('请输入文件位置: ');

  // 脚本配置，避免每次输入服务器配置信息
  // let host = 'xxx.xxx.xxx.xxx';
  // let port = 'xx';
  // let username = 'xxx';
  // let password = 'xxxxxxxxxx';
  // let pathNmae = '/usr/share/nginx/html/';//nginx 默认路径

  conn
    .on('ready', function () {
      console.log('已连接-' + host + ':' + port);
      if (!pathNmae) {
        console.log('连接已关闭');
        conn.end();
        return false;
      }
      // 这里我拼接了放置服务器资源目录的位置 ，首选通过rm -rf删除了这个目录下的文件
      // conn.exec('rm -rf /xxxx/' + server.pathNmae + '/*', function (err, stream) {
      //     console.log('删除文件');
      //     stream.on('close', function (code, signal) {
      console.log('开始上传...');
      spinner.start();
      client.scp(
        'html',
        {
          host: host,
          port: port,
          username: username,
          password: password,
          path: pathNmae,
        },
        err => {
          spinner.stop();
          if (!err) {
            console.log('项目发布完毕');
          } else {
            console.log('err', err);
          }
          conn.end(); // 结束命令
        }
      );
      //     // })
      // })
    })
    .connect({
      host: host,
      port: port,
      username: username,
      password: password,
    });
})();
