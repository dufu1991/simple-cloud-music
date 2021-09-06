<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-stack-router';
  import { SearchLine } from 'svelte-remixicon';

  import { Title, Button } from '../components/base';
  import TopTitle from '../components/TopTitle.svelte';
  import ListGrid from '../components/ListGrid.svelte';
  import Songer from '../components/Singer.svelte';

  import { isHomePageStore, isLoginStore } from '../store/common';

  import {
    topPlaylist,
    toplists,
    highQualityPlaylist,
    playlistCatlist,
    playlistHotCatlist,
    highQualityCat,
  } from '../api/playlist';
  import { topArtists } from '../api/songer';

  let topPlayList = [];
  let highquality = [];
  let offList = [];
  let topOrderList = [];
  let topTitleRightList = {
    type: 'icon',
    path: SearchLine,
  };
  $: allList = [];
  $: active1 = 0;
  $: tab2list = [];
  $: active2 = 0;
  $: categories = {};
  $: HotCatlist = [];
  $: hotSongers = [];
  $: cat = '';
  $: heigcat = '';
  $: heigtab2list = ['默认'];
  $: heigActive = 0;

  onMount(() => {
    allMount();
  });
  function allMount() {
    playlistHotCatlistFun();
    highQualityCatFun();
    offPlaylistFun();
    toplistsFun();
    topArtistsFun();
  }
  //获取热门歌单分类
  async function playlistHotCatlistFun() {
    const res = await playlistHotCatlist();
    if (res.code === 200) {
      HotCatlist = res.tags;
      HotCatlist.unshift({ name: '默认', category: 0 });
      playlistCatlistFun();
    }
  }
  //获取精品歌单分类
  async function highQualityCatFun() {
    const res = await highQualityCat();
    if (res.code === 200) {
      for (let r = 0; r < res.tags.length; r++) {
        heigtab2list.push(res.tags[r].name);
      }
      heigcat = heigtab2list[0];
      highQualityPlaylistFun(heigcat);
    }
  }
  //获取歌单分类
  async function playlistCatlistFun() {
    const res = await playlistCatlist();
    if (res.code === 200) {
      categories = res.categories;
      categories['5'] = '热门';
      allList = dealWithData(res.sub);
      allList.unshift({ category: 5, allData: HotCatlist });
      active1 = allList[0].category;
      tab2list = allList.filter(item => item.category === active1)[0].allData;
      active2 = 0;
      cat = tab2list[0].name;
      topPlaylistFun(tab2list[0].name);
    }
  }
  //热门歌单
  async function topPlaylistFun(cat) {
    const res = await topPlaylist({ limit: 6, cat: cat === '默认' ? '全部' : cat });
    if (res.code === 200) {
      topPlayList = res.playlists;
    }
  }
  //精品歌单
  async function highQualityPlaylistFun(cat) {
    const res = await highQualityPlaylist({ limit: 6, cat: cat === '默认' ? '全部' : cat });
    if (res.code === 200) {
      highquality = res.playlists;
    }
  }
  //官方歌单
  async function offPlaylistFun() {
    const res = await topPlaylist({ limit: 6, cat: '官方' });
    if (res.code === 200) {
      offList = res.playlists;
    }
  }
  //排行榜
  async function toplistsFun() {
    const res = await toplists();
    if (res.code === 200) {
      topOrderList = res.list;
    }
  }
  //热门歌手
  async function topArtistsFun() {
    const res = await topArtists(9);
    if (res.code === 200) {
      hotSongers = res.artists;
    }
  }
  // 查看全部热门歌手
  function hotSongersFun() {
    isHomePageStore.set(false);
    push('/moreSonger');
  }
  function topClickFun(event) {
    if (event.detail.index === 0) {
      isHomePageStore.set(false);
      push('/search');
    }
  }
  function dealWithData(data) {
    let c = [];
    let d = {};
    data.forEach(element => {
      if (!d[element.category]) {
        c.push({
          category: element.category,
          allData: [element],
        });
        d[element.category] = element;
      } else {
        c.forEach(ele => {
          if (ele.category == element.category) {
            ele.allData.push(element);
          }
        });
      }
    });
    return c;
  }
</script>

