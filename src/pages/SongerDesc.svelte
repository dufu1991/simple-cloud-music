<script>
  import { onMount } from "svelte";
  import { search, onResume } from "svelte-stack-router";

  import { NavBar } from "../components/base";

  import { defaultResumableStore } from "../store/common";

  import { getSongerDesc } from "../api/songer";

  $: briefDesc = "";
  $: introduction = [];
  $: topicData = [];

  onResume(() => {
    if (!$defaultResumableStore) {
      getSongerDescFun();
    }
  });

  onMount(() => {
    getSongerDescFun();
  });
  async function getSongerDescFun() {
    const res = await getSongerDesc($search.substr(1));
    if (res.code === 200) {
      briefDesc = res.briefDesc;
      introduction = res.introduction;
      topicData = res.topicData;
    }
  }
</script>

<NavBar title="歌手详情" dark={true} />
<div class="page">
  <div class="title">简介</div>
  <div class="text">{briefDesc}</div>
  {#each introduction as i}
    <div class="title">{i.ti}</div>
    <div class="text">{@html i.txt}</div>
  {/each}
</div>

<style>
  .page {
    padding: 50px 20px 70px;
    font-size: 18px;
    font-weight: bold;
    text-align: justify;
  }
  .title {
    margin: 20px 0 10px;
  }
  .text {
    font-weight: normal;
    font-size: 14px;
    color: rgb(97, 97, 97);
    white-space: pre-line;
  }
</style>
