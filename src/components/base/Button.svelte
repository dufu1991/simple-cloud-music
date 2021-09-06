<script>
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  import { ripple } from '../../utils/common';

  export let type = 'default'; //primary
  const dispatch = createEventDispatcher();
  function setClick() {
    dispatch('BtnClick');
  }

  let btnDom;

  onMount(() => {
    if (btnDom) {
      ripple(btnDom);
    }
  });
</script>

<button
  on:click={setClick}
  class="botton"
  class:default={type === 'default'}
  class:primary={type === 'primary'}
  bind:this={btnDom}
>
  <slot />
</button>

<style>
  .botton {
    text-align: center;
    align-items: center;
    width: 100%;
    margin: auto;
    height: 46px;
    line-height: 46px;
    background: var(--primary-text-color);
    color: #fff;
    border-radius: 6px;
    border: none;
    font-size: 16px;
    font-weight: bold;
  }
  .default {
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
  }
  .primary {
    background: var(--primary-text-color);
    color: #fff;
  }
</style>
