<script>
  import { createEventDispatcher } from 'svelte';

  export let check = false;
  const dispatch = createEventDispatcher();
  function setChange() {
    dispatch('switchClick', {
      check: !check,
    });
  }
</script>

<div
  class="box"
  on:click={setChange}
  style="background-color:{check ? 'var(--primary-text-color)' : 'rgb(177, 177, 177)'}"
>
  <div class="ball" style="left: {check ? '25px' : '1px'};" />
</div>

<style>
  .box {
    display: inline-block;
    width: 46px;
    height: 22px;
    background-color: rgb(177, 177, 177);
    position: relative;
    border-radius: 11px;
    transition: all 0.3s ease;
    -webkit-transition: all 0.3s ease;
  }
  .ball {
    width: 20px;
    height: 20px;
    border-radius: 10px;
    background-color: #fff;
    position: absolute;
    top: 1px;
    left: 1px;
    transition: all 0.3s ease;
    -webkit-transition: all 0.3s ease;
  }
</style>
