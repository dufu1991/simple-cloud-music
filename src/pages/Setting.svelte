<script>
  import { pop, push } from 'svelte-stack-router';

  import { NavBar, Cell, Button } from '../components/base';

  import { logout } from '../api/user';

  import {
    restoreScrollStore,
    musicQualityStore,
    isShowTranslateStore,
    isLoginStore,
    isShowCommentStore,
  } from '../store/common';
  import { showVisualizerStore } from '../store/play';

  import { Confirm } from '../utils/common';

  let musicQualityArr = ['普通', '较高', '极高', '无损'];

  function switchScrollFun(e) {
    restoreScrollStore.set(e.detail.cellCheck);
    localStorage.setItem('restoreScroll', e.detail.cellCheck ? '1' : '0');
  }
  function switchCommentFun(e) {
    isShowCommentStore.set(e.detail.cellCheck ? '1' : '0');
    localStorage.setItem('isShowComment', e.detail.cellCheck ? '1' : '0');
  }
  function brFun() {
    push('/brSelect');
  }
  function translateFun(e) {
    isShowTranslateStore.set(e.detail.cellCheck);
    localStorage.setItem('isShowTranslate', e.detail.cellCheck ? '1' : '0');
  }
  function logoutFun() {
    Confirm('确定退出当前账号？', async () => {
      const res = await logout();
      if (res.code === 200) {
        localStorage.clear();
        isLoginStore.set(false);
        clearAllCookie();
        pop();
      }
    });
  }
  //清除所有cookie函数
  function clearAllCookie() {
    let keys = document.cookie.match(/[^ =;]+(?=\=)/g);
    if (keys) {
      for (let i = keys.length; i--; ) document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString();
    }
  }
  function aboutFun() {
    push('/about');
  }
  function versionFun() {
    push('/version');
  }
  function visualizerFun(e) {
    showVisualizerStore.set(e.detail.cellCheck ? '1' : '0');
    localStorage.setItem('showVisualizer', e.detail.cellCheck ? '1' : '0');
  }
</script>

<NavBar title="设置" />

<div class="setting-page">
  <!-- 设置 -->
  <Cell title="播放音质" on:cellClick={brFun} desc={musicQualityArr[Number($musicQualityStore)]} arrow={true} />
  <Cell
    title="热评"
    on:cellClick={switchCommentFun}
    desc="Switch"
    cellCheck={$isShowCommentStore === '0' ? false : true}
  />
  <Cell title="显示歌词翻译" on:cellClick={translateFun} desc="Switch" cellCheck={$isShowTranslateStore} />
  <Cell
    title="自动滚动"
    titleDesc="导航返回上一页后自动滚动到之前的位置"
    on:cellClick={switchScrollFun}
    desc="Switch"
    cellCheck={$restoreScrollStore}
  />
  <Cell
    title="音乐动效"
    titleDesc="如果卡顿请关闭"
    on:cellClick={visualizerFun}
    desc="Switch"
    cellCheck={$showVisualizerStore === '1' ? true : false}
  />
  <Cell title="关于" on:cellClick={aboutFun} arrow={true} />
  <Cell title="版本记录" on:cellClick={versionFun} arrow={true} />
  <div class="bottom">
    <Button on:BtnClick={logoutFun}>退出登录</Button>
  </div>
  <div class="version">V 1.0.1</div>
</div>

<style>
  .setting-page {
    padding: 50px 20px 70px;
    font-size: 16px;
  }
  .bottom {
    margin: 20px auto;
  }
  .version {
    margin: 20px auto;
    font-size: 12px;
    text-align: center;
    color: rgb(141, 141, 141);
  }
</style>
