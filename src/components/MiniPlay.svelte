<script>
  import { onMount } from 'svelte';
  import Lazy from 'svelte-lazy';
  import { PlayFill, PauseFill, SkipForwardMiniFill } from 'svelte-remixicon';

  import {
    playIsMaxStore,
    playStatusStore,
    currentSongStore,
    currentPlayListStore,
    currentSongIndexStore,
    maxPlayToTopStore,
    isFMPlayStore,
    FMPlayNextStore,
    FMPlayStore,
    playRepeatModelStore,
    currentSongQualityStore,
  } from '../store/play';
  import { isHomePageStore } from '../store/common';

  import { getSongUrl, personalFM } from '../api/song';

  import { ripple, songerListToStr, Toast } from '../utils/common';

  export let currentTimeLong = window.audioDOM.currentTime / window.audioDOM.duration; //进度条长度

  let pauseDom;
  let nextDom;
  let touchStartX; //滑动开始时候触摸点Y坐标
  let touchEndX; //滑动结束时候触摸点Y坐标
  let touchStartTime = 0; //滑动开始时间戳
  let touchEndTime = 0; //滑动结束时间戳
  $: moveLong = 0; //移动距离

  onMount(() => {
    if (pauseDom) ripple(pauseDom);
    if (nextDom) ripple(nextDom);
  });

  function handleMax() {
    playIsMaxStore.set(true);
    maxPlayToTopStore.set('0px');
  }

  function miniPlayFun() {
    if ($playStatusStore) {
      window.audioDOM.pause();
      playStatusStore.set(false);
      localStorage.setItem('pauseTimes', new Date().getTime());
    } else {
      //解决长时间不播放URL失效问题(暂定30分钟过期)
      if ((new Date().getTime() - Number(localStorage.getItem('pauseTimes'))) / 1000 / 60 > 30) {
        window.audioDOM.src = `https://music.163.com/song/media/outer/url?id=${$currentSongStore.id}.mp3`;
      }
      window.audioDOM.play();
      playStatusStore.set(true);
    }
  }
  function miniNextFun() {
    if ($isFMPlayStore) {
      //正在私人FM
      getSongUrlFun($FMPlayNextStore, 'fm');
    } else {
      if ($currentSongIndexStore === $currentPlayListStore.length - 1) {
        Toast('已经是最后一首了');
      } else {
        //随机模式
        if ($playRepeatModelStore === 'shuffle') {
          let index = Math.floor(Math.random() * ($currentPlayListStore.length - 1));
          getSongUrlFun($currentPlayListStore[index], 'shuffle', index);
        } else {
          currentSongIndexStore.set($currentSongIndexStore + 1);
          getSongUrlFun($currentPlayListStore[$currentSongIndexStore], 'next');
        }
      }
    }
  }
  //获取歌曲URL
  async function getSongUrlFun(song, type, index) {
    const res = await getSongUrl(song.id);
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
          //私人FM
          personalFMFun();
          FMPlayStore.set(song);
          currentSongStore.set(song);
          currentPlayListStore.set([$FMPlayStore]);
          currentSongIndexStore.set(0);
          localStorage.setItem('currentSong', JSON.stringify(song));
        } else {
          if (type === 'shuffle') {
            //随机
            currentSongStore.set(song);
            localStorage.setItem('currentSong', JSON.stringify(song));
            currentSongIndexStore.set(index);
          } else {
            currentSongStore.set(song);
            localStorage.setItem('currentSong', JSON.stringify(song));
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
  //播放私人FM
  function playFMFun() {
    getSongUrlFun(FMSong);
    isFMPlayStore.set(true);
    localStorage.setItem('isFMPlay', '1');
    localStorage.setItem('FMPlay', JSON.stringify(FMSong));
    personalFMFun(true);
  }
  //滑动开始
  function touchStart(e) {
    touchStartTime = new Date().getTime();
    touchStartX = e.changedTouches[0].clientX;
  }
  //滑动结束
  function touchEnd(e) {
    moveLong = 0;
    touchEndTime = new Date().getTime();
    touchEndX = e.changedTouches[0].clientX;
    // 移动距离大于100，直接下一曲；
    // 移动距离不超过100的时候，考虑速度，速度超过0.5，直接下一曲；
    // 其他情况都是不触发
    if (touchStartX - touchEndX > 100) {
      miniNextFun();
    } else if (touchStartX - touchEndX <= 100 && (touchStartX - touchEndX) / (touchEndTime - touchStartTime) >= 0.5) {
      miniNextFun();
    } else {
    }
  }
  //滑动过程
  function touchMove(e) {
    //阻止滑动时穿透问题
    e.preventDefault();
    e.stopPropagation();
    if (e.changedTouches[0].clientX - touchStartX < 0) {
      moveLong = e.changedTouches[0].clientX - touchStartX;
    }
  }
</script>

<div
  class="play secondary"
  style="bottom: {$isHomePageStore ? 56 : 0}px"
  on:touchstart={touchStart}
  on:touchend={touchEnd}
  on:touchmove={touchMove}
>
  <div class="progress" style="width:{(currentTimeLong / 100) * window.screen.width}px;" on:click={handleMax} />
  <div class="cover" on:click={handleMax} style="left:{moveLong}px">
    <Lazy height={50}>
      <img src={$currentSongStore.al.picUrl.replace(/^http:/, 'https:') + '?param=800y800'} alt="" />
    </Lazy>
  </div>
  <div class="info" on:click={handleMax} style="left:{moveLong}px">
    <div class="name">
      {$currentSongStore.name}
      <span class="alia">
        {$currentSongStore.alia && $currentSongStore.alia.length > 0 ? `(${$currentSongStore.alia[0]})` : ''}
      </span>
    </div>
    <div class="songer">
      {songerListToStr($currentSongStore.ar)}
      <span>
        {$currentSongStore.al.name === '' ? '' : `- ${$currentSongStore.al.name}`}
      </span>
    </div>
  </div>
  <div class="pause" on:click={miniPlayFun} bind:this={pauseDom}>
    {#if $playStatusStore}
      <PauseFill size="40" style="vertical-align: middle;height:57px" />
    {:else}
      <PlayFill size="40" style="vertical-align: middle;height:57px" />
    {/if}
  </div>
  <div class="next" on:click={miniNextFun} bind:this={nextDom}>
    <SkipForwardMiniFill size="40" style="vertical-align: middle;height:57px" />
  </div>
</div>

<style>
  .alia {
    color: rgb(138, 138, 138);
    font-size: 14px;
    font-weight: normal;
  }
  .progress {
    z-index: 100;
    position: absolute;
    bottom: 0;
    width: 0%;
    height: 60px;
    background-image: linear-gradient(to right, rgba(197, 197, 197, 0.01), rgba(197, 197, 197, 0.3));
    transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
    -webkit-transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }
  .play {
    z-index: 10;
    width: 100%;
    height: 60px;
    position: fixed;
    bottom: 0px;
    display: flex;
    align-items: center;
    text-align: center;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    border-top: 1px solid rgba(197, 197, 197, 0.4);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background-color: rgba(255, 255, 255, 0.7);
    transition: all 0.4s ease-in-out;
    -webkit-transition: all 0.4s ease-in-out;
  }
  img {
    width: 50px;
    height: 50px;
    border: rgb(214, 214, 214) solid 1px;
    border-radius: 5px;
    object-fit: cover;
    overflow: hidden;
  }
  .cover {
    width: 50px;
    height: 50px;
    padding: 5px;
    overflow: hidden;
    position: relative;
    left: 0px;
    transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
    -webkit-transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .pause {
    flex: 1;
    line-height: 57px;
    z-index: 101;
    border-radius: 30px;
  }
  .next {
    z-index: 101;
    flex: 1;
    line-height: 57px;
    border-radius: 30px;
  }
  .info {
    flex: 3;
    text-align: left;
    font-size: 16px;
    position: relative;
    left: 0px;
    transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
    -webkit-transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .name {
    font-weight: bold;
    align-items: center;
    width: 186px;
    height: 36px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box; /*作为弹性伸缩盒子模型显示。*/
    -webkit-box-orient: vertical; /*设置伸缩盒子的子元素排列方式--从上到下垂直排列8*/
    -webkit-line-clamp: 2;
  }
  .songer {
    margin-top: 4px;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box; /*作为弹性伸缩盒子模型显示。*/
    -webkit-box-orient: vertical; /*设置伸缩盒子的子元素排列方式--从上到下垂直排列8*/
    -webkit-line-clamp: 1;
  }
</style>
