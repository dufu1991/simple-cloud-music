<script>
  import { onMount } from 'svelte';
  import { PlayCircleLine } from 'svelte-remixicon';
  import { onResume } from 'svelte-stack-router';

  import { Button, NavBar } from '../components/base';
  import SongList from '../components/SongList.svelte';

  import { getSongUrl, getSongDetail } from '../api/song';

  import { playListDetailStore, todayListStore } from '../store/playList';
  import {
    currentSongStore,
    playStatusStore,
    currentPlayListStore,
    currentSongIndexStore,
    isFMPlayStore,
    playRepeatModelStore,
    currentSongQualityStore,
  } from '../store/play';
  import { defaultResumableStore } from '../store/common';

  import { Toast } from '../utils/common';

  $: songList = [];

  onResume(() => {
    if (!$defaultResumableStore) {
      let songIdList = [];
      for (let i = 0; i < $todayListStore.length; i++) {
        songIdList.push($todayListStore[i].id);
      }
      getSongDetailFun(songIdList.join(','));
      getSongUrl(songIdList[0]);
    }
  });
  onMount(() => {
    let songIdList = [];
    for (let i = 0; i < $todayListStore.length; i++) {
      songIdList.push($todayListStore[i].id);
    }
    getSongDetailFun(songIdList.join(','));
    getSongUrl(songIdList[0]);
  });
  async function getSongDetailFun(songIds) {
    const res = await getSongDetail(songIds); //所有获取歌曲详情
    if (res.code === 200) {
      playListDetailStore.set(res.songs);
      songList = res.songs;
    }
  }
  function playListFun(index) {
    playRepeatModelStore.set('repeat');
    isFMPlayStore.set(false);
    localStorage.setItem('isFMPlay', '0');
    currentPlayListStore.set(songList);
    let ids = [];
    for (let r = 0; r < songList.length; r++) {
      ids.push(songList[r].id);
    }
    localStorage.setItem('localPlayList', JSON.stringify(ids));
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
        if (document.getElementById('playgroundImg'))document.getElementById('playgroundImg').style.animationPlayState = 'running';

        if ($currentSongIndexStore !== $currentPlayListStore.length - 1)
          getSongUrl($currentPlayListStore[$currentSongIndexStore + 1].id);
      } else {
        Toast(`😂 无法播放「${song.name}」！可能是版权原因......吧！请播放下一首。`, 2000);
      }
    }
  }
</script>

<NavBar title="今日推荐歌曲" />
<div class="play-list">
  <div class="today-title">今日推荐歌曲</div>
  <div class="today-desc">
    根据你的音乐口味生成 {songList.length} 首 · 每天6:00更新
  </div>
  <div class="btn">
    <div class="play">
      <Button type="primary" on:BtnClick={() => playListFun(0)}>
        <span class="icon">
          <PlayCircleLine size="22" style="vertical-align: middle" />
        </span>
        播放全部
      </Button>
    </div>
  </div>
  <div>
    <SongList {songList} />
  </div>
</div>

<style>
  .icon {
    position: relative;
    top: -2px;
  }
  .today-title {
    text-align: center;
    font-size: 46px;
    color: var(--primary-text-color);
    margin: 40px auto;
    font-weight: bold;
  }
  .today-desc {
    text-align: center;
    font-size: 12px;
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
