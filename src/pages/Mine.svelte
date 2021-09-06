<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-stack-router';
  import { RefreshLine, ArrowRightSLine, PlayFill, HeartPulseFill } from 'svelte-remixicon';

  import { Button, Title } from '../components/base';
  import TopTitle from '../components/TopTitle.svelte';
  import ListGrid from '../components/ListGrid.svelte';
  import Songer from '../components/Singer.svelte';

  import { getSongDetail, getSongUrl } from '../api/song';
  import { userPlaylist, likedArtists } from '../api/user';
  import { getPlaylistDetail, intelligenceList } from '../api/playlist';

  import {
    currentSongStore,
    playStatusStore,
    currentSongIndexStore,
    currentPlayListStore,
    isFMPlayStore,
    playRepeatModelStore,
    currentSongQualityStore,
  } from '../store/play';
  import { isLoginStore, isHomePageStore } from '../store/common';
  import { userLikeSongIdsStore, userInfoStore, userLikeListIdStore } from '../store/user';

  import { Toast, Alert, ripple } from '../utils/common';

  let loveSongDom;
  let infoDom;
  $: randomList = [];
  $: collectList = [];
  $: createList = [];
  $: randomFontSize = [];
  $: randomTop = [];
  $: randomleft = [];
  $: randomIds = [];
  $: randomAll = [];
  $: isRequsetSucc = false;
  $: isRefresh = false;
  $: collectSongers = []; //收藏的歌手
  let topTitleRightList = {
    type: 'icon',
    path: RefreshLine,
  };
  let newuserLikeSongIdsStore =
    typeof $userLikeSongIdsStore === 'string' ? JSON.parse($userLikeSongIdsStore) : $userLikeSongIdsStore;
  onMount(() => {
    if (loveSongDom) {
      ripple(loveSongDom);
    }
    if (infoDom) {
      ripple(infoDom);
    }
    allOnMount();
  });
  //初始化页面事件
  function allOnMount() {
    if ($isLoginStore) {
      randomFontSize = getRandom(10, 30, 10);
      randomTop = getRandom(0, 200, 10);
      randomleft = getRandom(-50, 300, 10);
      randomIds = getRandom(0, JSON.parse(localStorage.getItem('useLoveSongIds')).length, 10);
      let ids = [];
      for (let i = 0; i < randomIds.length; i++) {
        ids.push(JSON.parse(localStorage.getItem('useLoveSongIds'))[randomIds[i]]);
      }
      getSongDetailFun(ids.join(','));
      userPlaylistFun();
      likedArtistsFun();
    }
  }
  //获取收藏的歌手
  async function likedArtistsFun() {
    const res = await likedArtists({ limit: 6 });
    if (res.code === 200) {
      collectSongers = res.data;
    }
  }
  // 全部歌手
  function collectSongersFun() {
    isHomePageStore.set(false);
    push('/allCollectSongers');
  }
  //获取用户收藏歌单ID列表
  async function userPlaylistFun(login) {
    const res = await userPlaylist({ uid: $userInfoStore.account.id });
    if (res.code === 200) {
      isRefresh = false;
      let createListL = [];
      let collectListL = [];
      //去除喜欢的音乐
      if (
        res.playlist[0].creator.userId === $userInfoStore.account.id &&
        res.playlist[0].name.substr(-5) === '喜欢的音乐'
      ) {
        userLikeListIdStore.set(res.playlist[0].id);
        localStorage.setItem('userLikeListId', res.playlist[0].id);
        res.playlist.splice(0, 1);
      }
      for (let i = 0; i < res.playlist.length; i++) {
        if (res.playlist[i].creator.userId === $userInfoStore.account.id) {
          createListL.push(res.playlist[i]);
        } else {
          collectListL.push(res.playlist[i]);
        }
      }
      //创建的
      createList = createListL.length >= 10 ? createListL.slice(0, 10) : createListL;
      //收藏的
      collectList = collectListL.length >= 10 ? collectListL.slice(0, 10) : collectListL;
    } else {
      Toast('获取收藏歌单失败');
    }
  }
  //获取指定数量、指定范围内随机数
  function getRandom(n, m, sum) {
    let arr = [];
    for (let i = 0; i < sum; i++) {
      arr.push(Math.floor(Math.random() * (m - n + 1) + n));
    }
    return arr;
  }
  //所有获取歌曲详情
  async function getSongDetailFun(songIds) {
    isRequsetSucc = false;
    if (songIds.slice(0, 1) === ',') {
      songIds = songIds.substr(1);
    }
    songIds = songIds.replace(',,', ',');
    const res = await getSongDetail(songIds, true);
    if (res.code === 200) {
      randomList = res.songs;
      randomAll = [];
      for (let u = 0; u < randomList.length; u++) {
        randomAll.push({
          name: randomList[u].name,
          size: randomFontSize[u],
          top: randomTop[u],
          left: randomleft[u],
          img: randomList[u].al.picUrl,
          id: randomList[u].id,
        });
      }
      isRequsetSucc = true;
    }
  }
  //刷新
  function topClickFun(event) {
    if (event.detail.index === 0) {
      allOnMount();
    }
  }
  //去喜欢歌曲页面
  function goToLoveListFun() {
    isHomePageStore.set(false);
    push('/loveListDetail');
  }
  //创建歌单全部
  function createTitleFun() {
    isHomePageStore.set(false);
    push('/myAllPlayList?create');
  }
  //收藏歌单全部
  function collectTitleFun() {
    isHomePageStore.set(false);
    push('/myAllPlayList?collect');
  }
  //去设置页面
  function toSettingFun() {
    isHomePageStore.set(false);
    push('/setting');
  }
  //快速播放
  function quickPlayFun(e) {
    e.preventDefault();
    e.stopPropagation();
    getPlaylistDetailFun();
  }
  //心动模式
  async function heartPlayFun(e) {
    e.preventDefault();
    e.stopPropagation();
    //从喜欢的歌曲id中随机出一首开启心动模式
    const randomLikeSongId = newuserLikeSongIdsStore[Math.floor(Math.random() * newuserLikeSongIdsStore.length)];
    const res = await intelligenceList({ id: randomLikeSongId, pid: $userLikeListIdStore });
    if (res.code === 200) {
      getSongUrl(randomLikeSongId);
      let songsInfoList = [];
      for (let r = 0; r < res.data.length; r++) {
        songsInfoList.push(res.data[r].songInfo);
      }
      getFirstDetail(randomLikeSongId, songsInfoList);
    }
  }
  async function getFirstDetail(randomLikeSongId, data) {
    const res = await getSongDetail(randomLikeSongId, true);
    if (res.code === 200) {
      let songs = [res.songs[0], ...data];
      currentPlayListStore.set(songs);
      let ids = [];
      for (let r = 0; r < songs.length; r++) {
        ids.push(songs[r].id);
      }
      localStorage.setItem('localPlayList', JSON.stringify(ids));
      playListFun(true);
    }
  }
  //请求歌单详情
  async function getPlaylistDetailFun() {
    const res = await getPlaylistDetail($userLikeListIdStore); //获取歌单详情
    if (res.code === 200) {
      let songIdList = [];
      for (let i = 0; i < res.playlist.trackIds.length; i++) {
        songIdList.push(res.playlist.trackIds[i].id);
      }
      if (songIdList.length > 400) {
        Toast('歌曲较多，拼命加载中，请稍等！', 2000);
      }
      getQuickSongDetailFun(songIdList.join(','));
      getSongUrl(songIdList[0]);
    }
  }
  //获取所有歌曲详情
  async function getQuickSongDetailFun(songIds) {
    const res = await getSongDetail(songIds);
    if (res.code === 200) {
      currentPlayListStore.set(res.songs);
      playListFun(false);
    }
  }
  //播放列表
  function playListFun(isHeart) {
    isFMPlayStore.set(false);
    localStorage.setItem('isFMPlay', '0');
    currentSongIndexStore.set(0);
    getSongUrlFun($currentPlayListStore[$currentSongIndexStore], isHeart);
  }
  async function getSongUrlFun(song, isHeart) {
    const res = await getSongUrl(song.id); //获取歌单url
    if (res.code === 200) {
      if (res.data[0].url) {
        song.url = res.data[0].url.replace(/^http:/, 'https:');
        if (res.data[0].fee === 1 && res.data[0].freeTrialInfo != null) {
          currentSongQualityStore.set('试听');
        } else if (res.data[0].type === 'flac') {
          currentSongQualityStore.set('FLAC');
        } else {
          currentSongQualityStore.set(res.data[0].br);
        }
        currentSongStore.set(song);
        localStorage.setItem('currentSong', JSON.stringify(song));
        window.audioDOM.src = song.url;
        window.audioDOM.play();
        playStatusStore.set(true);
        isHeart ? playRepeatModelStore.set('heart') : playRepeatModelStore.set('repeat');
        if ($currentSongIndexStore !== $currentPlayListStore.length - 1)
          getSongUrl($currentPlayListStore[$currentSongIndexStore + 1].id);
      } else {
        Alert(
          isHeart
            ? `😂 心动模式随机的第一首「${song.name}」无法播放！可能是版权原因......吧！请重新开启心动模式。`
            : `😂 真不巧，您喜欢歌单的第一首--「${song.name}」就无法播放！可能是版权原因......吧！请进入音乐列表选择后面的歌曲播放。`
        );
      }
    }
  }
