<script>
  import { onMount, createEventDispatcher } from 'svelte';

  export let label = 'label';
  export let type = 'text';
  export let maxlength = 15;
  export let placeholder = null;
  export let value = '';
  export let rightBtn = false;
  export let btnText = '获取验证码';
  $: defatltPlaceholder = '请输入' + label;
  let inputDom;

  const dispatch = createEventDispatcher();

  onMount(() => {
    setTimeout(function () {
      inputDom.scrollIntoView(true);
      inputDom.scrollIntoViewIfNeeded();
    }, 300);
    inputDom.type = type;
  });
  function setInput() {
    dispatch('setInput', {
      value,
    });
  }
  function btnClick() {
    dispatch('setBtn');
  }
</script>

<div class="box">
  <div class="label">{label}</div>
  <input
    bind:value
    bind:this={inputDom}
    {maxlength}
    on:input={setInput}
    placeholder={placeholder ? placeholder : defatltPlaceholder}
    style="width:{rightBtn ? '75%' : '100%'}"
  />
  {#if rightBtn}
    <span class="right-btn" on:click={btnClick}>{btnText}</span>
  {/if}
</div>

<style>
  .right-btn {
    font-size: 10px;
    border-radius: 4px;
    border: 1px solid rgb(182, 182, 182);
    line-height: 24px;
    padding: 0 4px;
    float: right;
  }
  .box {
    width: 80%;
    margin: auto;
    padding: 14px;
    overflow: hidden;
  }
  .label {
    font-size: 14px;
    margin-bottom: 6px;
    color: rgb(139, 139, 139);
  }
  input {
    padding: 0;
    box-shadow: none;
    outline: none;
    -webkit-appearance: none;
    border-radius: 0;
    font-size: 18px;
    line-height: 24px;
    border-top: none;
    border-left: none;
    border-right: none;
    width: 100%;
    background: none;
    border-bottom: 1px solid var(--secondary-dark-text-color);
  }
  input::-webkit-input-placeholder {
    font-size: 16px;
  }
  input:focus {
    box-shadow: none;
    outline: none;
    -webkit-appearance: none;
    border-radius: 0;
    border-bottom: 1px solid var(--primary-text-color);
  }
</style>
