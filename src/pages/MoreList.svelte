<script>
  import { onMount } from 'svelte';
  import { onResume, search } from 'svelte-stack-router';
  import Lazy from 'svelte-lazy';

  import { NavBar, Pagination } from '../components/base';
  import MiniPlayListCover from '../components/MiniPlayListCover.svelte';

  import { defaultResumableStore } from '../store/common';

  import { topPlaylist, highQualityPlaylist } from '../api/playlist';

  import { getRequest } from '../utils/common';

  $: playList = [];
  $: hasMore = true;
  $: offset = 0;
  $: paginationHeight = 0;
  $: searchObj = {};
  $: before = 0;
  let limit = 20;

  onResume(() => {
    if (!$defaultResumableStore) {
      playList = [];
      hasMore = true;
      offset = 0;
      paginationHeight = 0;
      before = 0;
      searchObj = {};
      allMount();
    }
  });
  onMount(() => {
    allMount();
  });
  function allMount() {
    paginationHeight = document.documentElement.clientHeight || document.body.clientHeight - 120;
    searchObj = getRequest($search);
    if (searchObj.type === 'high') {
      highQualityPlaylistFun(searchObj.cat);
    } else {
      topPlaylistFun(searchObj.cat);
    }
  }
  //热门歌单
  async function topPlaylistFun(cat) {
    const res = await topPlaylist({ limit, cat: cat === '默认' ? '全部' : cat, offset });
    if (res.code === 200) {
      playList = playList.concat(res.playlists);
      hasMore = res.more;
    }
  }
  //精品歌单
  async function highQualityPlaylistFun(cat) {
    const res = await highQualityPlaylist({ limit, cat: cat === '默认' ? '全部' : cat, before });
    if (res.code === 200) {
      playList = playList.concat(res.playlists);
      hasMore = res.more;
    }
  }
</script>

<NavBar
  title={searchObj.cat === '官方' ? '官方歌单' : `${searchObj.cat} - ${searchObj.type === 'top' ? '精选' : '精品'}歌单`}
/>
<div class="comment-page">
  <Pagination
    bottomHeight={70}
    {paginationHeight}
    items={playList}
    let:item
    let:index
    {hasMore}
    grid={2}
    on:load={() => {
      if (hasMore) {
        if (searchObj.type === 'high') {
          before = playList.slice(-1)[0].updateTime;
          highQualityPlaylistFun(searchObj.cat);
        } else {
          offset = playList.length;
          topPlaylistFun(searchObj.cat);
        }
      }
    }}
  >
    <MiniPlayListCover
      name={item.name}
      coverImgUrl={item.coverImgUrl}
      id={item.id}
      width={150}
      playCount={item.playCount}
      trackCount={item.trackCount}
    />
  </Pagination>
</div>

<style>
  .comment-page {
    padding: 50px 20px;
    font-size: 16px;
    color: #333333;
  }
</style>
