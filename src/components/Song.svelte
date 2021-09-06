<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import Lazy from 'svelte-lazy';
  import { HeartFill } from 'svelte-remixicon';

  import { isLoginStore } from '../store/common';
  import { userLikeSongIdsStore } from '../store/user';
  import { currentSongStore, playStatusStore } from '../store/play';

  import { ripple, songerListToStr, Toast } from '../utils/common';

  const dispatch = createEventDispatcher();

  function setSongClick(index) {
    dispatch('songClick', { index });
  }

  export let song = {};
  export let index = 0;
  export let customCoverUrl = null;

  let songDom;

  onMount(() => {
    if (songDom) {
      ripple(songDom);
    }
  });
</script>

<div
  class="song"
  on:click={() => {
    if (song.id === $currentSongStore.id) {
      window.audioDOM.play();
      playStatusStore.set(true);
    } else {
      setSongClick(index);
    }
  }}
  bind:this={songDom}
>
  <div class="love-span">
    {#if $isLoginStore && $userLikeSongIdsStore.includes(song.id)}
      <HeartFill size="16" style="vertical-align: middle" />
    {/if}
  </div>
  <div class="song-cover">
    <Lazy height={46}>
      <img
        class="img-song"
        src={customCoverUrl ? customCoverUrl : song.al.picUrl.replace(/^http:/, 'https:') + '?param=100y100'}
        alt=""
      />
    </Lazy>
    {#if song.id === $currentSongStore.id && $playStatusStore}
      <div class="song-play">
        <div class="pull_down pull_down1" />
        <div class="pull_down pull_down2" />
        <div class="pull_down pull_down3" />
        <div class="pull_down pull_down4" />
      </div>
    {/if}
    {#if song.id === $currentSongStore.id && !$playStatusStore}
      <div class="song-no-play">
        <div class="no_pull_down" />
        <div class="no_pull_down" />
        <div class="no_pull_down" />
        <div class="no_pull_down" />
      </div>
    {/if}
  </div>
  <div class="song-info" style="max-width:{localStorage.getItem('fullWidth') - 72}px;">
    <div class="song-name">
      {song.name}
      <span class="alia">
        {song.alia && song.alia.length > 0 ? `(${song.alia[0]})` : ''}
      </span>
    </div>
    <div class="song-songer">
      {songerListToStr(song.ar)}
      <span>{song.al.name === '' ? '' : `- ${song.al.name}`}</span>
    </div>
  </div>
</div>

<style>
  .song {
    font-size: 14px;
    text-align: center;
    align-items: center;
    padding: 14px auto;
    display: flex;
    height: 60px;
    justify-content: space-between;
    border-bottom: 1px solid rgba(197, 197, 197, 0.3);
    box-sizing: border-box;
  }
  .love-span {
    color: var(--primary-text-color);
    line-height: 20px;
    text-align: center;
    width: 20px;
    height: 20px;
  }
  .song-cover {
    width: 46px;
    height: 46px;
    margin-right: 6px;
    border-radius: 4px;
    overflow: hidden;
    background-color: #fff;
    box-sizing: border-box;
  }
  .img-song {
    width: 100%;
    object-fit: cover;
  }
  .song-play {
    position: relative;
    width: 30px;
    height: 30px;
    top: -44px;
    left: 4px;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 4px;
  }
  .song-play {
    position: relative;
    width: 30px;
    height: 30px;
    top: -44px;
    left: 4px;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 4px;
  }
  .song-no-play {
    position: relative;
    width: 30px;
    height: 30px;
    top: -44px;
    left: 4px;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 4px;
  }
  .no_pull_down {
    flex: 1;
    height: 6px;
    margin: 0 1.2px;
    background: #fff;
    border-top: 1px solid var(--primary-text-color);
  }
  .pull_down {
    flex: 1;
    height: 30px;
    margin: 0 1.2px;
    background: #fff;
    border-top: 1px solid var(--primary-text-color);
  }
  .pull_down1 {
    -webkit-animation: jumpYa 0.8s infinite ease-in-out;
    -o-animation: jumpYa 0.8s infinite ease-in-out;
    animation: jumpYa 0.8s infinite ease-in-out;
  }
  .pull_down2 {
    -webkit-animation: jumpYb 1.2s infinite ease-in-out;
    -o-animation: jumpYb 1.2s infinite ease-in-out;
    animation: jumpYb 1.2s infinite ease-in-out;
  }
  .pull_down3 {
    -webkit-animation: jumpYc 1s infinite ease-in-out;
    -o-animation: jumpYc 1s infinite ease-in-out;
    animation: jumpYc 1s infinite ease-in-out;
  }
  .pull_down4 {
    -webkit-animation: jumpYd 1.1s infinite ease-in-out;
    -o-animation: jumpYd 1.1s infinite ease-in-out;
    animation: jumpYd 1.1s infinite ease-in-out;
  }
  @keyframes jumpYa {
    0% {
      height: 20px;
    }
    50% {
      height: 6px;
    }
    100% {
      height: 20px;
    }
  }
  @keyframes jumpYb {
    0% {
      height: 24px;
    }
    50% {
      height: 6px;
    }
    100% {
      height: 24px;
    }
  }
  @keyframes jumpYc {
    0% {
      height: 30px;
    }
    50% {
      height: 6px;
    }
    100% {
      height: 30px;
    }
  }
  @keyframes jumpYd {
    0% {
      height: 30px;
    }
    50% {
      height: 6px;
    }
    100% {
      height: 30px;
    }
  }
  .song-info {
    padding-top: 4px;
    text-align: left;
    flex: auto;
  }
  .song-name {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 18px;
  }
  .song-songer {
    margin-top: 6px;
    margin-bottom: 6px;
    color: rgb(185, 185, 185);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>
