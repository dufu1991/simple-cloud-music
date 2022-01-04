<script>
  import { onMount } from 'svelte';
  import { onResume, search } from 'svelte-stack-router';

  import { NavBar, Pagination } from '../components/base';
  import Song from '../components/Song.svelte';

  import { defaultResumableStore, coverImgUrlStore } from '../store/common';
  import {
    currentSongStore,
    playStatusStore,
    currentPlayListStore,
    currentSongIndexStore,
    isFMPlayStore,
    currentSongQualityStore,
  } from '../store/play';

  import { getAllSongs } from '../api/songer';
  import { getSongUrl } from '../api/song';

  import { getRequest, Toast } from '../utils/common';

  $: songList = [];
  $: hasMore = true;
  $: offset = 0;
  $: paginationHeight = 0;
  let limit = 20;
  $: searchObj = {};
  let typeList = [
    { index: 0, type: 'hot', text: '最热' },
    { index: 1, type: 'time', text: '最近' },
  ];
  $: active = 0;
  $: order = typeList[0].type;

  onResume(() => {
    if (!$defaultResumableStore) {
      songList = [];
      hasMore = true;
      offset = 0;
      active = 0;
      order = 'hot';
      searchObj = getRequest($search);
      paginationHeight = document.documentElement.clientHeight || document.body.clientHeight - 120;
      getAllSongsFun(0, order);
    }
  });

  onMount(() => {
    searchObj = getRequest($search);
    paginationHeight = document.documentElement.clientHeight || document.body.clientHeight - 120;
    getAllSongsFun(0, order);
  });
  //热门歌手
  async function getAllSongsFun(offset, order) {
    const res = await getAllSongs(searchObj.id, order, limit, offset);
    if (res.code === 200) {
      songList = songList.concat(res.songs);
      hasMore = res.more;
    }
  }
  function playListFun(index) {
    isFMPlayStore.set(false);
    localStorage.setItem('isFMPlay', '0');
    let newcurrentPlayList = $currentPlayListStore;
    let newPlayListIds = [];
    for (let r = 0; r < newcurrentPlayList.length; r++) {
      newPlayListIds.push(newcurrentPlayList[r].id);
    }
    if (newPlayListIds.includes(songList[index].id)) {
      currentSongIndexStore.set(newPlayListIds.indexOf(songList[index].id));
      getSongUrlFun($currentPlayListStore[$currentSongIndexStore]);
    } else {
      newcurrentPlayList.splice($currentSongIndexStore + 1, 0, songList[index]);
      currentPlayListStore.set(newcurrentPlayList);
      let ids = [];
      for (let r = 0; r < newcurrentPlayList.length; r++) {
        ids.push(newcurrentPlayList[r].id);
      }
      localStorage.setItem('localPlayList', JSON.stringify(ids));
      currentSongIndexStore.set($currentSongIndexStore + 1);
      getSongUrlFun($currentPlayListStore[$currentSongIndexStore]);
    }
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
        song.al.picUrl = $coverImgUrlStore;
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
  function getSongClick(event) {
    playListFun(event.detail.index);
  }
</script>

<NavBar title={`${searchObj.name}的全部歌曲`} />

<div class="comment-page">
  <div class="type">
    {#each typeList as t}
      <div
        class="type-item"
        class:active={active === t.index}
        on:click={() => {
          active = t.index;
          order = t.type;
          songList = [];
          hasMore = true;
          offset = 0;
          getAllSongsFun(offset, order);
        }}
      >
        {t.text}
      </div>
    {/each}
  </div>
  <div class="active-line" style="left: {20 + ((localStorage.getItem('fullWidth') - 40) / 2) * active}px;" />
  <div style="margin-top:40px">
    <Pagination
      bottomHeight={70}
      {paginationHeight}
      items={songList}
      let:item
      let:index
      {hasMore}
      on:load={() => {
        if (hasMore) {
          offset = songList.length;
          getAllSongsFun(offset, order);
        }
      }}
    >
      <Song song={item} {index} customCoverUrl={$coverImgUrlStore + '?param=100y100'} on:songClick={getSongClick} />
    </Pagination>
  </div>
</div>

<style>
  .comment-page {
    padding: 50px 0;
    font-size: 16px;
    color: #333333;
  }
  .type {
    background-color: #fff;
    position: fixed;
    top: 50px;
    width: 100%;
    display: flex;
    z-index: 50;
  }
  .type-item {
    font-weight: bold;
    padding: 10px 0 8px;
    text-align: center;
    flex: 1;
  }
  .active {
    color: var(--primary-text-color);
  }
  .active-line {
    position: fixed;
    top: 86px;
    margin-bottom: 10px;
    height: 2px;
    width: 167.5px;
    background-color: var(--primary-text-color);
    left: 0px;
    transition: all 0.3s cubic-bezier(0.18, 0.89, 0.26, 1.19);
    -webkit-transition: all 0.3s cubic-bezier(0.18, 0.89, 0.26, 1.19);
  }
</style>
