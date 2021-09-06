<script>
  import { onMount, onDestroy } from 'svelte';
  import { onResume } from 'svelte-stack-router';
  import { PlayCircleLine, ShuffleLine, SearchLine, RefreshLine } from 'svelte-remixicon';

  import { Button, NavBar } from '../components/base';
  import SongList from '../components/SongList.svelte';

  import { isHomePageStore, isLoadingStore, defaultResumableStore } from '../store/common';
  import { userInfoStore, userLikeListIdStore } from '../store/user';
  import {
    currentSongStore,
    playStatusStore,
    currentPlayListStore,
    currentSongIndexStore,
    isFMPlayStore,
    playRepeatModelStore,
    currentSongQualityStore,
  } from '../store/play';

  import { getSongUrl, getSongDetail } from '../api/song';
  import { getPlaylistDetail } from '../api/playlist';

  import { Toast, cutArray, songerListToStr } from '../utils/common';

  let inputDom;
  $: keywords = '';
  $: isSearch = false;
  $: songList = [];
  $: searchSongList = []; //搜索过滤之后的歌曲列表
  $: isRefresh = false;

  let rightIcons = [
    {
      id: 'SearchLine',
      icon: SearchLine,
    },
  ];
  onResume(() => {
    if (!$defaultResumableStore) {
      songList = [];
      isSearch = false;
      searchSongList = [];
      keywords = '';
      isHomePageStore.set(false);
      getPlaylistDetailFun();
    }
  });
  onMount(() => {
    isHomePageStore.set(false);
    getPlaylistDetailFun();
  });
  onDestroy(() => {
    isHomePageStore.set(true);
  });
  function inputchange(e) {
    setTimeout(() => {
      //采用延时进行节流
      if (!e.target.isNeedPrevent && e.target.oldValue !== e.target.value) {
        //判断输入是否完成以及值是否变化
        e.target.oldValue = e.target.value;
        keywords = e.target.value;
        searchFun();
      }
    }, 100);
  }
  //搜索
  function searchFun() {
    if (keywords.trim() != '') {
      // inputDom.blur();
      searchSongList = songList.filter(
        item =>
          item.name.indexOf(keywords) > -1 ||
          songerListToStr(item.ar).indexOf(keywords) > -1 ||
          songerListToStr(item.alia, false).indexOf(keywords) > -1
      );
    }
  }
  //请求歌单详情
  async function getPlaylistDetailFun() {
    const res = await getPlaylistDetail($userLikeListIdStore); //获取歌单详情
    if (res.code === 200) {
      isLoadingStore.set(true);
      let songIdList = [];
      for (let i = 0; i < res.playlist.trackIds.length; i++) {
        songIdList.push(res.playlist.trackIds[i].id);
      }
      let cutSongIdList = cutArray(songIdList);
      for (let t = 0; t < cutSongIdList.length; t++) {
        await getSongDetailFun(cutSongIdList[t].join(','), t === cutSongIdList.length - 1);
      }
    }
  }
  //所有获取歌曲详情
  async function getSongDetailFun(songIds, last) {
    const res = await getSongDetail(songIds);
    if (res.code === 200) {
      songList = songList.concat(res.songs);
      if (last) {
        isRefresh = false;
      }
    }
  }
  //顺序播放
  function playListFun(index) {
    isFMPlayStore.set(false);
    localStorage.setItem('isFMPlay', '0');
    currentPlayListStore.set(songList);
    let ids = [];
    for (let r = 0; r < songList.length; r++) {
      ids.push(songList[r].id);
    }
    localStorage.setItem('localPlayList', JSON.stringify(ids));
    currentSongIndexStore.set(index);
    playRepeatModelStore.set('repeat');
    getSongUrlFun($currentPlayListStore[$currentSongIndexStore]);
  }
  //随机播放
  function playListShuffleFun() {
    isFMPlayStore.set(false);
    localStorage.setItem('isFMPlay', '0');
    currentPlayListStore.set(songList);
    let ids = [];
    for (let r = 0; r < songList.length; r++) {
      ids.push(songList[r].id);
    }
    localStorage.setItem('localPlayList', JSON.stringify(ids));
    let index = Math.floor(Math.random() * ($currentPlayListStore.length - 1));
    playRepeatModelStore.set('shuffle');
    currentSongIndexStore.set(index);
    getSongUrlFun($currentPlayListStore[$currentSongIndexStore]);
  }
  async function getSongUrlFun(song) {
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
        if ($currentSongIndexStore !== $currentPlayListStore.length - 1)
          getSongUrl($currentPlayListStore[$currentSongIndexStore + 1].id);
      } else {
        Toast(`😂 无法播放「${song.name}」！可能是版权原因......吧！请播放下一首。`, 2000);
      }
    }
  }
  function rightClickFun(e) {
    if (e.detail.id === 'SearchLine' && isSearch) {
      isSearch = false;
    } else if (e.detail.id === 'SearchLine' && !isSearch) {
      isSearch = true;
      setTimeout(() => {
        inputDom.focus();
        inputDom.addEventListener('compositionstart', function (e) {
          //非直接的文字输入时（键盘输入中文的拼音）
          e.target.isNeedPrevent = true;
        });
        inputDom.addEventListener('compositionend', function (e) {
          //直接输入文字后（键盘选择真实的汉字）
          e.target.isNeedPrevent = false;
        });
        inputDom.addEventListener('input', inputchange);
        inputDom.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            inputDom.blur();
            searchFun();
          }
        });
      }, 100);
    }
  }
