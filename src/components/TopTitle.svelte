<script>
  import { createEventDispatcher, onMount, afterUpdate } from 'svelte';

  import { ripple } from '../utils/common';

  export let title = '首页';
  export let desc = '暂无描述';
  export let isRefresh = false; //是否刷新中
  export let topTitleRightList = {};
  const dispatch = createEventDispatcher();
  function setClick(index) {
    dispatch('IconClick', {
      index,
    });
  }

  let rightDoms;

  onMount(() => {
    if (rightDoms) {
      ripple(rightDoms);
    }
    return () => {
      rightDoms = null;
    };
  });
  afterUpdate(() => {
    if (rightDoms) {
      ripple(rightDoms);
    }
  });
</script>

<div class="top-title">
  <div class="title">
    <h1>{title}<span class="desc">&nbsp;&nbsp;&nbsp;{desc}</span></h1>
  </div>
  {#if topTitleRightList}
    <div class="right" bind:this={rightDoms}>
      {#if topTitleRightList.type === 'icon'}
        <span class:rotate-icon={isRefresh} on:click={() => setClick(0)}>
          <svelte:component this={topTitleRightList.path} size="24" />
        </span>
      {:else}
        <span class="right-text" on:click={() => setClick(0)}>{topTitleRightList.text}</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .rotate-icon {
    display: inline-block;
    -webkit-animation: myRotate 2s linear infinite;
    animation: myRotate 2s linear infinite;
  }
  @keyframes myRotate {
    0% {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .top-title {
    background-image: linear-gradient(#fff, #f4f4f4);
    display: flex;
    justify-content: space-between;
    padding: 20px;
  }
  .right-text {
    display: inline-block;
    font-size: 16px;
    line-height: 32px;
  }
  .right {
    font-size: 32px;
    line-height: 36px;
  }
  h1 {
    text-align: left;
    font-size: 32px;
    font-weight: bold;
    margin: 0px;
  }
  .desc {
    font-size: 12px;
    font-weight: 400;
  }
</style>
