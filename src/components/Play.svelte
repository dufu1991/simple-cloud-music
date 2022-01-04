<script>
  import { onMount } from 'svelte';
  import { push, location } from 'svelte-stack-router';
  import {
    SkipBackFill,
    SkipForwardFill,
    PlayFill,
    PauseFill,
    ChatQuoteLine,
    ChatQuoteFill,
    Message2Line,
    RadioLine,
    Heart2Line,
    Heart2Fill,
    DislikeLine,
    RepeatOneLine,
    ShuffleLine,
    PlayListLine,
    PlayListFill,
    SortDesc,
    HeartPulseLine,
  } from 'svelte-remixicon';
  import Wave from '@foobar404/wave';

  import { Picker, Progress } from '../components/base';
  import Lyric from '../components/Lyric.svelte';
  import SongList from '../components/SongList.svelte';

  import { getSongUrl, personalFM, likeThisSong, getLyric, fmTrash } from '../api/song';

  import {
    playStatusStore,
    currentSongStore,
    currentPlayListStore,
    currentSongIndexStore,
    maxPlayToTopStore,
    playIsMaxStore,
    isFMPlayStore,
    FMPlayNextStore,
    FMPlayStore,
    currentLyricStore,
    mainCoverTypeStore,
    playRepeatModelStore,
    currentSongQualityStore,
  } from '../store/play';
  import { isLoginStore, isHomePageStore, currentDetailSongerIdStore, isShowCommentStore } from '../store/common';
  import { userLikeSongIdsStore } from '../store/user';
  import { showVisualizerStore } from '../store/play';

  import { timeToMinute, songerListToStr, Toast, ripple } from '../utils/common';

  export let currentTime = '0:00'; //当前播放时间
  export let currentTimeLong = 0; //进度条长度
  export let endTime = 0; //结束时间

  let lyricDom;
  let listDom;
  let loveDom;
  let disloveDom;
  let repeatDom;
  let commentDom;
  let preDom;
  let playDom;
  let nextDom;
  let coverDom;

  let playBgDom;
  let touchMoveToTop = 0; //播放器顶部距离整个视窗顶部的距离
  let touchStartY; //滑动开始时候触摸点Y坐标
  let touchEndY; //滑动结束时候触摸点Y坐标
  let touchStartTime = 0; //滑动开始时间戳
  let touchEndTime = 0; //滑动结束时间戳
  let playListDom;

  $: isLikeCurrentSong = $isLoginStore ? $userLikeSongIdsStore.includes($currentSongStore.id) : false; //是否喜欢当前歌曲
  $: likeLoading = false; //优化点击红心请求时候loading效果
  $: noLikeLoading = false; //优化FM点击不喜欢红心请求时候loading效果
  $: lyricLoading = false; //优化点击歌词请求时候loading效果
  $: PickerShow = false;
  $: songers = $currentSongStore.ar;

  onMount(() => {
    maxPlayToTopStore.set(window.screen.height + 'px');
    playIsMaxStore.set(false);
    mainCoverTypeStore.set('cover');
    let wave = new Wave();
    wave.fromElement('audioDom', 'playgroundCanvas', { type: 'shine', colors: ['white', 'red', 'blue'] });
    if (lyricDom) ripple(lyricDom);
    if (listDom) ripple(listDom);
    if (loveDom) ripple(loveDom);
    if (disloveDom) ripple(disloveDom);
    if (repeatDom) ripple(repeatDom);
    if (commentDom) ripple(commentDom);
    if (preDom) ripple(preDom);
    if (playDom) ripple(playDom);
    if (nextDom) ripple(nextDom);
    if (coverDom) ripple(coverDom);
  });
  //接收子组件（Progress）发送来的事件（setCurrent），获取当前进度点的值（event.detail.current）。
  function getCurrent(event) {
    window.audioDOM.currentTime = (event.detail.current / 100) * window.audioDOM.duration;
    currentTime = timeToMinute(window.audioDOM.currentTime);
    currentTimeLong = (window.audioDOM.currentTime / window.audioDOM.duration) * 100;
    endTime = '-' + timeToMinute(window.audioDOM.duration - window.audioDOM.currentTime);
    window.audioDOM.play();
    playStatusStore.set(true);
    if (document.getElementById('playgroundImg'))
      document.getElementById('playgroundImg').style.animationPlayState = 'running';
  }
  //接收子组件（Progress）发送来的事件（setTimeCurrent），获取当前进度时间点的值（event.detail.timeCurrent ）。
  function getTimeCurrent(event) {
    window.audioDOM.currentTime = (event.detail.timeCurrent / 100) * window.audioDOM.duration;
    currentTime = timeToMinute(window.audioDOM.currentTime);
    currentTimeLong = (window.audioDOM.currentTime / window.audioDOM.duration) * 100;
    endTime = '-' + timeToMinute(window.audioDOM.duration - window.audioDOM.currentTime);
  }
  function handleDown() {
    maxPlayToTopStore.set(window.screen.height + 'px');
    playIsMaxStore.set(false);
    mainCoverTypeStore.set('cover');
  }
  //切换下一首
  function playNextFun() {
    if ($isFMPlayStore) {
      //正在私人FM
      getSongUrlFun($FMPlayNextStore, 'next');
      mainCoverTypeStore.set('cover');
    } else {
      if ($currentSongIndexStore === $currentPlayListStore.length - 1) {
        Toast('已经是最后一首了');
      } else {
        if ($mainCoverTypeStore === 'lyric') mainCoverTypeStore.set('cover');
        //随机模式
        if ($playRepeatModelStore === 'shuffle') {
          // Math.floor(Math.random() * 21);
          let index = Math.floor(Math.random() * ($currentPlayListStore.length - 1));
          getSongUrlFun($currentPlayListStore[index], 'shuffle', index);
        } else {
          currentSongIndexStore.set($currentSongIndexStore + 1);
          getSongUrlFun($currentPlayListStore[$currentSongIndexStore], 'next');
        }
      }
    }
  }
  //切换上一首
  function playPreFun() {
    if ($currentSongIndexStore === 0) {
      Toast('已经是第一首了');
    } else {
      if ($mainCoverTypeStore === 'lyric') mainCoverTypeStore.set('cover');
      getSongUrlFun($currentPlayListStore[$currentSongIndexStore - 1], 'pre');
    }
  }
  //获取歌单url
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
        currentSongStore.set(song);
        localStorage.setItem('currentSong', JSON.stringify(song));
        window.audioDOM.src = song.url;
        window.audioDOM.play();
        playStatusStore.set(true);
        if (document.getElementById('playgroundImg'))
          document.getElementById('playgroundImg').style.animationPlayState = 'running';

        if ($isFMPlayStore) {
          //私人FM
          personalFMFun();
          FMPlayStore.set(song);
          currentSongStore.set(song);
          currentPlayListStore.set([$FMPlayStore]);
          currentSongIndexStore.set(0);
          localStorage.setItem('currentSong', JSON.stringify(song));
        } else {
          //切换下一首和上一首之后，修改播放歌曲在播放列表中的位置
          if (type === 'next') {
            if ($currentSongIndexStore !== $currentPlayListStore.length - 1) {
              getSongUrl($currentPlayListStore[$currentSongIndexStore + 1].id);
            }
          } else if (type === 'shuffle') {
            //随机
            if ($currentSongIndexStore !== $currentPlayListStore.length - 1) {
              currentSongIndexStore.set(index);
            }
          } else {
            //上一首
            currentSongIndexStore.set($currentSongIndexStore - 1);
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
      getSongUrl(res.data[0].id);
    }
  }
  //点击红心
  async function handleLoveFun() {
    if ($isLoginStore) {
      likeLoading = true;
      const res = await likeThisSong({
        id: $currentSongStore.id,
        like: !isLikeCurrentSong,
      });
      if (res.code === 200) {
        const ids = JSON.parse(localStorage.getItem('useLoveSongIds'));
        if (isLikeCurrentSong) {
          let i = ids.indexOf($currentSongStore.id);
          ids.splice(i, 1);
        } else {
          ids.unshift($currentSongStore.id);
        }
        likeLoading = false;
        userLikeSongIdsStore.set(JSON.stringify(ids));
        localStorage.setItem('useLoveSongIds', JSON.stringify(ids));
      } else {
        likeLoading = false;
      }
    } else {
      Toast('当前未登录');
    }
  }
  //FM 不喜欢
  async function handleFMNoLoveFun() {
    noLikeLoading = true;
    const res = await fmTrash($currentSongStore.id);
    if (res.code === 200) {
      noLikeLoading = false;
      playNextFun();
    }
  }
  //切换歌词显示
  function changeLyricFun() {
    if ($mainCoverTypeStore !== 'lyric') {
      getlyricFun();
    } else {
      mainCoverTypeStore.set('cover');
      let wave = new Wave();
      wave.fromElement('audioDom', 'playgroundCanvas', { type: 'shine', colors: ['white', 'red', 'blue'] });
    }
  }
  //请求歌词
  async function getlyricFun() {
    if ($currentLyricStore.songId === $currentSongStore.id) {
      mainCoverTypeStore.set('lyric');
    } else {
      lyricLoading = true;
      const res = await getLyric($currentSongStore.id);
      if (res.code === 200) {
        lyricLoading = false;
        if (res.nolyric || res.needDesc || res.lrc.lyric === '') {
          Toast('🙈🙈么有歌词哦!!🙈🙈');
          currentLyricStore.set({
            songId: null,
            lyric: null,
            tlyric: null,
          });
          localStorage.setItem(
            'currentLyric',
            JSON.stringify({
              songId: null,
              lyric: null,
              tlyric: null,
            })
          );
        } else {
          currentLyricStore.set({
            songId: $currentSongStore.id,
            lyric: res.lrc.lyric,
            tlyric: res.tlyric.lyric,
          });
          localStorage.setItem(
            'currentLyric',
            JSON.stringify({
              songId: $currentSongStore.id,
              lyric: res.lrc.lyric,
              tlyric: res.tlyric.lyric,
            })
          );
          mainCoverTypeStore.set('lyric');
        }
      } else {
        lyricLoading = false;
      }
    }
  }
  //切换播放列表显示
  function changeListFun() {
    if ($mainCoverTypeStore !== 'list') {
      if ($currentSongIndexStore > 200) {
        let r = confirm(
          '当前播放歌曲在播放列表中位置超过 200，显示播放列表将自动滚动至当前歌曲，极短时间内渲染大量页面会严重消耗设备性能😈😈。可以考虑到歌单详情页（已做了懒加载）查看列表哦😅。🤔确定显示播放列表吗🤔？'
        );
        if (r === true) {
          if ($currentPlayListStore.length > 200) {
            Toast('列表太长，等我加载...🥱🥱', 1000, () => {
              mainCoverTypeStore.set('list');
              setTimeout(() => {
                playListDom.scrollTop = 60 * $currentSongIndexStore;
              }, 100); //做延迟处理，渲染页面之后才能获取DOM高度，计算滚动高度
            });
          } else {
            mainCoverTypeStore.set('list');
            setTimeout(() => {
              playListDom.scrollTop = 60 * $currentSongIndexStore;
            }, 100); //做延迟处理，渲染页面之后才能获取DOM高度，计算滚动高度
          }
        }
      } else {
        if ($currentPlayListStore.length > 200) {
          Toast('列表太长，等我加载...🥱🥱', 1000, () => {
            mainCoverTypeStore.set('list');
            setTimeout(() => {
              playListDom.scrollTop = 60 * $currentSongIndexStore;
            }, 100); //做延迟处理，渲染页面之后才能获取DOM高度，计算滚动高度
          });
        } else {
          mainCoverTypeStore.set('list');
          setTimeout(() => {
            playListDom.scrollTop = 60 * $currentSongIndexStore;
          }, 100); //做延迟处理，渲染页面之后才能获取DOM高度，计算滚动高度
        }
      }
    } else {
      mainCoverTypeStore.set('cover');
      let wave = new Wave();
      wave.fromElement('audioDom', 'playgroundCanvas', { type: 'shine', colors: ['white', 'red', 'blue'] });
    }
  }
  // 切换播放循环模式
  function changeRrpeatFun(e) {
    if ($playRepeatModelStore === 'heart') {
      Toast('心动模式无需切换');
    } else {
      if ($playRepeatModelStore === 'repeat') {
        playRepeatModelStore.set('shuffle');
      } else if ($playRepeatModelStore === 'shuffle') {
        playRepeatModelStore.set('repeatOnce');
      } else {
        playRepeatModelStore.set('repeat');
      }
    }
  }
  //歌词区域点击
  function lyricClickFun() {
    mainCoverTypeStore.set('cover');
    let wave = new Wave();
    wave.fromElement('audioDom', 'playgroundCanvas', { type: 'shine', colors: ['white', 'red', 'blue'] });
  }
  //去歌曲评论页面
  function toCommentFun() {
    mainCoverTypeStore.set('cover');
    maxPlayToTopStore.set(window.screen.height + 'px');
    playIsMaxStore.set(false);
    if (!($location === '/musicComment')) {
      if ($isHomePageStore) isHomePageStore.set(false);
      push('/musicComment');
    }
  }
  //滑动开始
  function touchStart(e) {
    touchStartTime = new Date().getTime();
    touchStartY = e.changedTouches[0].clientY;
    touchMoveToTop = 0;
    maxPlayToTopStore.set(touchMoveToTop + 'px');
  }
  //滑动结束
  function touchEnd(e) {
    touchEndTime = new Date().getTime();
    touchEndY = e.changedTouches[0].clientY;
    // 移动距离小于100不触发任何行为
    // 移动结束时，播放器顶部距整个视窗顶部的距离大于屏幕高度一半的时候，可以不用考虑滑动速度，直接最小化播放器
    // 移动距离超过100，播放器顶部距整个视窗顶部的距离还不到一半的时候，考虑速度，速度超过0.8，直接最小化；
    // 速度小于0.3，不判断为最小化；0.3-0.8之间，如果移动距离超过250，最小化，不到250则不触发最小化。
    if (touchMoveToTop >= window.screen.height / 2) {
      //最小化
      maxPlayToTopStore.set(window.screen.height + 'px');
      playIsMaxStore.set(false);
      mainCoverTypeStore.set('cover');
    } else if (touchEndY - touchStartY <= 100) {
      maxPlayToTopStore.set('0px');
    } else if (touchEndY - touchStartY > 100 && (touchEndY - touchStartY) / (touchEndTime - touchStartTime) >= 0.8) {
      maxPlayToTopStore.set(window.screen.height + 'px');
      playIsMaxStore.set(false);
      mainCoverTypeStore.set('cover');
    } else if (touchEndY - touchStartY > 100 && (touchEndY - touchStartY) / (touchEndTime - touchStartTime) <= 0.3) {
      maxPlayToTopStore.set('0px');
    } else if (
      0.3 < (touchEndY - touchStartY) / (touchEndTime - touchStartTime) < 0.8 &&
      touchEndY - touchStartY > 250
    ) {
      maxPlayToTopStore.set(window.screen.height + 'px');
      playIsMaxStore.set(false);
      mainCoverTypeStore.set('cover');
    } else {
      maxPlayToTopStore.set('0px');
    }
  }
  //滑动过程
  function touchMove(e) {
    //阻止滑动时穿透问题
    e.preventDefault();
    e.stopPropagation();
    if (parseFloat(playBgDom.style['top']) >= 0) {
      touchMoveToTop = e.changedTouches[0].clientY - touchStartY;
      maxPlayToTopStore.set(touchMoveToTop + 'px');
    }
  }
