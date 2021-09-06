<script>
  export let tipTextList = "";
</script>

<div>
  {#each tipTextList as tipText}
    <div class="tip">{tipText}</div>
  {/each}
</div>

<style>
  .tip {
    font-size: 12px;
    color: rgb(141, 141, 141);
    text-align: justify;
  }
</style>
