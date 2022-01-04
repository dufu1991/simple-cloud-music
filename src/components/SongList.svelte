<script>
  import {
    currentSongStore,
    playStatusStore,
    currentPlayListStore,
    currentSongIndexStore,
    isFMPlayStore,
    playRepeatModelStore,
    currentSongQualityStore,
  } from '../store/play';

  import Song from './Song.svelte';

  import { getSongUrl } from '../api/song';

  import { Toast } from '../utils/common';

  export let songList = [];
  export let isPlayList = false; //是否播放列表，false表示播放单曲

  function playListFun(index) {
    if (isPlayList) {
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
    } else {
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
  function getSongClick(event) {
    playListFun(event.detail.index);
  }
</script>

<div>
  {#each songList as song, i}
    <Song {song} index={i} on:songClick={getSongClick} />
  {/each}
</div>
