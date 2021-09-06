<script>
  import { onMount } from 'svelte';
  import { StackRouter, slide } from 'svelte-stack-router';
  import isStandalone from 'is-standalone';

  import Play from './components/Play.svelte';
  import MiniPlay from './components/MiniPlay.svelte';
  import Loading from './components/Loading.svelte';
  import { TabBar } from './components/base';

  import { getSongUrl, personalFM, getSongDetail } from './api/song';
  import { userPlaylist, userLikedSongsIDs, likedArtists } from './api/user';

  import routes from './routes';

  import {
    isLoadingStore,
    isHomePageStore,
    restoreScrollStore,
    defaultResumableStore,
    isLoginStore,
  } from './store/common';
  import {
    currentSongStore,
    currentPlayListStore,
    currentSongIndexStore,
    playIsMaxStore,
    playIsMinStore,
    playStatusStore,
    maxPlayToTopStore,
    isFMPlayStore,
    FMPlayStore,
    FMPlayNextStore,
    currentTimeStore,
    mainCoverTypeStore,
    playRepeatModelStore,
    currentSongQualityStore,
  } from './store/play';
  import { userInfoStore, userLikeSongIdsStore } from './store/user';

  import { timeToMinute, Toast, Alert, getUserAgentInfo, getOsInfo } from './utils/common';

  let audioDOM;
  let audioDOMIsRander = false;
  let endTime = 0;
  let currentTime = '0:00';
  let currentTimeLong = 0;

  window.addEventListener('hashchange', function (event) {
    if (event.newURL.indexOf('#') < 0 || event.newURL.split('#')[1] === '' || event.newURL.split('#')[1] === '/') {
      isHomePageStore.set(true);
    } else {
      isHomePageStore.set(false);
    }
    if (event.oldURL.indexOf('#') > 0 && event.oldURL.split('#')[1] === '/login') {
      location.reload();
    }
  });

  // history.pushState(null, null, location.href);
  window.addEventListener('popstate', function (event) {
    if ($playIsMaxStore) {
      playIsMaxStore.set(false);
      mainCoverTypeStore.set('cover');
      maxPlayToTopStore.set(window.screen.height + 'px');
    }
  });

  // pushHistory();

  // window.addEventListener(
  //   "popstate",
  //   function (e) {
  //     console.log(11, e);
  //     // $(".onback").show();
  //   },
  //   false
  // );

  // function pushHistory() {
  //   var state = {
  //     title: "title",
  //     url: "#",
  //   };
  //   window.history.pushState(state, "title", "#");
  // }

  onMount(() => {
    console.log(123, location.hostname, isStandalone, getUserAgentInfo(), getOsInfo());
    // Alert("app mount");
    // Alert(getOsInfo().os)
    // Alert(getUserAgentInfo().browser)
    // return
    if (getOsInfo().os === 'iPhone' && getUserAgentInfo().browser != 'safari' && !isStandalone) {
      Alert('建议 iPhone 在 Safari 的 PWA 模式下使用，可到【关于】页面查看详细说明。');
    }
    if (getOsInfo().os === 'Android') {
      if (!isStandalone) {
        Alert('建议 PWA 模式下使用，可到【关于】页面查看详细说明。');
      } else {
        if (getUserAgentInfo().browser != 'chrome' && getUserAgentInfo().browser != 'edge') {
          Alert('建议 Android 设备使用 Chrome 或 Edge 浏览器食用。');
        } else {
          if (getUserAgentInfo().browser === 'chrome' && getUserAgentInfo().version < 90) {
            Alert('建议 Android 设备在较新版本的 Chrome 食用。');
          }
          if (getUserAgentInfo().browser === 'edge' && getUserAgentInfo().version < 90) {
            Alert('建议 Android 设备在较新版本的 Edge 食用。');
          }
        }
      }
    }
    if (getOsInfo().os != 'Android' && getOsInfo().os != 'iPhone') {
      Alert('建议使用 iPhone 或 Android 设备访问。');
    }

    // return
    if ($isLoginStore) {
      userPlaylistFun($userInfoStore);
      likedArtistsFun();
    }
    // 开启页面重新请求播放列表数据
    if (localStorage.getItem('localPlayList')) {
      let localPlayList = JSON.parse(localStorage.getItem('localPlayList'));
      if (localPlayList.length > 300) {
        localPlayList = localPlayList.slice(0, 300);
      }
      getLocalPlayListFun(localPlayList.join(','));
    }
    if (location.href.indexOf('#') < 0 || location.href.split('#')[1] === '' || location.href.split('#')[1] === '/') {
      isHomePageStore.set(true);
    } else {
      isHomePageStore.set(false);
    }
    window.audioDOM = audioDOM;
    window.audioDOM.addEventListener('canplaythrough', function () {
      // 音频可以播放了
      audioDOMIsRander = true;
      endTime = '-' + timeToMinute(window.audioDOM.duration - window.audioDOM.currentTime);
    });
    window.audioDOM.addEventListener('timeupdate', function () {
      currentTimeStore.set(window.audioDOM.currentTime);
      // 更新与播放进度相关的内容
      currentTime = timeToMinute(window.audioDOM.currentTime);
      currentTimeLong = (window.audioDOM.currentTime / window.audioDOM.duration) * 100;
      endTime = '-' + timeToMinute(window.audioDOM.duration - window.audioDOM.currentTime);
    });
    window.audioDOM.addEventListener(
      'ended',
      function () {
        if ($isFMPlayStore) {
          //私人FM播放
          mainCoverTypeStore.set('cover');
          getSongUrlFun($FMPlayNextStore, 'fm');
        } else {
          if ($playRepeatModelStore != 'repeatOnce' && $currentSongIndexStore === $currentPlayListStore.length - 1) {
            Toast('已经是最后一首了', 2000);
          } else {
            if ($playRepeatModelStore === 'shuffle') {
              //随机
              let index = Math.floor(Math.random() * ($currentPlayListStore.length - 1));
              if ($mainCoverTypeStore === 'lyric') mainCoverTypeStore.set('cover');
              getSongUrlFun($currentPlayListStore[index], 'shuffle', index);
            } else if ($playRepeatModelStore === 'repeatOnce') {
              //单曲循环
              if ($mainCoverTypeStore === 'lyric') mainCoverTypeStore.set('cover');
              getSongUrlFun($currentPlayListStore[$currentSongIndexStore], 'once', $currentSongIndexStore);
            } else {
              if ($mainCoverTypeStore === 'lyric') mainCoverTypeStore.set('cover');
              getSongUrlFun($currentPlayListStore[$currentSongIndexStore + 1]);
            }
          }
        }
      },
      false
    );
    //解决长时间不播放URL失效问题(暂定30分钟过期)
    if ((new Date().getTime() - Number(localStorage.getItem('pauseTimes'))) / 1000 / 60 > 30) {
      window.audioDOM.src = `https://music.163.com/song/media/outer/url?id=${$currentSongStore.id}.mp3`;
    } else {
      window.audioDOM.src = $currentSongStore.url;
    }
    // window.audioDOM.src = "https://m8.music.126.net/20210907010112/541ee038536db12045e4a99d565becd8/ymusic/5614/195d/ad51/33fff191fffc2fd5da6c94d71e7777ef.mp3";
    window.audioDOM.load(); //解决iOS canplaythrough不生效问题
  });
  //获取所有歌曲详情
  async function getLocalPlayListFun(songIds) {
    const res = await getSongDetail(songIds);
    if (res.code === 200) {
      let songs = res.songs;
      if (!songIds.split(',').includes($currentSongStore.id.toString())) {
        songs.unshift($currentSongStore);
        currentSongIndexStore.set(0);
      } else {
        currentSongIndexStore.set(songIds.split(',').indexOf($currentSongStore.id.toString()));
      }
      currentPlayListStore.set(songs);
      let ids = [];
      for (let r = 0; r < songs.length; r++) {
        ids.push(songs[r].id);
      }
      localStorage.setItem('localPlayList', JSON.stringify(ids));
    }
  }
  //获取收藏的歌手
  async function likedArtistsFun() {
    const res = await likedArtists({ limit: 2000 });
    if (res.code === 200) {
      let ids = [];
      for (let i = 0; i < res.data.length; i++) {
        ids.push(res.data[i].id);
      }
      localStorage.setItem('useLoveSongerIds', JSON.stringify(ids));
    } else {
      alert('获取喜爱歌手失败');
    }
  }
  async function getSongUrlFun(song, type, index) {
    const res = await getSongUrl(song.id); //获取歌曲url
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
        window.audioDOM.src = song.url;
        window.audioDOM.play();
        playStatusStore.set(true);
        if ($isFMPlayStore) {
          //私人FM播放
          personalFMFun();
          FMPlayStore.set(song);
          currentSongStore.set(song);
          currentPlayListStore.set([$FMPlayStore]);
          currentSongIndexStore.set(0);
          localStorage.setItem('currentSong', JSON.stringify(song));
        } else {
          if (type === 'shuffle') {
            currentSongStore.set(song);
            localStorage.setItem('currentSong', JSON.stringify(song));
            currentSongIndexStore.set(index);
          } else if (type === 'once') {
            currentSongStore.set(song);
            localStorage.setItem('currentSong', JSON.stringify(song));
            currentSongIndexStore.set(index);
            if ($currentSongIndexStore !== $currentPlayListStore.length - 1) {
              getSongUrl($currentPlayListStore[$currentSongIndexStore + 1].id);
            }
          } else {
            currentSongStore.set(song);
            localStorage.setItem('currentSong', JSON.stringify(song));
            currentSongIndexStore.set($currentSongIndexStore + 1);
            if ($currentSongIndexStore !== $currentPlayListStore.length - 1) {
              getSongUrl($currentPlayListStore[$currentSongIndexStore + 1].id);
            }
          }
        }
      } else {
        Toast(`😂 无法播放「${song.name}」！可能是版权原因......吧！请播放下一首。`, 2000);
      }
    }
  }
  //私人FM
  async function personalFMFun() {
    const res = await personalFM();
    if (res.code === 200) {
      res.data[0].al = res.data[0].album;
      res.data[0].ar = res.data[0].artists;
      res.data[0].alia = res.data[0].alias;
      FMPlayNextStore.set(res.data[0]);
    }
  }
  async function userPlaylistFun(login) {
    //获取用户收藏歌单ID列表,用于判断是否已经收藏
    const res = await userPlaylist({
      uid: login.account.id,
      limit: 10000,
      offset: 0,
    });
    if (res.code === 200) {
      let ids = [];
      for (let i = 0; i < res.playlist.length; i++) {
        ids.push(res.playlist[i].id);
      }
      localStorage.setItem('usePlayListIds', JSON.stringify(ids));
      userLikedSongsIDsFun(login);
    } else {
      Alert('获取收藏歌单失败');
    }
  }
  async function userLikedSongsIDsFun(login) {
    //获取用户喜爱歌曲ID列表,用于判断是否已经收藏
    const res = await userLikedSongsIDs(login.account.id);
    if (res.code === 200) {
      let ids = [];
      for (let i = 0; i < res.ids.length; i++) {
        ids.push(res.ids[i]);
      }
      userLikeSongIdsStore.set(JSON.stringify(ids));
      localStorage.setItem('useLoveSongIds', JSON.stringify(ids));
    } else {
      alert('获取喜爱歌曲失败');
    }
  }
</script>

<audio bind:this={audioDOM} src="" />

<StackRouter
  {routes}
  restoreScroll={$restoreScrollStore}
  transitionFn={slide(300)}
  on:navigation-start={e => {
    // 0--前进，2--后退,1--替换
    if (e.detail.navigationType === 0) {
      defaultResumableStore.set(false);
    } else if (e.detail.navigationType === 2) {
      defaultResumableStore.set(true);
    } else {
      defaultResumableStore.set(false);
    }
  }}
/>

{#if $playIsMinStore && audioDOMIsRander}
  <MiniPlay {currentTimeLong} />
{/if}
<Play {endTime} {currentTime} {currentTimeLong} />
<TabBar />
{#if $isLoadingStore}
  <Loading />
{/if}

<style>
</style>