</script>

<NavBar
  title={$userInfoStore.profile.nickname + '喜欢的歌曲'}
  {isRefresh}
  {rightIcons}
  on:setRightIconClick={rightClickFun}
/>
<div class="play-list">
  {#if isSearch}
    <div class="input-box">
      <form action="JavaScript:void 0">
        <input bind:this={inputDom} placeholder="请输入关键字" type="search" value={keywords} />
      </form>
      <button
        on:click={() => {
          inputDom.blur();
          searchFun();
        }}
        style="background-color: {keywords === '' ? 'rgb(224, 224, 224)' : 'var(--primary-text-color)'};
        color:{keywords === '' ? '#666' : '#fff'}"
      >
        搜索
      </button>
    </div>
  {/if}
  <div class="today-title">我喜欢的音乐</div>
  <div class="today-desc">
    共 {songList.length} 首
    {#if isSearch && keywords != ''}
      ，其中 <span>{searchSongList.length}</span> 首包含『{keywords}』
    {/if}
  </div>
  {#if isSearch && keywords != ''}
    <div />
  {:else}
    <div class="btn">
      <div class="play">
        <Button type="primary" on:BtnClick={() => playListFun(0)}>
          <span class="icon">
            <PlayCircleLine size="20" style="vertical-align: middle" />
          </span>
          顺序播放
        </Button>
      </div>
      <div class="play">
        <Button type="primary" on:BtnClick={playListShuffleFun}>
          <span class="icon">
            <ShuffleLine size="20" style="vertical-align: middle" />
          </span>
          随机播放
        </Button>
      </div>
    </div>
  {/if}
  <div>
    {#if isSearch && keywords != ''}
      <SongList songList={searchSongList} />
    {:else}
      <SongList {songList} />
    {/if}
  </div>
</div>

<style>
  .input-box {
    margin: 10px auto;
    font-size: 20px;
    display: flex;
    padding: 0 20px;
  }
  .input-box form {
    flex: auto;
  }
  .input-box form input {
    width: 100%;
    margin: 0;
    padding: 0 5px;
    border: none;
    height: 30px;
    box-sizing: border-box;
    line-height: 10px;
    border-radius: 4px;
    font-size: 14px;
    outline: none;
    -webkit-appearance: none;
  }
  .input-box input:focus {
    border: 1px solid var(--primary-text-color);
  }
  .input-box input:active {
    border: 1px solid var(--primary-text-color);
  }
  .input-box button {
    border: none;
    padding: 0 8px;
    border-radius: 4px;
    margin-left: 10px;
    width: 48px;
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    background-color: rgb(224, 224, 224);
  }
  .today-title {
    text-align: center;
    font-size: 46px;
    color: var(--primary-text-color);
    margin: 20px auto;
    font-weight: bold;
  }
  .today-desc {
    text-align: center;
    font-size: 12px;
    margin-bottom: 10px;
  }
  .icon {
    position: relative;
    top: -2px;
  }
  .btn {
    width: 100%;
    display: flex;
    margin-bottom: 10px;
  }
  .play {
    padding: 0px 20px 10px 20px;
    flex: 1;
  }
  .play-list {
    padding-top: 50px;
    padding-bottom: 70px;
  }
</style>
