<script>
  import { onMount } from 'svelte';
  import Lazy from 'svelte-lazy';
  import { search, onResume } from 'svelte-stack-router';

  import { NavBar } from '../components/base';
  import MiniPlayListCover from '../components/MiniPlayListCover.svelte';

  import { userPlaylist } from '../api/user';

  import { userInfoStore } from '../store/user';
  import { defaultResumableStore } from '../store/common';

  import { Alert } from '../utils/common';

  $: playList = [];

  onResume(() => {
    if (!$defaultResumableStore) {
      userPlaylistFun();
    }
  });

  onMount(() => {
    userPlaylistFun();
  });
  //获取用户收藏歌单ID列表
  async function userPlaylistFun(login) {
    const res = await userPlaylist({
      uid: $userInfoStore.account.id,
    });
    if (res.code === 200) {
      let createListL = [];
      let collectListL = [];
      //去除喜欢的音乐
      if (
        res.playlist[0].creator.userId === $userInfoStore.account.id &&
        res.playlist[0].name.substr(-5) === '喜欢的音乐'
      ) {
        res.playlist.splice(0, 1);
      }
      for (let i = 0; i < res.playlist.length; i++) {
        if (res.playlist[i].creator.userId === $userInfoStore.account.id) {
          createListL.push(res.playlist[i]);
        } else {
          collectListL.push(res.playlist[i]);
        }
      }
      playList = $search === '?create' ? createListL : collectListL;
    } else {
      Alert('获取收藏歌单失败');
    }
  }
</script>

<NavBar title={$search === '?create' ? '创建的歌单' : '收藏的歌单'} />

<div class="play-list-page">
  {#each playList as play}
    <Lazy height={180}>
      <MiniPlayListCover
        name={play.name}
        coverImgUrl={play.coverImgUrl}
        id={play.id}
        playCount={play.playCount}
        trackCount={play.trackCount}
      />
    </Lazy>
  {/each}
</div>

<style>
  .play-list-page {
    padding: 60px 20px 70px;
    font-size: 16px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .play-list-page:after {
    content: '';
    width: 105px;
  }
</style>