</script>

<div
  bind:this={playBgDom}
  class="play-bg"
  style="background: url({$currentSongStore.al.picUrl.replace(/^http:/, 'https:') +
    '?param=800y800'});top:{$maxPlayToTopStore}"
>
  <div class="play">
    <div class="top-box">
      <div
        class="down"
        on:click={handleDown}
        on:touchstart={touchStart}
        on:touchend={touchEnd}
        on:touchmove={touchMove}
      >
        <div class="down-line" />
      </div>
      {#if $mainCoverTypeStore === 'cover'}
        <div
          class="cover"
          on:click={handleDown}
          on:touchstart={touchStart}
          on:touchend={touchEnd}
          on:touchmove={touchMove}
          bind:this={coverDom}
        >
          <!-- {#if $showVisualizerStore === '1'} -->
          <div style="position: relative; display:{$showVisualizerStore === '1' ? 'block' : 'none'}">
            <canvas id="playgroundCanvas" height="560" width="560" style="transform: scale(0.5);" />
            <img
              style="width:130px;height:130px;border-radius: 50%;position: absolute;top:215px;left:215px"
              src={$currentSongStore.al.picUrl.replace(/^http:/, 'https:') + '?param=800y800'}
              alt=""
              id="playgroundImg"
              class="cover-img cover-img-rotate"
            />
          </div>
          <!-- {:else} -->
          <div style="position: relative; display:{$showVisualizerStore === '1' ? 'none' : 'block'}">
            <img
              style="width:{$playStatusStore ? '280px' : '240px'};height:{$playStatusStore ? '280px' : '240px'};"
              src={$currentSongStore.al.picUrl.replace(/^http:/, 'https:') + '?param=800y800'}
              alt=""
              class="cover-img"
            />
          </div>
          <!-- {/if} -->
        </div>
      {:else if $mainCoverTypeStore === 'lyric'}
        <div class="lyric-cover" on:click={lyricClickFun}>
          <Lyric maxHeight="54vh" />
        </div>
      {:else if !$isFMPlayStore && $mainCoverTypeStore === 'list'}
        <div class="song-list-box" bind:this={playListDom}>
          <SongList songList={$currentPlayListStore} />
        </div>
      {/if}
    </div>
    <div class="control-box">
      <div class="info">
        <div class="song">
          <div class="name">
            {$currentSongStore.name}
            <span class="alia">
              {$currentSongStore.alia && $currentSongStore.alia.length > 0 ? `(${$currentSongStore.alia[0]})` : ''}
            </span>
          </div>
          <div
            class="songer"
            on:click={() => {
              if (songers.length === 1) {
                if (songers[0].id != 0) {
                  mainCoverTypeStore.set('cover');
                  maxPlayToTopStore.set(window.screen.height + 'px');
                  playIsMaxStore.set(false);
                  isHomePageStore.set(false);
                  currentDetailSongerIdStore.set(songers[0].id);
                  push('/songerDetail');
                }
              } else {
                PickerShow = true;
              }
            }}
          >
            {songerListToStr($currentSongStore.ar)}
            <span>
              {$currentSongStore.al.name === '' ? '' : `- ${$currentSongStore.al.name}`}
            </span>
          </div>
        </div>
        <div class="progress">
          <div class="line">
            <Progress on:setCurrent={getCurrent} on:setTimeCurrent={getTimeCurrent} current={currentTimeLong} />
          </div>
          <!-- 时间显示 -->
          <div class="time">
            <div class="time-item start">{currentTime}</div>
            <div
              class="time-item quality"
              on:click={() => {
                mainCoverTypeStore.set('cover');
                maxPlayToTopStore.set(window.screen.height + 'px');
                playIsMaxStore.set(false);
                if (!($location === '/brSelect')) {
                  if ($isHomePageStore) isHomePageStore.set(false);
                  push('/brSelect');
                }
              }}
            >
              <span class="quality-span">
                {$currentSongQualityStore === 'FLAC' || $currentSongQualityStore === '试听'
                  ? $currentSongQualityStore
                  : $currentSongQualityStore.toString().substring(0, $currentSongQualityStore.toString().length - 3) +
                    'K'}
              </span>
            </div>
            <div class="time-item end">{endTime}</div>
          </div>
        </div>
      </div>
      <div class="tool">
        <!-- 歌词 -->
        <div class="tool-item lyric" on:click={changeLyricFun} bind:this={lyricDom}>
          {#if lyricLoading}
            <span style="line-height: 30px;">
              <embed width="24" height="24" src="/images/Ripple.svg" type="image/svg+xml" />
            </span>
          {:else if $mainCoverTypeStore === 'lyric'}
            <ChatQuoteFill size="20" style="vertical-align: middle" />
          {:else}
            <ChatQuoteLine size="20" style="vertical-align: middle" />
          {/if}
        </div>
        {#if !$isFMPlayStore}
          <!-- 播放列表 -->
          <div class="tool-item list" on:click={changeListFun} bind:this={listDom}>
            {#if $mainCoverTypeStore === 'list'}
              <PlayListFill size="20" style="vertical-align: middle" />
            {:else}
              <PlayListLine size="20" style="vertical-align: middle" />
            {/if}
          </div>
        {/if}
        {#if $isFMPlayStore && $isLoginStore}
          <!-- FM 不喜欢 -->
          <div class="tool-item list" on:click={handleFMNoLoveFun} bind:this={disloveDom}>
            {#if noLikeLoading}
              <span style="line-height: 30px;">
                <embed width="24" height="24" src="/images/Ripple.svg" type="image/svg+xml" />
              </span>
            {:else}
              <DislikeLine size="20" style="vertical-align: middle" />
            {/if}
          </div>
        {/if}
        {#if $isLoginStore}
          <!-- 喜欢 -->
          <div class="tool-item love" on:click={handleLoveFun} bind:this={loveDom}>
            {#if likeLoading}
              <span style="line-height: 30px;">
                <embed width="24" height="24" src="/images/Ripple.svg" type="image/svg+xml" />
              </span>
            {:else}
              <span style="color:{isLikeCurrentSong ? 'var(--primary-text-color)' : '#fff'}">
                {#if isLikeCurrentSong}
                  <Heart2Fill size="20" style="vertical-align: middle" />
                {:else}
                  <Heart2Line size="20" style="vertical-align: middle" />
                {/if}
              </span>
            {/if}
          </div>
        {/if}
        {#if !$isFMPlayStore}
          <!-- 播放模式 -->
          <div class="tool-item mode" on:click={e => changeRrpeatFun(e)} bind:this={repeatDom}>
            {#if $playRepeatModelStore === 'repeat'}
              <SortDesc size="20" style="vertical-align: middle" />
            {:else if $playRepeatModelStore === 'repeatOnce'}
              <RepeatOneLine size="20" style="vertical-align: middle" />
            {:else if $playRepeatModelStore === 'heart'}
              <span class:heart-beat={$playStatusStore}>
                <HeartPulseLine size="20" style="vertical-align: middle" />
              </span>
            {:else}
              <ShuffleLine size="20" style="vertical-align: middle" />
            {/if}
          </div>
        {/if}
        <!-- 评论 -->
        {#if $isShowCommentStore != '0'}
          <div class="tool-item comment" on:click={toCommentFun} bind:this={commentDom}>
            <Message2Line size="20" style="vertical-align: middle" />
          </div>
        {/if}
      </div>
      <div class="control">
        <div
          class="con-item pre"
          on:click={() => {
            if (!$isFMPlayStore) playPreFun();
          }}
          bind:this={preDom}
        >
          {#if $isFMPlayStore}
            <RadioLine size="24px" style="vertical-align: middle;;height:80px" />
          {:else}
            <SkipBackFill size="40px" style="vertical-align: middle;height:80px" />
          {/if}
        </div>
        <div
          class="con-item pause"
          bind:this={playDom}
          on:click={() => {
            if ($playStatusStore) {
              window.audioDOM.pause();
              playStatusStore.set(false);
              if (document.getElementById('playgroundImg'))
                document.getElementById('playgroundImg').style.animationPlayState = 'paused';
              localStorage.setItem('pauseTimes', new Date().getTime());
            } else {
              //解决长时间不播放URL失效问题(暂定30分钟过期)
              if ((new Date().getTime() - Number(localStorage.getItem('pauseTimes'))) / 1000 / 60 > 30) {
                window.audioDOM.src = `https://music.163.com/song/media/outer/url?id=${$currentSongStore.id}.mp3`;
              }
              window.audioDOM.play();
              playStatusStore.set(true);
              if (document.getElementById('playgroundImg'))
                document.getElementById('playgroundImg').style.animationPlayState = 'running';
            }
          }}
        >
          {#if $playStatusStore}
            <PauseFill size="80px" style="vertical-align: middle;height:80px" />
          {:else}
            <PlayFill size="80px" style="vertical-align: middle;height:80px" />
          {/if}
        </div>
        <div class="con-item next" on:click={playNextFun} bind:this={nextDom}>
          <SkipForwardFill size="40px" style="vertical-align: middle;height:80px" />
        </div>
      </div>
    </div>
  </div>
</div>
{#if $playIsMaxStore && 0 < parseFloat($maxPlayToTopStore) < window.screen.height - 40}
  <div
    class="play-mask"
    style="background-color: rgba(0, 0, 0, {0.9 - parseFloat($maxPlayToTopStore) / window.screen.height});"
  />
{/if}

<Picker
  isShow={PickerShow}
  title="请选择歌手"
  on:ChangeShow={e => {
    PickerShow = e.detail.isShow;
  }}
  on:PickerClick={e => {
    if (e.detail.item.id != 0) {
      mainCoverTypeStore.set('cover');
      maxPlayToTopStore.set(window.screen.height + 'px');
      playIsMaxStore.set(false);
      isHomePageStore.set(false);
      currentDetailSongerIdStore.set(e.detail.item.id);
      push('/songerDetail');
    }
  }}
  list={songers}
/>

<style>
  .alia {
    color: rgb(255, 255, 255, 0.7);
    font-size: 14px;
    font-weight: normal;
  }
  .down {
    text-align: center;
    height: 6vh;
    display: flex;
  }
  .down-line {
    margin: auto;
    width: 40px;
    height: 6px;
    border-radius: 3px;
    margin: auto;
    background: rgba(255, 255, 255, 0.8);
  }
  .line {
    padding: 10px 20px;
  }
  .time {
    font-size: 10px;
    columns: 2;
    padding: 0 18px;
    color: rgba(255, 255, 255, 0.6);
    display: flex;
  }
  .time-item {
    flex: 1;
  }
  .start {
    text-align: left;
  }
  .quality {
    text-align: center;
    display: inline-block;
    opacity: 0.6;
  }
  .quality-span {
    line-height: 13px;
    font-size: 8px;
    padding: 0 2px;
    background-color: #fff;
    border-radius: 2px;
    color: rgb(99, 99, 99);
  }
  .end {
    text-align: right;
  }
  .name {
    margin-top: 20px;
    font-size: 20px;
    font-weight: bold;
  }
  .info {
    text-align: left;
  }
  .song {
    padding: 0 20px;
  }
  .songer {
    margin-top: 6px;
    font-size: 14px;
    color: rgb(255, 255, 255, 0.7);
  }
  .play-bg {
    width: 100vw;
    height: 100vh;
    position: fixed;
    bottom: 0;
    z-index: 999;
    background-size: cover !important;
    background-position: center !important;
    transition: top 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    -webkit-transition: top 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }
  .cover-img {
    object-fit: cover;
    transition: all 0.3s ease;
    -webkit-transition: all 0.3s ease;
  }
  @-webkit-keyframes rotation {
    from {
      -webkit-transform: rotate(0deg);
    }
    to {
      -webkit-transform: rotate(360deg);
    }
  }
  .cover-img-rotate {
    /* -webkit-transform: rotate(360deg); */
    animation: rotation 30s linear infinite;
    -moz-animation: rotation 30s linear infinite;
    -webkit-animation: rotation 30s linear infinite;
    -o-animation: rotation 30s linear infinite;
  }
  .play {
    position: absolute;
    z-index: 1001;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    color: #fff;
    font-size: 26px;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }
  img {
    display: block;
    width: 220px;
    height: 220px;
    margin: auto;
    border-radius: 10px;
    box-shadow: 0 0 20px 0 rgb(0 0 0 / 20%);
  }
  .tool {
    display: flex;
    text-align: center;
    width: 100%;
    color: rgba(255, 255, 255, 0.8);
  }
  .tool-item {
    flex: 1;
    height: 30px;
    position: relative;
    overflow: hidden;
    border-radius: 6px;
  }
  .control-box {
    height: 40vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }
  .control {
    display: flex;
    font-size: 40px;
    text-align: center;
    width: 100%;
    color: rgba(255, 255, 255, 0.9);
    align-items: center;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }
  .con-item {
    margin-bottom: 20px;
    flex: 1;
    border-radius: 40px;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }
  .top-box {
    height: 60vh;
  }
  .play-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.01);
    z-index: 100;
  }
  .cover {
    height: 54vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .song-list-box {
    scroll-behavior: smooth;
    position: relative;
    top: 0px;
    max-height: 54vh;
    overflow-x: auto;
    transition: top 0.5s cubic-bezier(0.25, 1, 0.5, 1);
    -webkit-transition: top 0.5s cubic-bezier(0.25, 1, 0.5, 1);
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
