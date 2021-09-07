<p align="center">
  <a href="https://simplecloudmusic.com" target="blank">
    <img src="https://simplecloudmusic.com/assets/logo.png" alt="Logo" width="30%">
  </a>
  <h2 align="center" style="font-weight: 600">简易云音乐</h2>
  <p align="center">
    简洁的的第三方网易云音乐播放器
    <br />
    <br />
    <a href="https://simplecloudmusic.com" target="blank"><strong>🌎 访问</strong></a>&nbsp;&nbsp;|&nbsp;&nbsp;
    <a href="https://github.com/dufu1991/simple-cloud-music" target="blank"><strong>👨🏻‍💻 GitHub</strong></a>
    <br />
    <br />
  </p>
</p>

## 🌼 技术与特性

1. 主要技术栈包含 PWA、 Svelte 、rollup、svelte-stack-router、svelte-lazy 等。

2. 支持网易云音乐账号登录（扫码、手机密码或验证码、邮箱密码）。

3. 支持歌词翻译和滚动显示。

4. 支持私人 FM、每日推荐、心动模式等。

5. 支持查看歌曲热评，过滤评论广告与官方硬塞热评，四楼终于不再是广告了！

6. 每日自动签到（上送 Android 端签到，因为积分最高）。

7. 推荐 PWA 模式使用，Chrome 和 Edge 浏览器根据首次打开时的提示安装，Safari 手动安装。

8. 播放器最大化时支持下滑最小化，最小化模式支持左滑切换下一曲，滑动支持速度判断。

9. 更多特性开发中。

10. 前端菜鸟一枚，水平有限，期待大佬提出改进意见。

## 🍽️ 如何食用

1. 本应用使用了 PWA 技术，本质还是网页应用，只是对比纯网页体验有所提升。请将图标添加至设备桌面使用，相当于将网页书签放置桌面，方便快速打开，且不占用设备存储空间。

