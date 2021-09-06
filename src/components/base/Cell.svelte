<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { ArrowRightSLine } from 'svelte-remixicon';
  import { ripple } from '../../utils/common';

  import Switch from './Switch.svelte';

  let cellDom;
  export let title = '标题';
  export let titleDesc = '';
  export let arrow = false;
  export let desc = '';
  export let cellCheck = false;

  const dispatch = createEventDispatcher();

  onMount(() => {
    if (cellDom) {
      ripple(cellDom);
    }
  });
  function cellClick() {
    if (desc === 'Switch') {
      cellCheck = !cellCheck;
      dispatch('cellClick', {
        cellCheck,
      });
    } else {
      dispatch('cellClick');
    }
  }
</script>

<div class="cell" on:click={cellClick} bind:this={cellDom}>
  <div class="title">
    <div class="title-main">{title}</div>
    {#if titleDesc != ''}
      <div class="title-des">{titleDesc}</div>
    {/if}
  </div>
  <div class="desc">
    <div class="desc-title">
      {#if desc === 'Switch'}
        <div class="switch" style="margin-top: {titleDesc === '' ? '2px' : '8.5px'};">
          <Switch check={cellCheck} />
        </div>
      {:else}
        {desc}
      {/if}
    </div>
  </div>
  {#if arrow}
    <div class="arrow" style="line-height: {titleDesc === '' ? '26px' : '39px'};">
      <span style="position: relative; top: -1px;">
        <ArrowRightSLine size="20" style="vertical-align: middle;" />
      </span>
    </div>
  {/if}
</div>

<style>
  .cell {
    background-color: #fff;
    font-size: 16px;
    padding: 13px 10px;
    border-radius: 8px;
    display: flex;
    margin: 10px auto;
  }
  .title {
    flex: auto;
  }
  .title-main {
    height: 26px;
    line-height: 26px;
  }
  .title-des {
    font-size: 10px;
    color: #999;
  }
  .desc {
    height: 26px;
    flex: auto;
    display: table;
  }
  .desc-title {
    vertical-align: middle;
    display: table-cell;
    text-align: right;
    color: #666;
    margin: 2px auto;
  }
  .switch {
    margin-top: 2px;
    height: 22px;
  }
  .arrow {
    height: 26px;
    line-height: 26px;
    width: 20px;
  }
</style>
