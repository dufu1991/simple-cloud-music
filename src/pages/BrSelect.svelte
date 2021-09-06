<script>
  import { NavBar, Radio, Tip } from "../components/base";

  import { musicQualityStore } from "../store/common";

  let radioData = [
    { text: "普通", desc: "128K" },
    { text: "较高", desc: "192K" },
    { text: "极高", desc: "320K" },
    { text: "无损", desc: "FLAC" },
  ];
  let tipTextList = [
    "提示：",
    "1、音质越高相对应所需流量也越高。FLAC 格式对网络要求较高，一首歌曲文件几十 M 甚至超过 100M。",
    "2、一般来说，达到较高音质（192K）非专业设备就已经听不出差距了，如果用的是普通蓝牙耳机，那就更没必要开启高音质了。",
    "3、若当前账号无法播放高音质，或音乐资源无当前音质，将自动匹配下一级别音质。",
    "4、所选音质将在下一次切换歌曲生效。",
  ];
  let active = Number($musicQualityStore);

  function getActiveFun(e) {
    musicQualityStore.set(e.detail.active.toString());
    localStorage.setItem("musicQuality", e.detail.active.toString());
  }
</script>

<NavBar title="播放音质" />
<div class="br-page">
  <Radio {radioData} on:RadioClick={getActiveFun} {active} />
  <Tip {tipTextList} />
</div>

<style>
  .br-page {
    padding: 50px 20px 70px;
    font-size: 16px;
  }
</style>