2. Android 设备建议使用较新版本的 Chrome 或 Edge 浏览器直接打开 [简易云音乐](https://simplecloudmusic.com) ，根据提示安装至桌面使用。国内手机自带的浏览器及其他第三方浏览器由于对 chromium 内核的魔改与阉割，对 PWA 的支持一言难尽。正常情况进入页面根据提示安装至桌面即可，或按照下图手动添加。很多手机操作系统默认会关闭 APP 将网页标签放到桌面的权限，可按照以下方式（设置--应用设置--应用管理--找到 Chrome 或者 Edge 浏览器--权限管理--添加桌面快捷方式）打开权限，不同品牌手机有些许差异，请以自己的手机系统为准。注：不知是 Microsoft 和 Google 自己不上架还是被国内应用商店出于商业目的限制了，各大主流应用商店要么无法下载，要么下载的版本都是很多年前的旧版。请自行想办法安装较新版本的 Chrome 或 Edge，或到我提供的这个地址下载。[下载 Edge apk](https://simplecloudmusic.com/assets/microsoft-edge-92-0-902-59.apk)，[下载 Chrome apk](https://simplecloudmusic.com/assets/google-chrome-92-0-4515-131.apk)。

3. iOS 设备安装就很简单了，用自带的 Safari 浏览器打开 [简易云音乐](https://simplecloudmusic.com)，按照以下提示即可安装至桌面。


<p align="center">
<img src="https://simplecloudmusic.com/assets/add.jpg" alt="Logo" width="100%" style="max-width:500px">
<p>

## 💭 项目背景

想找个项目练手 Svelte，就对比了几个音乐类应用，刚好有开源的网易云 API [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) 可用，就搞了这个工程。

内容资源使用网易云音乐，UI 界面参考了 [Apple Music](https://music.apple.com/cn/browse) 与 [YesPlayMusic](https://github.com/qier222/YesPlayMusic)。

写一点自己使用过的一些音乐 APP 感受对比。

### 1. Apple Music

#### 优点

- 无广告，界面简洁。

- 音质不虚标，会员策略简单易懂无套路。

- 资源数量相对来说还比较丰富，内容也比较多元化。

#### 缺点

- Mac 端不知为何加载超级慢，服务器不是搬到云上贵州了吗？作为亲儿子应用不应该啊。

- 可能是使用的时间少，没有数据支撑，推荐机制的智障程度和 Siri 有的一拼。

- 根据我的个人习惯，喜欢一首歌，但一般不会喜欢这首歌的整张专辑和艺人的所有歌曲。所以 Apple Music 的音乐分类着重突出专辑与艺人维度，总感觉怪怪的。

- 可能是我自己品味太 low 或者主要针对欧美市场，官方整理的歌单与分类口味不对。

### 2. 网易云音乐

#### 优点

- 推荐机制与算法真的牛逼，和 Spotify 有的一拼。

- 歌单机制是真的强大，我认为网易云应该感谢这些无私奉献的网友。

- 评论区真是有意思，你管它段子是真是假，有意思就行。

- 小众音乐、轻音乐、独立音乐人等模块做的比较好。

#### 缺点

- 版权资源相对其他家较少，歌曲变灰很多。

- 功能大杂烩，广告满天飞。

- 在 UI 设计与用户体验方面即使算上 Apple Music 在内，早期版本的网易云音乐也是一流的。注意是之前的版本，现如今，各种广告植入，各种功能乱塞，各种奇怪的设定，举个简单的例子，歌曲评论默认按照推荐而不是点赞数排列，我想了下按推荐排列就可以在里面夹带私活了呀。

- 吃相难看，音质虚标，会员套路多。

### 3. QQ 音乐

#### 优点

- 以 QQ 音乐、酷狗、酷我为代表的的腾讯音乐集团，资源齐全，齐全到国内垄断，垄断到监管部门几次约谈，约谈之后依然可以敷衍了事，不了了之。

#### 缺点

- 界面太乱，花里胡哨，功能杂乱无章。出了个简洁版，只是先把用户当韭菜培养习惯。按照正常商业逻辑，做大做强了就要盈利就一定会夹带私活；没起来？那简单了啊，砍刀部一挥砍刀，这项目没了。不要太相信这些大厂的鬼话了，夸克就是最好的例子。

- 会员没买过，听大家的说法也是套路满满。

### 4. Spotify

#### 优点

- 资源齐全，即使是华语音乐资源都很齐全，Apple 应该学习一下。

- 各个平台的客户端体验都超级棒，尤其是 Spotify Connect 功能，一个第三方开发商能做到这般体验已经相当可以了。

- 推荐机制与算法很强。

#### 缺点

- 官方渠道会员价相对其他平台来说有点离谱，不过扪心自问了一下，这应该是消费者自己的问题。

- 在大陆地区正常网络就能访问，但是官方竟然不给个简体中文版本（可能是我笨，不知道怎么弄）。

## 🤷‍♂️ 已知问题或体验欠佳点

1. 播放器最大化时，由于 Android 无法阻止系统返回，iOS 无法阻止 Safari 右滑返回，进行此操作会返回上一页之后播放器才能最小化，有一点不符合操作预期，暂时无解。

2. 由于 Safari 不支持 CSS 特性 scroll-behavior: smooth（平稳滚动），手动写了 scrollSmoothTo 方法实现歌词平滑滚动，但是似乎是因为 Safari 自带的滚动延迟与自定义滚动的时间计算有冲突，若刚好在切换歌词的极短时间内手动滚动歌词会出现滚动回退现象（看人品）。考虑此需求不重要，暂不予解决（Android 原生支持 smooth，体验良好）。

3. 此应用始终是个网页应用，无法在第一级页面返回时提示即将退出应用的二次确认。

4. 目前浏览器好像没有提供完整的系统级媒体控制 API，所以无法使用线控耳机等后台方式切换下一曲等。

5. 官方歌词格式混乱，已发现的特殊情况都一一处理，可能还存在其他莫名其妙的混乱情况，查看歌词可能导致应用报错或歌词显示错误。

6. PWA 模式已经设置了仅竖屏使用，但手机横屏打开应用时页面计算的高度是横屏高度，播放器最大化与最小化就一定概率出现问题，请关闭浏览器进程（注意是浏览器进程）竖屏重新打开。

7. 虽然很多地方都做了懒加载，但是某些不适合懒加载的情况下，歌曲列表超级长的时候，由于短时间内页面要渲染大量数据，根据手机性能，可能会有延迟。

8. iOS 设备右滑返回上一页是 Safari 浏览器自带的功能，但是在 PWA 模式下右滑返回上一页会自动加载一下页面，体验不好但不影响功能。

9. iOS 的 Safari 在 PWA 模式下不能后台播放音乐？我在 Mac 的 Simulator 里面是完全没问题的，没法玩了啊。库克远程施个法？下一部就换 iPhone。

10. Android 端使用的时候，会在通知栏显示如下提示，这是浏览器自带的通知，查了下好像没有关闭的 API 。强迫症看不下去可以关闭浏览器的通知权限，但对应的通知栏控制功能也会关闭。


<p align="center">
<img src="https://simplecloudmusic.com/assets/notice.jpg" alt="notice" width="40%" style="max-width:500px">
<p>

## ⚙️ 部署

如果你有自己的服务器，建议将此应用与网易云 API 都部署至你自己的服务器，减轻我的服务器压力。

1. 部署网易云 API，详情参见 [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)。

2. 执行`git clone https://github.com/dufu1991/simple-cloud-music.git`克隆本仓库代码。

3. 设备安装好 node 环境之后，进入工程目录，执行 `node i` 安装依赖。

4. 修改 `src/utils/request.js` 文件里面的 baseURL 为你的网易云 API 地址，执行 `npm run dev` 启动本地联调，此时访问的是 public 下面的文件。

5. 执行 `npm run build` 编译打包文件至 html 目录下，然后将 html 文件夹里面的文件上传到你的 Web 服务器即可访问。

6. 如果要直接部署，执行 `npm run deploy` 根据命令行提示输入自己的服务器地址、账号、密码、静态文件部署路径等信息，将直接将打包好的工程部署至 Web 服务器。

7. 要实现 PWA 的 Service Workers（离线访问），必须要 HTTPS 证书，关于域名、证书、服务器等相关内容请自行了解。

## 📜 开源许可

本项目仅供个人学习研究使用，禁止用于商业及非法用途。

基于 [MIT license](https://opensource.org/licenses/MIT) 许可进行开源。

## 🌊 灵感来源与大感谢

非常感谢 API 源代码，来自 [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) 。

- [Apple Music](https://music.apple.com/)

- [Spotify](https://www.spotify.com/)

- [网易云音乐](https://music.163.com/)

- [YesPlayMusic](https://github.com/qier222/YesPlayMusic)

## 📷 部分截图

<p align="center">
<img src="https://simplecloudmusic.com/assets/screen1.jpg?v=1.0.0" alt="screen1" width="100%" style="max-width:500px">
<p>
<p align="center">
<img src="https://simplecloudmusic.com/assets/screen2.jpg?v=1.0.0" alt="screen2" width="100%" style="max-width:500px">
<p>
<p align="center">
<img src="https://simplecloudmusic.com/assets/screen3.jpg?v=1.0.0" alt="screen3" width="100%" style="max-width:500px">
<p>
<p align="center">
<img src="https://simplecloudmusic.com/assets/screen4.jpg?v=1.0.0" alt="Loscreen4go" width="100%" style="max-width:500px">
<p>

## 🎨 Design

<p align="center">
<img src="https://simplecloudmusic.com/assets/cover.jpg?v=1.0.0" alt="cover" width="100%" style="max-width:500px">
<p>

## 🪢 杂谈

- 因为 UI 界面图片区域较多，暂时不考虑暗黑模式（主要是暗黑模式对设计要求较高，做不好了啦）。
- 哦，如果想请我喝杯咖啡或是赞助一下服务器费用，也是可以的。
<p align="center">
<img src="https://simplecloudmusic.com/assets/lollipop.jpg?v=1.0.0" alt="lollipop" width="30%" style="max-width:30%">
<p>

## 🚑 反馈与建议

由于主要只在 Android 设备上测试，且只用了我个人的网易云音乐账号数据，避免不了不同设备不同版本不同数据产生的 bug，望积极反馈。

- 猿类请到 GitHub 提 [Issues](https://github.com/dufu1991/simple-cloud-music/issues) 。
- 非猿类可邮件至 <a href="mailto:simplecloudmusic@163.com?subject=简易云音乐反馈与建议">simplecloudmusic@163.com</a>