<TopTitle title="发现" desc="歌单广场" {topTitleRightList} on:IconClick={topClickFun} />
<div class="page">
  {#if topPlayList.length > 0}
    <div style="margin-top: 10px;">
      <ListGrid
        title={tab2list.length > 0 ? `${tab2list[active2].name} - 精选歌单` : `默认-精选歌单`}
        playList={topPlayList}
        on:titleClick={() => {
          isHomePageStore.set(false);
          push('/moreList?cat=' + cat + '&type=top');
        }}
      >
        <div>
          <div class="tab-1-box">
            {#each allList as category}
              <div
                class="tab1"
                class:tab1-active={active1 === category.category}
                on:click={() => {
                  active1 = category.category;
                  tab2list = allList.filter(item => item.category === active1)[0].allData;
                  active2 = 0;
                  cat = tab2list[0].name;
                  topPlaylistFun(tab2list[0].name);
                }}
              >
                {categories[category.category]}
              </div>
            {/each}
          </div>
          <div class="tab-2-box">
            {#each tab2list as tab, i}
              <span
                class="tab2"
                class:tab1-active={active2 === i}
                on:click={() => {
                  active2 = i;
                  cat = tab.name;
                  topPlaylistFun(tab.name);
                }}
              >
                {tab.name}
              </span>
            {/each}
            <div class="mask" />
          </div>
        </div>
      </ListGrid>
    </div>
  {/if}
  {#if offList.length > 0}
    <div class="list-grid">
      <ListGrid
        title="官方歌单"
        playList={offList}
        on:titleClick={() => {
          isHomePageStore.set(false);
          push('/moreList?cat=官方');
        }}
      />
    </div>
  {/if}
  {#if topOrderList.length > 0}
    <div class="list-grid">
      <ListGrid title="排行榜" isShowMore={false} playList={topOrderList} />
    </div>
  {/if}
  {#if hotSongers.length > 0}
    <Title title="热门歌手" isShowRight={true} on:TitleClick={hotSongersFun} />
    <div class="songer-box">
      {#each hotSongers as songer}
        <Songer {songer} coverSize={330} />
      {/each}
    </div>
  {/if}
  {#if highquality.length > 0}
    <div class="list-grid">
      <ListGrid
        title={heigtab2list.length > 0 ? `${heigtab2list[heigActive]} - 精品歌单` : `默认-精品歌单`}
        playList={highquality}
        isShowMore={highquality.length < 6 ? false : true}
        on:titleClick={() => {
          isHomePageStore.set(false);
          push('/moreList?cat=' + heigcat + '&type=high');
        }}
      >
        <div class="tab-2-box">
          {#each heigtab2list as tab, i}
            <span
              class="tab2"
              class:tab1-active={heigActive === i}
              on:click={() => {
                heigActive = i;
                heigcat = tab;
                highQualityPlaylistFun(tab);
              }}
            >
              {tab}
            </span>
          {/each}
          <div class="mask" />
        </div>
      </ListGrid>
    </div>
  {/if}
  {#if !$isLoginStore}
    <div style="margin-top: 40px;padding:0 20px">
      <Button
        on:BtnClick={() => {
          isHomePageStore.set(false);
          push('/about');
        }}
      >
        关于
      </Button>
    </div>
    <div class="ba"><a href="https://beian.miit.gov.cn/" target="_blank">滇ICP备17004037号-3</a></div>
  {/if}
</div>

<style>
  .ba {
    text-align: center;
    font-size: 12px;
    color: #888;
    padding: 20px;
  }
  .songer-box {
    display: grid;
    justify-content: space-between;
    grid-template-columns: repeat(3, 100px);
    padding: 0 20px;
  }
  .list-grid {
    margin-top: 30px;
  }
  .page {
    padding-bottom: 120px;
    font-size: 16px;
  }
  .tab-1-box {
    display: flex;
    padding: 0px 20px;
    font-size: 12px;
    justify-content: space-between;
  }
  .tab1 {
    background-color: #fff;
    border-radius: 4px;
    padding: 4px 0;
    width: 50px;
    text-align: center;
  }
  .tab-2-box {
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    display: flex;
    font-size: 12px;
  }
  .tab-2-box:global(::-webkit-scrollbar) {
    width: 0 !important;
  }
  .tab2 {
    background-color: #fff;
    border-radius: 4px;
    padding: 4px 10px;
    margin: 10px;
  }
  .tab-2-box > :global(:first-child) {
    margin-left: 20px;
  }
  .tab-2-box > :global(:nth-last-child(2)) {
    margin-right: 40px;
  }
  .tab1-active {
    background-color: var(--primary-text-color);
    color: #fff;
  }
  .mask {
    position: absolute;
    right: 0;
    width: 40px;
    height: 40px;
    background-color: #f4f4f4;
    -webkit-mask: linear-gradient(to left, #000, transparent);
    mask: linear-gradient(to left, #000, transparent);
  }
</style>
