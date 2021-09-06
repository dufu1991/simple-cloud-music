<script>
  import { createEventDispatcher } from 'svelte';

  export let bottomHeight = 0; //距离底部的距离临界值开始刷新
  export let items = [];
  export let paginationHeight = 0;
  export let hasMore = true;
  export let grid = 1;
  let paginationDom;
  let paginationBoxDom;

  // 加载更多触发器 默认隐藏
  const dispatch = createEventDispatcher();

  // 加载更多触发器 事件
  let loadData = function () {
    if (!items || items.length == 0) return;
    // 变量scrollTop是滚动条滚动时，滚动条上端距离顶部的距离
    const scrollTop = paginationBoxDom.scrollTop;
    //变量windowHeight是可视区的高度
    const windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
    //变量scrollHeight是滚动条的总高度（当前可滚动的页面的总高度）
    const scrollHeight = paginationDom.scrollHeight;
    // 滚动条到底部;
    if (scrollTop + windowHeight + bottomHeight >= scrollHeight) {
      dispatch('load');
    }
  };
  //防抖
  function debounce(fn, delay) {
    let timer = null;
    return function () {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        //模拟触发change事件
        fn.apply(this, arguments);
        // 清空计时器
        timer = null;
      }, delay);
    };
  }
  // 节流
  function throttle(fn, delay = 50) {
    let timer = null;
    return function () {
      if (timer) {
        return;
      }
      timer = setTimeout(() => {
        fn.apply(this, arguments);
        timer = null;
      }, delay);
    };
  }
</script>

<!-- 加载更多触发器 - end -->
<div
  class="pagination-box"
  style="height:{paginationHeight}px"
  on:scroll={throttle(debounce(loadData, 500))}
  bind:this={paginationBoxDom}
>
  <div bind:this={paginationDom}>
    {#if items.length > 0}
      {#if grid > 1}
        <div class="grid-box" style="grid-template-columns: repeat({grid}, {300 / grid}px);">
          {#each items as item, index}
            <slot {item} {index} />
          {/each}
        </div>
      {:else}
        {#each items as item, index}
          <slot {item} {index} />
        {/each}
      {/if}
    {/if}
  </div>
  {#if hasMore}
    <div class="no-more">
      <div>
        <embed width="40" height="40" src="/images/Ripple.svg" type="image/svg+xml" />
      </div>
      <span class="no-more-text">😤 别急啊，在加载了...</span>
    </div>
  {:else}
    <div class="no-more no-more-text">😤 别滑了，到底啦！</div>
  {/if}
</div>

<style>
  .pagination-box {
    overflow-y: auto;
    padding-top: 10px;
  }
  .pagination-box:global(::-webkit-scrollbar) {
    width: 0 !important;
  }
  .no-more {
    margin: 20px;
    text-align: center;
  }
  .no-more-text {
    color: #888;
  }
  .grid-box {
    display: grid;
    justify-content: space-between;
    grid-template-columns: repeat(1, 300px);
  }
</style>
