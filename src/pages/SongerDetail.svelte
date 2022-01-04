<script>
  import { onMount, afterUpdate } from 'svelte';
  import Lazy from 'svelte-lazy';
  import { push, onResume } from 'svelte-stack-router';
  import { PlayCircleLine, ChatHeartFill, ChatHeartLine } from 'svelte-remixicon';

  import { NavBar, Title, Button } from '../components/base';
  import SongList from '../components/SongList.svelte';

  import { defaultResumableStore, isLoginStore, currentDetailSongerIdStore, coverImgUrlStore } from '../store/common';
  import {
    currentSongStore,
    playStatusStore,
    currentPlayListStore,
    currentSongIndexStore,
    isFMPlayStore,
    playRepeatModelStore,
    currentSongQualityStore,
  } from '../store/play';

  import { getSongerDetail, getSongerTop, followAArtist } from '../api/songer';
  import { getSongUrl } from '../api/song';

  $: coverImgUrl = '/images/defaultCover.png';
  $: name = '--';
  $: description = '暂无描述';
  $: mvSize = 0;
  $: musicSize = 0;
  $: albumSize = 0;
  $: hotSongs = [];
  $: collect = false;
  $: currentSongerId = 0; //当前歌手 ID，用于计算更新页面

  onResume(() => {
    if (!$defaultResumableStore) {
      allMount();
    }
  });
  onMount(() => {
    allMount();
  });
  afterUpdate(() => {
    if (currentSongerId !== $currentDetailSongerIdStore) {
      allMount();
    }
  });
  function allMount() {
    getSongerDetailFun();
    getSongerTopFun();
    if ($isLoginStore) {
      const ids = JSON.parse(localStorage.getItem('useLoveSongerIds'));
      collect = ids.includes($currentDetailSongerIdStore);
    } else {
      collect = false;
    }
  }
  async function getSongerDetailFun() {
    currentSongerId = $currentDetailSongerIdStore;
    const res = await getSongerDetail($currentDetailSongerIdStore);
    if (res.code === 200) {
      name = res.data.artist.name;
      coverImgUrl = res.data.user ? res.data.user.avatarUrl : res.data.artist.cover;
      description = res.data.artist.briefDesc;
      mvSize = res.data.artist.mvSize;
      musicSize = res.data.artist.musicSize;
      albumSize = res.data.artist.albumSize;
    }
  }
  async function getSongerTopFun() {
    const res = await getSongerTop($currentDetailSongerIdStore);
    if (res.code === 200) {
      hotSongs = res.songs;
    }
  }
  function toDescFun() {
    if (description != '') {
      push('/songerDesc?' + $currentDetailSongerIdStore);
    }
  }
  function playListFun(index) {
    playRepeatModelStore.set('repeat');
    isFMPlayStore.set(false);
    localStorage.setItem('isFMPlay', '0');
    currentPlayListStore.set(hotSongs);
    let ids = [];
    for (let r = 0; r < hotSongs.length; r++) {
      ids.push(hotSongs[r].id);
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
        document.getElementById('playgroundImg')&&document.getElementById('playgroundImg').style.animationPlayState = 'running';

        if ($currentSongIndexStore !== $currentPlayListStore.length - 1)
          getSongUrl($currentPlayListStore[$currentSongIndexStore + 1].id);
      } else {
        Toast(`😂 无法播放「${song.name}」！可能是版权原因......吧！请播放下一首。`, 2000);
      }
    }
  }
  async function loveSongerFun() {
    const res = await followAArtist({ id: $currentDetailSongerIdStore, t: collect ? 0 : 1 });
    if (res.code === 200) {
      const ids = JSON.parse(localStorage.getItem('useLoveSongerIds'));
      if (collect) {
        let i = ids.indexOf(Number($currentDetailSongerIdStore));
        ids.splice(i, 1);
      } else {
        ids.unshift(Number($currentDetailSongerIdStore));
      }
      localStorage.setItem('useLoveSongerIds', JSON.stringify(ids));
      collect = !collect;
    }
  }
</script>

<NavBar title={name} dark={true} />
<div class="page">
  <div class="cover-box">
    <div class="cover-bg">
      <div class="cover">
        <Lazy height={140}>
          <img class="img-cover" src={coverImgUrl.replace(/^http:/, 'https:') + '?param=400y400'} alt="" />
        </Lazy>
      </div>
      <div class="info">
        <div class="name">{name}</div>
        <div class="song-count">{musicSize} 首歌 • {albumSize} 张专辑 • {mvSize} 个 MV</div>
        <div class="desc" on:click={toDescFun}>{description}</div>
      </div>
    </div>
  </div>
  <div class="btn">
    <div class="play">
      <Button type="primary" on:BtnClick={() => playListFun(0)}>
        <span class="icon">
          <PlayCircleLine size="20" style="vertical-align: middle" />
        </span>
        播放全部
      </Button>
    </div>
    {#if $isLoginStore}
      <div class="random">
        <Button type={collect ? 'default' : 'primary'} on:BtnClick={loveSongerFun}>
          <span class="icon">
            {#if collect}
              <ChatHeartLine size="20" style="vertical-align: middle" />
            {:else}
              <ChatHeartFill size="20" style="vertical-align: middle" />
            {/if}
          </span>
          {collect ? '取消收藏' : '收藏歌手'}
        </Button>
      </div>
    {/if}
  </div>
  <div>
    <Title
      title={`热门 ${hotSongs.length} 首`}
      isShowRight={hotSongs.length === 50}
      on:TitleClick={() => {
        coverImgUrlStore.set(coverImgUrl.replace(/^http:/, 'https:'));
        push('/moreSong?name=' + name + '&id=' + currentSongerId);
      }}
    />
    <SongList songList={hotSongs} />
  </div>
</div>

<style>
  .icon {
    position: relative;
    top: -2px;
  }
  .btn {
    width: 100%;
    display: flex;
    margin-top: 10px;
  }
  .play {
    padding: 0px 10px 10px 20px;
    flex: 1;
  }
  .random {
    padding: 0px 20px 10px 20px;
    flex: 1;
  }
  .page {
    padding: 50px 0 70px;
    font-size: 16px;
  }
  .cover-box {
    padding: 0 20px;
  }
  .cover-bg {
    font-size: 12px;
    padding: 20px 0px;
    display: flex;
  }
  .cover {
    width: 150px;
    height: 150px;
    border-radius: 150px;
    overflow: hidden;
    flex: 0 0 150px;
    background-color: #fff;
  }
  .img-cover {
    border-radius: 6px;
    width: 150px;
    height: 150px;
    object-fit: cover;
  }
  .info {
    padding-top: 6px;
    margin-left: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .name {
    font-size: 24px;
    max-width: 192px;
    font-weight: bold;
  }
  .song-count {
    font-size: 12px;
  }
  .desc {
    padding: 10px 0;
    font-size: 12px;
    max-height: 57px;
    text-align: justify;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 5;
    color: rgb(116, 116, 116);
  }
</style>