</script>

<TopTitle
  title="我的"
  desc="曲库与设置"
  {isRefresh}
  topTitleRightList={$isLoginStore ? topTitleRightList : null}
  on:IconClick={topClickFun}
/>
<div class="mine">
  {#if $isLoginStore}
    <div class="login">
      <div class="info-box" on:click={toSettingFun} bind:this={infoDom}>
        <div class="left">
          <div class="avatar">
            <img src={$userInfoStore.profile.avatarUrl.replace(/^http:/, 'https:') + '?param=180y180'} alt="" />
          </div>
          <div class="info">
            <div class="nicename">{$userInfoStore.profile.nickname}</div>
            <div class="signature">{$userInfoStore.profile.signature || ''}</div>
            <div class="tag">
              {#if $userInfoStore.account.vipType !== 0}
                <span class="vip">
                  <img class="cvip" src="/images/vip/vip.png" alt="" />
                  <span class="vip-text">黑胶VIP</span>
                </span>
              {:else}
                <span v-else class="text">
                  {$userInfoStore.profile.signature}
                </span>
              {/if}
            </div>
          </div>
        </div>
        <div class="more">
          <ArrowRightSLine size="26" style="vertical-align: middle" />
        </div>
      </div>
      <div
        class="love-song-box"
        style="background-image: url({$userInfoStore.profile.avatarUrl.replace(/^http:/, 'https:') +
          '?param=180y180'});"
      >
        <div class="love-song" on:click={goToLoveListFun} bind:this={loveSongDom}>
          <div class="love-title">
            <div class="love-title-text">
              我喜欢的音乐<span class="love-title-number">{newuserLikeSongIdsStore.length}首</span>
            </div>
          </div>
          <div class="random">
            {#if isRequsetSucc}
              {#each randomAll as item, i}
                <div
                  class="random-item"
                  style="height:{item.size}px;line-height:{item.size}px;top: {i *
                    26}px;left: {item.left}px;font-size:{item.size}px;"
                >
                  <img
                    class="random-img"
                    style="width:{item.size}px;height:{item.size}px;top:{item.size / 8}px"
                    src={item.img.replace(/^http:/, 'https:') + '?param=100y100'}
                    alt=""
                  />
                  {item.name}
                </div>
              {/each}
            {:else}
              <span style="line-height: 100px;position: relative;left: 50%;margin-left: -50px;top:40px">
                <embed width="100" height="100" src="/images/Ripple.svg" type="image/svg+xml" />
              </span>
            {/if}
          </div>
          <div class="quick-btn">
            <div class="quick-btn-item" on:click={quickPlayFun}>
              <PlayFill size="24" style="vertical-align: middle" />
            </div>
            <div class="quick-btn-item" on:click={heartPlayFun}>
              <span class:heart-beat={$playRepeatModelStore === 'heart' && $playStatusStore}>
                <HeartPulseFill size="24" style="vertical-align: middle" />
              </span>
            </div>
          </div>
        </div>
      </div>
      {#if collectList.length > 0}
        <div class="list-grid">
          <ListGrid title="收藏的歌单" playList={collectList} iconText="全部" on:titleClick={collectTitleFun} />
        </div>
      {/if}
      {#if createList.length > 0}
        <div class="list-grid">
          <ListGrid title="创建的歌单" playList={createList} iconText="全部" on:titleClick={createTitleFun} />
        </div>
      {/if}
      {#if collectSongers.length > 0}
        <Title title="收藏的歌手" iconText="全部" isShowRight={true} on:TitleClick={collectSongersFun} />
        <div class="songer-box">
          {#each collectSongers as songer}
            <Songer {songer} coverSize={330} />
          {/each}
        </div>
      {/if}
    </div>
  {:else}
    <div class="noLogin">
      <div>
        <img class="login-img" src="/images/login.png" alt="" />
      </div>
      <div class="tip">账号信息需要登录</div>
      <div class="login-btn">
        <Button
          type="primary"
          on:BtnClick={() => {
            isHomePageStore.set(false);
            push('/login');
          }}
        >
          立即登录
        </Button>
      </div>
      <div style="margin-top: 40px;">
        <Button
          on:BtnClick={() => {
            isHomePageStore.set(false);
            push('/about');
          }}
        >
          关于
        </Button>
      </div>
    </div>
  {/if}
</div>

<style>
  .songer-box {
    display: grid;
    justify-content: space-between;
    grid-template-columns: repeat(3, 100px);
    padding: 0 20px;
  }
  .list-grid {
    margin-top: 30px;
  }
  .quick-btn {
    z-index: 5;
    display: flex;
    justify-content: space-between;
  }
  .quick-btn-item {
    width: 50px;
    height: 50px;
    margin: 10px;
    border-radius: 25px;
    background-color: rgba(255, 255, 255, 0.5);
    color: var(--primary-text-color);
    text-align: center;
    line-height: 50px;
  }
  .nicename {
    font-weight: bold;
    font-size: 16px;
  }
  .signature {
    font-size: 12px;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    max-width: 200px;
  }
  .more {
    line-height: 62px;
  }
  .cvip {
    width: 24px;
    height: 12px;
  }
  .vip-text {
    position: relative;
    top: -2px;
    font-size: 12px;
  }
  .mine {
    font-size: 14px;
    padding-bottom: 120px;
  }
  .info-box {
    padding: 10px;
    display: flex;
    margin: auto 20px;
    justify-content: space-between;
    background-color: #fff;
    border-radius: 10px;
  }
  .left {
    display: flex;
  }
  .avatar {
    width: 60px;
    height: 60px;
    margin-right: 10px;
    border-radius: 50%;
    overflow: hidden;
    border: rgb(214, 214, 214) solid 1px;
  }
  .avatar img {
    width: 100%;
  }
  .info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .love-song-box {
    border-radius: 10px;
    object-fit: cover;
    background-position: center;
    margin: 20px;
    height: 335px;
    overflow: hidden;
    background-size: 100%;
  }
  .love-song {
    height: 335px;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    background-color: rgba(0, 0, 0, 0.2);
  }
  .random {
    flex: 8;
    width: 100%;
    object-fit: cover;
    color: #fff;
    position: relative;
    font-size: 16px;
  }
  .random-item {
    position: absolute;
    left: 100px;
    white-space: nowrap;
    animation: move 60s infinite;
    -webkit-animation: move 60s infinite;
  }
  @keyframes move {
    0% {
      transform: translateX(-50%);
    }
    50% {
      transform: translateX(50%);
    }
    100% {
      transform: translateX(-50%);
    }
  }
  .random-img {
    border-radius: 10%;
    position: relative;
  }
  .love-title {
    flex: 2;
    font-size: 36px;
    text-align: center;
    color: #fff;
  }
  .love-title-text {
    font-weight: bold;
    line-height: 67px;
  }
  .love-title-number {
    font-size: 16px;
    margin-left: 6px;
    line-height: 67px;
  }
  .noLogin {
    width: 80%;
    margin: auto;
  }
  .login-img {
    width: 80%;
  }
  .tip {
    margin: 20px 0;
    font-size: 18px;
    text-align: center;
  }
  .heart-beat {
    display: inline-block;
    /* // 一个完整动画的持续时间 */
    animation-duration: 1s;
    /* // 动画循环次数：无限循环 */
    animation-iteration-count: infinite;
    /* // 调用的动画名，对应上面的 .heart-bounce */
    animation-name: heart-bounce;
  }
  @keyframes heart-bounce {
    from {
      transform: scale(1);
    }
    12% {
      transform: scale(1.02);
    }
    20% {
      transform: scale(0.99);
    }
    28% {
      transform: scale(0.98);
    }
    32% {
      transform: scale(1.2);
    }
    38% {
      transform: scale(0.96);
    }
    50% {
      transform: scale(1);
    }
    58% {
      transform: scale(0.98);
    }
    70% {
      transform: scale(0.9);
    }
    80% {
      transform: scale(0.98);
    }
    to {
      transform: scale(1);
    }
  }
</style>
