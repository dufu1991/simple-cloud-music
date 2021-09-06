<script>
  import { createEventDispatcher } from "svelte";
  import { CheckboxBlankCircleLine, RadioButtonLine } from "svelte-remixicon";

  export let radioData = [];
  export let active = 0;

  const dispatch = createEventDispatcher();

  function selectFun(index) {
    active = index;
    dispatch("RadioClick", { active });
  }
</script>

<div class="box">
  {#each radioData as item, i}
    <div class="item" on:click={() => selectFun(i)}>
      <div class="left">
        {#if active === i}
          <RadioButtonLine size="20" color="var(--primary-text-color)" style="vertical-align: middle;" />
        {:else}
          <CheckboxBlankCircleLine size="20" color="rgb(214, 214, 214)" style="vertical-align: middle;" />
        {/if}
      </div>
      <div class="text">
        {item.text}
        <div class="desc">{item.desc}</div>
      </div>
    </div>
  {/each}
</div>

<style>
  .box {
    background-color: #fff;
    font-size: 16px;
    border-radius: 8px;
    padding: 20px 10px 1px;
    margin: 20px auto;
  }
  .item {
    margin-bottom: 20px;
    display: flex;
  }
  .left {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }
  .text {
    line-height: 20px;
  }
  .desc {
    font-size: 10px;
    color: #b8b8b8;
  }
</style>
