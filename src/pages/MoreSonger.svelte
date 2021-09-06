<script>
  import { onMount } from 'svelte';
  import { onResume } from 'svelte-stack-router';

  import { NavBar, Pagination } from '../components/base';
  import Songer from '../components/Singer.svelte';

  import { defaultResumableStore } from '../store/common';

  import { topArtists } from '../api/songer';

  $: hotSongers = [];
  $: hasMore = true;
  $: offset = 0;
  $: paginationHeight = 0;
  let limit = 20;

  onResume(() => {
    if (!$defaultResumableStore) {
      hotSongers = [];
      hasMore = true;
      offset = 0;
      paginationHeight = document.documentElement.clientHeight || document.body.clientHeight - 120;
      topArtistsFun();
    }
  });

  onMount(() => {
    paginationHeight = document.documentElement.clientHeight || document.body.clientHeight - 120;
    topArtistsFun(0);
  });
  //热门歌手
  async function topArtistsFun(offset) {
    const res = await topArtists(limit, offset);
    if (res.code === 200) {
      hotSongers = hotSongers.concat(res.artists);
      hasMore = res.more;
    }
  }
</script>

<NavBar title={`热门歌手 ${hotSongers.length} 位`} />
<div class="comment-page">
  <Pagination
    bottomHeight={70}
    {paginationHeight}
    items={hotSongers}
    let:item
    let:index
    {hasMore}
    grid={3}
    on:load={() => {
      if (hasMore) {
        offset = hotSongers.length;
        topArtistsFun(offset);
      }
    }}
  >
    <Songer songer={item} coverSize={200} />
  </Pagination>
</div>

<style>
  .comment-page {
    padding: 50px 20px;
    font-size: 16px;
    color: #333333;
  }
</style>
