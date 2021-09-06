<script>
  import { createEventDispatcher } from "svelte";

  import Divider from "./Divider.svelte";

  export let list = [];
  export let title = "请选择";
  export let isShow = false;

  const dispatch = createEventDispatcher();

  function liClickFun(index, item) {
    dispatch("PickerClick", {
      index,
      item,
    });
  }
  function changeShowFun() {
    isShow = false;
    dispatch("ChangeShow", {
      isShow,
    });
  }
</script>

<div class="pick-mask" on:click={changeShowFun} style="display: {isShow ? 'block' : 'none'};">
  <div class="pick" style="bottom:{isShow ? '0px' : '-350px'}">
    <div class="btn">
      <!-- <div class="btn-item btn-left">取消</div> -->
      <div class="btn-item btn-center">{title}</div>
      <!-- <div class="btn-item btn-right">确定</div> -->
    </div>
    <Divider />
    <div class="roller">
      {#each list as l, i}
        <div class="li" on:click={() => liClickFun(i, l)}>{l.name}</div>
      {/each}
    </div>
  </div>
</div>

<style>
  .pick-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2000;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
  }
  .pick {
    font-size: 16px;
    position: fixed;
    bottom: 0px;
    z-index: 2001;
    background-color: #fff;
    max-height: 250px;
    width: 100%;
    padding-bottom: 20px;
  }
  .btn {
    height: 39px;
    line-height: 39px;
    display: flex;
  }
  .btn-item {
    flex: 1;
    padding: 10px;
    color: var(--primary-text-color);
  }
  .btn-center {
    text-align: center;
    color: #777;
  }

  .roller {
    overflow-y: scroll;
    max-height: 200px;
    width: 100%;
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
  }
  .li {
    background-color: #eeeeee;
    line-height: 24px;
    font-size: 12px;
    margin: 4px 8px 4px 0;
    padding: 4px 8px;
    border-radius: 4px;
  }
</style>
