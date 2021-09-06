<script>
  import { onMount, afterUpdate } from 'svelte';
  import { ThumbUpLine, ThumbUpFill } from 'svelte-remixicon';

  import { NavBar, Divider, Pagination } from '../components/base';

  import { getHotComment, likeComment } from '../api/song';

  import { currentSongStore } from '../store/play';
  import { isLoginStore } from '../store/common';

  import { formatTime, Toast, tranNumber, emojiToImg } from '../utils/common';

  $: totalCount = 0;
  $: hotComments = [];
  $: currentSongId = 0; //当前歌曲 ID，用于计算更新页面
  $: hasMore = true;
  $: offset = 0;
  $: paginationHeight = 0;
  
  onMount(() => {
    paginationHeight = document.documentElement.clientHeight || document.body.clientHeight - 120;
    getHotCommentFun(0);
  });
  afterUpdate(() => {
    if (currentSongId !== $currentSongStore.id) {
      hotComments = [];
      offset = 0;
      hasMore = true;
      getHotCommentFun(offset);
    }
  });
  async function getHotCommentFun(offset) {
    currentSongId = $currentSongStore.id;
    const res = await getHotComment($currentSongStore.id, offset);
    if (res.code === 200) {
      totalCount = res.total;
      hotComments = hotComments.concat(res.hotComments);
      hasMore = res.hasMore;
      // 去除云村编辑部的广告
      hotComments = hotComments.filter(item => item.user.nickname !== '云村评论编辑部');
      for (let r = 0; r < hotComments.length; r++) {
        //处理 emoji 表情显示
        hotComments[r].content = emojiToImg(hotComments[r].content);
      }
    }
  }
  async function commentClickFun(commentId, liked) {
    if ($isLoginStore) {
      const res = await likeComment($currentSongStore.id, commentId, 0, liked ? 0 : 1);
      if (res.code === 200) {
        for (let y = 0; y < hotComments.length; y++) {
          if (hotComments[y].commentId === commentId) {
            hotComments[y].liked = !liked;
          }
        }
      }
    } else {
      Toast('请登录');
    }
  }
</script>

<NavBar title={`热门评论（${totalCount || 0}）`} />
<div class="comment-page">
  <Pagination
    bottomHeight={70}
    {paginationHeight}
    items={hotComments}
    let:item
    let:index
    {hasMore}
    on:load={() => {
      if (hasMore) {
        offset = hotComments.length;
        getHotCommentFun(offset);
      }
    }}
  >
    <div>
      <div class="comment">
        <!-- <div class="floor">{index + 1}楼</div> -->
        <div class="top">
          <div class="user">
            <div class="cover">
              <img src={item.user.avatarUrl.replace(/^http:/, 'https:') + '?param=50y50'} alt="" />
            </div>
            <div class="info">
              <div class="name">
                {item.user.nickname}
                {#if item.user.authStatus === 1}
                  <span class="vip">
                    <img class="authStatus" src="/images/auth.png" alt="" />
                  </span>
                {/if}
                {#if item.user.vipType !== 0}
                  <span class="vip">
                    <img class="cvip" src={`/images/vip/${item.user.vipRights.redVipLevel}.png`} alt="" />
                  </span>
                {/if}
              </div>
              <div class="time">
                {formatTime(item.time, 'yyyy-MM-dd hh:mm:ss')}
              </div>
            </div>
          </div>
          <div
            class="like"
            on:click={() => commentClickFun(item.commentId, item.liked)}
            style="color:{item.liked ? 'var(--primary-text-color)' : '#666'}"
          >
            <span class="liked-span">
              {#if item.liked}
                <ThumbUpFill size="12" style="vertical-align: middle;margin-left:4px;" />
              {:else}
                <ThumbUpLine size="12" style="vertical-align: middle;margin-left:4px" />
              {/if}
            </span>{tranNumber(item.likedCount)}
          </div>
        </div>
        <div class="content">
          {@html item.content}
          {#if item.beReplied && item.beReplied.length > 0}
            <div class="beReplied">
              @ {item.beReplied[0].user.nickname}：{item.beReplied[0].content}
            </div>
          {/if}
        </div>
      </div>
      <Divider />
    </div>
  </Pagination>
</div>

<style>
  .cvip {
    width: 29.1667px;
    height: 10px;
  }
  .authStatus {
    width: 10px;
    height: 10px;
  }
  .beReplied {
    color: #8a8a8a;
    font-size: 10px;
    padding: 4px;
    margin-top: 4px;
    border-radius: 4px;
    background-color: #ebebeb;
  }
  .comment-page {
    padding: 50px 10px 70px;
    font-size: 16px;
    color: #333333;
  }
  .comment {
    margin: 20px auto;
  }
  .top {
    display: flex;
    justify-content: space-between;
  }
  .cover {
    width: 30px;
    height: 30px;
    border-radius: 15px;
    overflow: hidden;
    margin-right: 10px;
  }
  .cover img {
    width: 100%;
  }
  .user {
    display: flex;
    justify-content: flex-start;
    font-size: 12px;
  }
  .info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .time {
    font-size: 10px;
    color: #888;
  }
  .like {
    color: #666;
    font-size: 12px;
    line-height: 30px;
  }
  .liked-span {
    position: relative;
    top: -2px;
  }
  .content {
    text-align: justify;
    margin-top: 10px;
  }
</style>
