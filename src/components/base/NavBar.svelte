<script>
  import { pop } from 'svelte-stack-router';
  import { createEventDispatcher, onMount, afterUpdate } from 'svelte';
  import { ArrowLeftLine } from 'svelte-remixicon';

  import { ripple } from '../../utils/common';

  export let title = 'Title';
  export let leftEvent = false;
  export let transparent = false;
  export let fixed = true;
  export let alphaNumber = 1;
  export let dark = false;
  export let rightIcons = [];
  export let isRefresh = false; //是否刷新中

  let leftDom;
  let rightDoms;

  onMount(() => {
    if (leftDom) ripple(leftDom);
    if (rightDoms) {
      ripple(rightDoms);
    }
    return () => {
      rightDoms = null;
    };
  });

  afterUpdate(() => {
    if (rightDoms) {
      ripple(rightDoms, true);
    }
  });

  const dispatch = createEventDispatcher();

  function setLeftClick() {
    dispatch('setLeftClick');
  }
  function iconClick(id) {
    dispatch('setRightIconClick', { id });
  }
</script>

<div
  class="nav secondary"
  style="background-color:rgba(255, 255, 255, {transparent ? alphaNumber : 1})"
  class:transparent
  class:fixed={transparent ? true : fixed}
>
  <div
    bind:this={leftDom}
    class="left"
    style="color:rgba({transparent ? 255 * (1 - alphaNumber) : 0}, {transparent
      ? 255 * (1 - alphaNumber)
      : 0}, {transparent ? 255 * (1 - alphaNumber) : 0}, 1)"
    class:transparent
    on:click={() => {
      if (leftEvent) {
        setLeftClick();
      } else {
        pop();
      }
    }}
  >
    <ArrowLeftLine size="22" style="vertical-align: middle" />
  </div>
  <div
    class="center"
    class:dark
    style="color:rgba({transparent ? 255 * (1 - alphaNumber) : 0}, {transparent
      ? 255 * (1 - alphaNumber)
      : 0}, {transparent ? 255 * (1 - alphaNumber) : 0}, 1)"
  >
    {title}
  </div>
  <div class="right" bind:this={rightDoms}>
    {#if rightIcons.length > 0}
      {#each rightIcons as rightIcon}
        <div class="right-item" on:click={() => iconClick(rightIcon.id)}>
          <span class:rotate-icon={rightIcon.id === 'RefreshLine' && isRefresh}>
            <svelte:component this={rightIcon.icon} size="22" style="vertical-align: middle" />
          </span>
        </div>
      {/each}
    {/if}
  </div>
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
  .dark {
    color: #fff;
  }
  .transparent {
    background-color: transparent;
  }
  .fixed {
    position: fixed;
    top: 0;
  }
  .nav {
    width: 100%;
    text-align: center;
    align-items: center;
    display: flex;
    height: 50px;
    font-size: 16px;
    line-height: 50px;
    z-index: 99;
    background-color: #fff;
  }
  .left {
    height: 50px;
    line-height: 50px;
    flex: 1;
  }
  .center {
    line-height: 50px;
    text-align: left;
    flex: 5;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .right {
    flex: 1;
    display: flex;
    justify-content: space-between;
  }
  .right-item {
    flex: 1;
    height: 50px;
    line-height: 50px;
    padding: 0 10px;
  }
</style>
