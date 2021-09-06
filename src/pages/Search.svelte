<script>
  import { onMount } from 'svelte';
  import { DeleteBinLine } from 'svelte-remixicon';

  import { NavBar } from '../components/base';
  import Songer from '../components/Singer.svelte';
  import MiniPlayListCover from '../components/MiniPlayListCover.svelte';
  import SongList from '../components/SongList.svelte';

  import { search } from '../api/others';
  import { getSongDetail } from '../api/song';

  import { ripple } from '../utils/common';

  let inputDom;
  let keywords = '';
  let songers = [];
  $: songs = [];
  let playLists = [];
  let typeList = [
    { index: 0, type: 0, text: '综合' },
    { index: 1, type: 1, text: '单曲' },
    { index: 2, type: 100, text: '歌手' },
    { index: 3, type: 1000, text: '歌单' },
  ];
  $: active = 0;
  $: type = typeList[0].type;
  $: searchkeywordList = localStorage.getItem('searchkeywords')
    ? [...new Set(localStorage.getItem('searchkeywords').split('|&&|'))].filter(function (s) {
        return s && s.trim();
      })
    : [];
  $: searchkeywordList10 =
    searchkeywordList.length > 10
      ? searchkeywordList.slice(0, 10).filter(function (s) {
          return s && s.trim();
        })
      : searchkeywordList.filter(function (s) {
          return s && s.trim();
        });
  $: isShowResult = false;
  let typeDoms;

  onMount(() => {
    if (typeDoms) ripple(typeDoms, true);
    inputDom.addEventListener('compositionstart', function (e) {
      //非直接的文字输入时（键盘输入中文的拼音）
      e.target.isNeedPrevent = true;
    });
    inputDom.addEventListener('compositionend', function (e) {
      //直接输入文字后（键盘选择真实的汉字）
      e.target.isNeedPrevent = false;
    });
    inputDom.addEventListener('input', inputchange);
    inputDom.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') searchFun();
    });
  });
  function inputchange(e) {
    setTimeout(() => {
      //采用延时进行节流
      if (!e.target.isNeedPrevent && e.target.oldValue !== e.target.value) {
        //判断输入是否完成以及值是否变化
        e.target.oldValue = e.target.value;
        keywords = e.target.value;
      }
    }, 10);
  }
  //搜索
  function searchFun() {
    if (keywords.trim() != '') {
      inputDom.blur();
      let searchkeywords = localStorage.getItem('searchkeywords') ? localStorage.getItem('searchkeywords') : '';
      if (searchkeywords.indexOf(keywords) != -1) {
        //有
        searchkeywords = `${keywords}|&&|` + searchkeywords.replace(`${keywords}|&&|`, '');
      } else {
        searchkeywords = `${keywords}|&&|` + searchkeywords;
      }
      searchkeywordList = searchkeywords.split('|&&|');
      localStorage.setItem('searchkeywords', searchkeywords);
      if (type === 0) {
        //搜索综合
        searchApiFun(typeList[1].type, false);
        searchApiFun(typeList[2].type, false);
        searchApiFun(typeList[3].type, false);
      } else {
        searchApiFun(type, true);
      }
    }
  }
  function quickSearchFun(key) {
    keywords = key;
    searchFun();
  }
  function clearSearchFun() {
    searchkeywordList10 = [];
    localStorage.removeItem('searchkeywords');
  }
  //开始搜索
  async function searchApiFun(type, isMore) {
    const res = await search({ keywords, type, limit: isMore ? 30 : 6 });
    if (res.code === 200) {
      isShowResult = true;
      switch (type) {
        case 1:
          let songIdList = [];
          for (let i = 0; i < res.result.songs.length; i++) {
            songIdList.push(res.result.songs[i].id);
          }
          getSongDetailFun(songIdList.join(','));
          break;
        case 100:
          songers = res.result.artists;
          break;
        case 1000:
          playLists = res.result.playlists;
          break;
        default:
          console.log('未知类型');
          break;
      }
    }
  }
  //获取所有歌曲详情
  async function getSongDetailFun(songIds) {
    const res = await getSongDetail(songIds);
    if (res.code === 200) {
      songs = res.songs;
    }
  }
  //数组去重
  function uniqe(arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr.indexOf(arr[i]) == i) {
        temp.push(arr[i]);
      }
    }
    return temp;
  }
</script>

