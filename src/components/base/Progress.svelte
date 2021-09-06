<script>
  import { onMount, afterUpdate, createEventDispatcher } from 'svelte';

  export let min = 0;
  export let max = 100;
  export let step = 1;
  export let current = 0;
  export let timeCurrent = 0;
  let currentLong = 0;
  let slider;
  let scale = 0;
  let movePoint = 20;

  const dispatch = createEventDispatcher();

  onMount(() => {
    scale = slider.clientWidth / (max / step);
  });
  afterUpdate(() => {
    currentLong = current;
  });
  function setCurrent() {
    dispatch('setCurrent', {
      current,
    });
  }
  function setTimeCurrent() {
    dispatch('setTimeCurrent', {
      timeCurrent,
    });
  }
  function handleClick(e) {
    const distance = e.clientX - slider.getBoundingClientRect().left;
    const value = Math.round(distance / scale) * step;
    current = currentLong = value;
    setCurrent();
  }
  function touchStart(e) {
    movePoint = e.changedTouches[0].clientX;
  }
  function touchEnd(e) {
    movePoint = e.changedTouches[0].clientX;
    if (movePoint <= 20) {
      current = timeCurrent = currentLong = min;
    } else if (movePoint >= 355) {
      current = timeCurrent = currentLong = max;
    } else {
      current = timeCurrent = currentLong = ((movePoint - 20) / 335) * 100;
    }
    setCurrent();
    setTimeCurrent();
  }
  function touchMove(e) {
    movePoint = e.changedTouches[0].clientX;
    if (movePoint <= 20) {
      timeCurrent = currentLong = min;
    } else if (movePoint >= 355) {
      timeCurrent = currentLong = max;
    } else {
      timeCurrent = currentLong = ((movePoint - 20) / 335) * 100;
    }
    setTimeCurrent();
  }
</script>

<div
  bind:this={slider}
  class="slider"
  on:click={handleClick}
  on:touchstart={touchStart}
  on:touchmove={touchMove}
  on:touchend={touchEnd}
>
  <div class="rail">
    <div class="ball" style="left:calc({(currentLong / max) * 100}% - 7px)" />
    <div class="fill" style="transform:scaleX({currentLong / max})" />
  </div>
</div>

<style>
  .slider {
    position: relative;
    width: 100%;
    height: 20px;
    display: flex;
    align-items: center;
  }
  .rail {
    width: 100%;
    height: 4px;
    overflow: hidden;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.4);
  }
  .fill {
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: #fff;
    transform: scaleX(0);
    transform-origin: left;
    transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
    -webkit-transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .ball {
    width: 14px;
    height: 14px;
    border-radius: 10px;
    background: #fff;
    position: absolute;
    top: calc(50% - 7px);
  }
</style>
