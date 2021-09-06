<script>
  import md from '../../README.md';
  import { NavBar } from '../components/base';
</script>

<NavBar title="关于" />
<div class="about">
  <div id="markdown">{@html md}</div>
</div>

<style>
  .about {
    padding: 50px 0px 70px;
  }
</style>