<NavBar title="搜索" />
<div class="search-page">
  <div class="input-box">
    <form action="JavaScript:void 0">
      <input bind:this={inputDom} placeholder="请输入关键字" type="search" value={keywords} />
    </form>
    <button
      on:click={() => searchFun()}
      style="background-color: {keywords === '' ? 'rgb(224, 224, 224)' : 'var(--primary-text-color)'};
        color:{keywords === '' ? '#666' : '#fff'}"
    >
      搜索
    </button>
  </div>
  <div class="searchkeyword">
    {#each searchkeywordList10.filter(function (s) {
      return s && s.trim();
    }) as item}
      <span class="key-item" on:click={() => quickSearchFun(item)}>
        {item}
      </span>
    {/each}
    {#if searchkeywordList10.filter(function (s) {
      return s && s.trim();
    }).length > 0}
      <span class="key-item" on:click={clearSearchFun}>
        <DeleteBinLine size="12" style="vertical-align: middle" />
      </span>
    {/if}
  </div>
  <div class="type" bind:this={typeDoms}>
    {#each typeList as t}
      <div
        class="type-item"
        class:active={active === t.index}
        on:click={() => {
          active = t.index;
          type = t.type;
          searchFun();
        }}
      >
        {t.text}
      </div>
    {/each}
  </div>
  <div class="active-line" style="left: {20 + ((localStorage.getItem('fullWidth') - 40) / 4) * active}px;" />
  {#if isShowResult}
    <div class="result-box">
      <!-- 综合 -->
      <div class="result all-box" style="display: {active === 0 ? 'block' : 'none'};">
        <div class="songer-title">单曲</div>
        <div class="reault-song">
          <div class="song-box">
            <SongList songList={songs} />
          </div>
        </div>
        <!-- <Divider /> -->
        <div class="songer-title">歌手</div>
        <div class="reault-songer">
          {#each songers as songer}
            <div class="songer-box">
              <Songer {songer} coverSize={330} />
            </div>
          {/each}
        </div>
        <!-- <Divider /> -->
        <div class="songer-title">歌单</div>
        <div class="reault-play-list">
          {#each playLists as play}
            <div class="list-box">
              <MiniPlayListCover
                name={play.name}
                coverImgUrl={play.coverImgUrl}
                id={play.id}
                playCount={play.playCount}
                trackCount={play.trackCount}
              />
            </div>
          {/each}
        </div>
      </div>
      <!-- 单曲 -->
      <div class="result song-box" style="display: {active === 1 ? 'block' : 'none'};">
        <div class="reault-song">
          <div class="song-box">
            <SongList songList={songs} />
          </div>
        </div>
      </div>
      <!--歌手 -->
      <div class="result reault-songer-box" style="display: {active === 2 ? 'block' : 'none'};">
        <div class="reault-songer">
          {#each songers as songer}
            <Songer {songer} coverSize={250} />
          {/each}
        </div>
      </div>
      <!-- 歌单 -->
      <div style="display: {active === 3 ? 'block' : 'none'};">
        <div class="reault-play-list">
          {#each playLists as play}
            <MiniPlayListCover
              name={play.name}
              coverImgUrl={play.coverImgUrl}
              id={play.id}
              playCount={play.playCount}
              trackCount={play.trackCount}
            />
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .searchkeyword {
    padding: 10px 20px;
  }
  .key-item {
    display: inline-block;
    font-size: 12px;
    margin: 4px 8px 4px 0;
    padding: 4px 8px;
    border-radius: 4px;
    background-color: #fff;
  }
  .songer-title {
    margin: 20px auto 10px;
    font-weight: bold;
    padding: 0 20px;
  }
  .active-line {
    margin-bottom: 10px;
    height: 2px;
    width: 83.75px;
    background-color: var(--primary-text-color);
    position: relative;
    left: 0px;
    transition: all 0.3s cubic-bezier(0.18, 0.89, 0.26, 1.19);
    -webkit-transition: all 0.3s cubic-bezier(0.18, 0.89, 0.26, 1.19);
  }
  .type {
    display: flex;
    padding: 0 20px;
  }
  .type-item {
    font-weight: bold;
    padding: 10px 0 8px;
    text-align: center;
    flex: 1;
  }
  .active {
    color: var(--primary-text-color);
  }
  .search-page {
    font-size: 16px;
    padding: 50px 0px 70px;
  }
  .input-box {
    margin: 10px auto;
    font-size: 20px;
    display: flex;
    padding: 0 20px;
  }
  .input-box form {
    flex: auto;
  }
  .input-box form input {
    width: 100%;
    margin: 0;
    padding: 0 5px;
    border: none;
    height: 30px;
    box-sizing: border-box;
    line-height: 10px;
    border-radius: 4px;
    font-size: 14px;
    outline: none;
    -webkit-appearance: none;
  }
  .input-box input:focus {
    border: 1px solid var(--primary-text-color);
  }
  .input-box input:active {
    border: 1px solid var(--primary-text-color);
  }
  .input-box button {
    border: none;
    padding: 0 8px;
    border-radius: 4px;
    margin-left: 10px;
    width: 48px;
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    background-color: rgb(224, 224, 224);
  }
  .reault-songer {
    display: grid;
    justify-content: space-between;
    grid-template-columns: repeat(3, 100px);
    padding: 0 20px;
  }
  .reault-play-list {
    display: grid;
    justify-content: space-between;
    grid-template-columns: repeat(2, 150px);
    padding: 0 20px;
  }
  .songer-box {
    padding: 10px 0;
  }
</style>
