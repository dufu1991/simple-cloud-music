<script>
  import { createEventDispatcher, onMount, afterUpdate } from 'svelte';
  import { ArrowRightSLine } from 'svelte-remixicon';

  import { ripple } from '../../utils/common';

  export let title = 'Title';
  export let isShowRight = false;
  export let iconText = '更多';
  let titleDom;
  const dispatch = createEventDispatcher();
  function setTitleClick() {
    dispatch('TitleClick');
  }

  onMount(() => {
    if (titleDom) ripple(titleDom);
  });
</script>

<div class="title" on:click={setTitleClick} bind:this={titleDom}>
  <div>{title}</div>
  {#if isShowRight}
    <div class="title-right">
      {iconText}
      <span class="title-icon">
        <ArrowRightSLine size="24" style="vertical-align: middle;" />
      </span>
    </div>
  {/if}
</div>

<style>
  .title-right {
    line-height: 24px;
    border-radius: 10px;
    font-size: 14px;
    color: #666;
    height: 24px;
    text-align: center;
    margin-right: 20px;
  }
  .title {
    text-align: left;
    margin-left: 20px;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
  }
  .title-icon {
    position: relative;
    top: -2px;
  }
</style>
