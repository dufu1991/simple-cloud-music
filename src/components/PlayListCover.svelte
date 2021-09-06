<script>
  import { onMount } from 'svelte';
  import Lazy from 'svelte-lazy';
  import { push } from 'svelte-stack-router';
  import { PlayMiniLine } from 'svelte-remixicon';

  import { playListIdStore } from '../store/playList';
  import { isHomePageStore } from '../store/common';

  import { tranNumber, Confirm, ripple } from '../utils/common';

  export let coverImgUrl = '';
  export let playCount = 0;
  export let copywriter = '';
  export let name = '';
  export let id = 0;
  export let trackCount = 0;

  let coverDom;

  onMount(() => {
    if (coverDom) {
      ripple(coverDom);
    }
  });

  function goToDetail() {
    playListIdStore.set(id);
    isHomePageStore.set(false);
    if (trackCount > 1000) {
      Confirm('😅 此歌单有 ' + trackCount + ' 首歌曲，加载时间可能比较久，确定查看歌单详情吗？', async () => {
        push('/playlistdetail');
      });
    } else {
      push('/playlistdetail');
    }
  }
</script>

<div class="cover" on:click={goToDetail} bind:this={coverDom}>
  <div class="cover-img">
    <Lazy height={220}>
      <img src={coverImgUrl.replace(/^http:/, 'https:') + '?param=600y600'} alt="" />
    </Lazy>
  </div>
  <div class="play-num">
    <span style="position: relative;top:1px">
      <PlayMiniLine />
    </span>{tranNumber(playCount)}
  </div>
  <div class="name">{name}</div>
  {#if copywriter && copywriter !== null && copywriter !== ''}
    <div class="copywriter">{copywriter}</div>
  {/if}
</div>

<style>
  .play-num {
    margin: 4px auto;
    font-size: 12px;
    color: rgb(146, 146, 146);
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
  .copywriter {
    margin: 4px auto;
    font-size: 12px;
    color: rgb(146, 146, 146);
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    height: 26px;
  }
  .cover {
    width: 220px;
  }
  .cover-img {
    width: 220px;
    height: 220px;
    overflow: hidden;
  }
  img {
    width: 100%;
    border-radius: 8px;
  }
  .name {
    margin-top: 4px;
    line-height: 18px;
    width: 220px;
    height: 36px;
    font-size: 14px;
    text-align: left;
    font-weight: bold;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
</style>
