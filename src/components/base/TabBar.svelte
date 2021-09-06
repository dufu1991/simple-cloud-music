<script>
  import { onMount, afterUpdate } from 'svelte';
  import { ThumbUpFill, Compass3Fill, AccountCircleFill } from 'svelte-remixicon';

  import { isHomePageStore, homeActiveStore } from '../../store/common';
  import { ripple } from '../../utils/common';

  let navDatas = [
    {
      icon: ThumbUpFill,
      text: '推荐',
      path: '/love',
    },
    {
      icon: Compass3Fill,
      text: '发现',
      path: '/discover',
    },
    {
      icon: AccountCircleFill,
      text: '我',
      path: '/mine',
    },
  ];
  let tabDoms = [];
  onMount(() => {
    if (tabDoms.length > 0) {
      for (let r = 0; r < tabDoms.length; r++) {
        ripple(tabDoms[r]);
      }
    }
  });
</script>

<div class="secondary nav" style="bottom: {$isHomePageStore ? '0px' : 'calc(-55px - env(safe-area-inset-bottom))'};">
  {#each navDatas as navData, i}
    <div
      class="nav-item"
      class:active={$homeActiveStore === i}
      on:click={() => {
        homeActiveStore.set(i);
      }}
      bind:this={tabDoms[i]}
    >
      <div>
        <svelte:component this={navData.icon} size="24px" />
      </div>
      <div class="nav-text">{navData.text}</div>
    </div>
  {/each}
</div>

<style>
  .nav {
    z-index: 599;
    border-top: 1px solid rgba(197, 197, 197, 0.4);
    width: 100%;
    height: 55px;
    position: fixed;
    bottom: 0px;
    display: flex;
    text-align: center;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    transition: all 0.4s ease-in-out;
    -webkit-transition: all 0.4s ease-in-out;
  }
  .nav-item {
    display: block;
    font-size: 12.8px;
    padding: 6.4px 0 9.6px;
    flex: 1;
  }
  .nav-text {
    margin-top: 3.2px;
  }
  .active {
    color: var(--primary-text-color);
  }
</style>
