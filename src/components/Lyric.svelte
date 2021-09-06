<script>
  import { onMount } from 'svelte';

  import { currentTimeStore, currentLyricStore } from '../store/play';
  import { isShowTranslateStore } from '../store/common';

  import { scrollSmoothTo } from '../utils/common';

  export let maxHeight = '';

  $: lyric = $currentLyricStore.lyric;
  $: tlyric = $isShowTranslateStore ? $currentLyricStore.tlyric : '';
  $: lyricArr = [];
  $: tlyricArr = [];
  $: lyricArrStartAndEnd = [];
  $: currentIndex = 0;
  $: itemHeightList = [];
  let boxDom;
  let scrollTimer = null;
  $: isBlue = true;

  onMount(() => {
    //监听歌词滚动事件
    lyricArr = formatLyric(lyric);
    //去除开始的作者
    if (tlyric.slice(1, 3) === 'by') {
      tlyric = tlyric.slice(tlyric.indexOf('\n') + 1);
    }
    //处理有些翻译竟然没时间标注！！
    if (tlyric.slice(0, 1) !== '[') {
      tlyric = '';
    }
    //处理有些歌词翻译竟然只有时间没内容，如《追光者》《匆匆那年》，翻译你妹呢！
    let textArr = tlyric.split('\n');
    let isAllNull = false;
    for (let t = 0; t < textArr.length; t++) {
      if (textArr[t].substring(textArr[t].length - 1) != ']') {
        isAllNull = false;
      } else {
        isAllNull = true;
      }
    }
    if (isAllNull) tlyric = '';
    if (tlyric.trim() !== '') tlyricArr = formatLyric(tlyric);
    if (tlyric.trim() !== '') {
      if (lyricArr[0].time !== 0) {
        lyricArr.unshift({ time: 0, text: '• • •' });
      }
      if (tlyricArr[0].time !== 0) {
        tlyricArr.unshift({ time: 0, text: '• • •' });
      }
      for (let e = 0; e < lyricArr.length; e++) {
        for (let r = 0; r < tlyricArr.length; r++) {
          if (lyricArr[e].time === tlyricArr[r].time) lyricArr[e].text_t = tlyricArr[r].text;
          if (lyricArr[e].text_t === undefined) lyricArr[e].text_t = '• • •';
        }
      }
      lyricArrStartAndEnd = lyricArr.length > 0 ? timeAdd(lyricArr) : [];
      for (let r = 0; r < lyricArr.length; r++) {
        itemHeightList.push(
          40 + textSize('28px', lyricArr[r].text).height + textSize('16px', lyricArr[r].text_t).height
        );
      }
    } else {
      lyricArrStartAndEnd = lyricArr.length > 0 ? timeAdd(lyricArr) : [];
      for (let r = 0; r < lyricArrStartAndEnd.length; r++) {
        itemHeightList.push(textSize('28px', lyricArrStartAndEnd[r].text).height + 40);
      }
    }
    autoScrollFun();
  });
  //自动滚动
  function autoScrollFun() {
    scrollTimer = setInterval(() => {
      if (boxDom) {
        for (let y = 0; y < lyricArrStartAndEnd.length - 1; y++) {
          if (Math.ceil($currentTimeStore) >= lyricArrStartAndEnd[lyricArrStartAndEnd.length - 1].start) {
            currentIndex = lyricArrStartAndEnd.length - 1;
            boxDom.scrollTop = boxDom.scrollHeight - boxDom.clientHeight;
          }
          if (
            Math.ceil($currentTimeStore) >= lyricArrStartAndEnd[y].start &&
            Math.ceil($currentTimeStore) < lyricArrStartAndEnd[y].end
          ) {
            currentIndex = y;
            boxDom.scrollIntoView({
              block: 'start',
              behavior: 'smooth',
            });
            if (currentIndex === 0) {
              if ('scrollBehavior' in boxDom.style) {
                boxDom.scrollTop = 0;
              } else {
                scrollSmoothTo(boxDom, 0);
              }
            } else {
              if ('scrollBehavior' in boxDom.style) {
                boxDom.scrollTop = sum(itemHeightList.slice(0, currentIndex - 1));
              } else {
                scrollSmoothTo(boxDom, sum(itemHeightList.slice(0, currentIndex - 1)));
              }
            }
          }
        }
      }
    }, 1000);
  }
  function sum(arr) {
    if (Array.isArray(arr)) {
      var arrSum = 0;
      for (var i = 0; i < arr.length; i++) {
        arrSum += arr[i];
      }
      return arrSum;
    }
  }
  //传入初始歌词文本text
  function formatLyric(text) {
    //去除开始的作者
    if (text.slice(1, 3) === 'by') {
      text = text.slice(text.indexOf('\n') + 1);
    }
    let lyricNew = [];
    let arr = text.split('\n'); //原歌词文本已经换好行了方便很多，我们直接通过换行符“\n”进行切割
    let row = arr.length; //获取歌词行数
    for (let i = 0; i < row; i++) {
      let temp_row = arr[i]; //现在每一行格式大概就是这样"[00:04.302][02:10.00]hello world";
      let temp_arr = temp_row.split(']'); //我们可以通过“]”对时间和文本进行分离
      let text = temp_arr.pop(); //把歌词文本从数组中剔除出来，获取到歌词文本了！
      //再对剩下的歌词时间进行处理
      temp_arr.forEach(element => {
        let obj = {};
        let time_arr = element.substr(1, element.length - 1).split(':'); //先把多余的“[”去掉，再分离出分、秒
        let s = Math.ceil(time_arr[0]) * 60 + Math.ceil(time_arr[1]); //把时间转换成与currentTime相同的类型，方便待会实现滚动效果
        obj.time = s > 0 ? s - 1 : s; //歌词转换成整秒之后会有延迟，提前一秒
        obj.text = text.trim(); //去除前后空格，不然计算高度有问题
        lyricNew.push(obj); //每一行歌词对象存到组件的lyric歌词属性里
      });
    }
    if (lyricNew.length === 1) {
      lyricNew = [
        {
          time: 0,
          text: lyricNew[0].text,
        },
        {
          time: 0,
          text: lyricNew[0].text,
        },
      ];
    }
    if (lyricNew === []) return [];
    for (let u = 0; u < lyricNew.length; u++) {
      if (lyricNew[u].text === '') lyricNew[u].text = '• • •';
    }
    if (lyricNew.length > 0) {
      if (lyricNew[0].time > 5) {
        lyricNew.splice(0, 0, { time: 0, text: '• • •' });
      }
    }
    for (let i = lyricNew.length - 1; i > 0; i--) {
      if (lyricNew[i].time - lyricNew[i - 1].time < 2 && lyricNew[i - 1].text === '• • •') {
        lyricNew.splice(i - 1, 1);
      }
    }
    for (let d = lyricNew.length - 1; d > 0; d--) {
      if (lyricNew[d - 1].time === lyricNew[d].time) {
        lyricNew[d - 1].text = lyricNew[d - 1].text + ' ' + lyricNew[d].text;
        lyricNew.splice(d, 1);
      }
    }
    // 开头，两条时间都是一样的情况，合并为一条
    if (lyricNew.length > 1 && lyricNew[0].time === lyricNew[1].time) {
      lyricNew[0].text = lyricNew[0].text + ' ' + lyricNew[1].text;
      lyricNew.splice(1, 1);
    }
    //去除某些歌词结尾是• • •的情况
    for (let q = 0; q < lyricNew.length; q++) {
      if (lyricNew[q].text.substring(lyricNew[q].text.length - 5) === '• • •' && lyricNew[q].text != '• • •') {
        lyricNew[q].text = lyricNew[q].text.substr(0, lyricNew[q].text.length - 5);
      }
    }
    lyricNew.sort(sortRule); //由于不同时间的相同歌词我们给排到一起了，所以这里要以时间顺序重新排列一下
    return lyricNew.length === 0 ? [{ time: 0, text: '暂无歌词或歌词无效', start: 0, end: 20 }] : lyricNew;
  }
  function timeAdd(arr) {
    for (let t = 0; t < arr.length - 1; t++) {
      arr[t].start = arr[t].time;
      arr[t].end = arr[t + 1].time;
    }
    arr[arr.length - 1].start = arr[arr.length - 1].time;
    return arr;
  }
  function sortRule(a, b) {
    //设置一下排序规则
    return a.time - b.time;
  }
  function textSize(fontSize, text) {
    let div = document.createElement('div');
    let result = {};
    result.width = div.offsetWidth;
    result.height = div.offsetHeight;
    div.style.visibility = 'hidden';
    div.style.fontSize = fontSize;
    // div.style.fontFamily =
    //   '"PingFang SC", "Lantinghei SC", "Microsoft YaHei", "HanHei SC","Helvetica Neue", "Open Sans", Arial, "Hiragino Sans GB", "微软雅黑",STHeiti, "WenQuanYi Micro Hei", SimSun, sans-serif';
    div.style.padding = '20px';
    div.style.wordWrap = 'break-word';
    div.style.fontWeight = 'bold';
    div.style.textAlign = 'justify';
    document.body.appendChild(div);
    if (typeof div.textContent != 'undefined') {
      div.textContent = text;
    } else {
      div.innerText = text;
    }
    result.width = parseFloat(window.getComputedStyle(div).width) - result.width;
    result.height = parseFloat(window.getComputedStyle(div).height) - result.height;
    div.style.display = 'none';
    return result;
  }
  function touchStart(e) {
    isBlue = false;
    if (scrollTimer) clearInterval(scrollTimer);
    scrollTimer = null;
  }
  function touchMove(e) {}
  function touchEnd(e) {
    isBlue = true;
    if (scrollTimer) clearInterval(scrollTimer);
    scrollTimer = null;
    autoScrollFun();
  }
  //iOS平滑滚动
  function myScrollTo(dom, position, timeout) {
    let scrollTop = dom.scrollTop;
    let direction = position - scrollTop > 0 ? 1 : -1;
    let distance = Math.abs(position - scrollTop);
    let split = distance / 50;
    let _timeout;
    if (position !== scrollTop) {
      timeout = timeout || 1000;
      split *= direction;

      _timeout = setInterval(function () {
        if (!isBlue) {
          if (_timeout) clearInterval(_timeout);
          _timeout = null;
        }
        scrollTop += split;
        distance -= Math.abs(split);
        if (0 >= distance) {
          dom.scrollTo(0, position);
          clearInterval(_timeout);
          _timeout = null;
        } else {
          dom.scrollTo(0, scrollTop);
        }
      }, timeout / 100);
    }
  }
</script>

<div class="xbox">
  <div
    class="box"
    style="max-height:{maxHeight}"
    bind:this={boxDom}
    on:touchstart={touchStart}
    on:touchend={touchEnd}
    on:touchmove={touchMove}
  >
    {#each lyricArr as lyric, i}
      <div
        class="ly"
        class:active={i === currentIndex}
        style="filter: {isBlue && i !== currentIndex
          ? `blur(${Math.abs(i - currentIndex) < 7 ? Math.abs(i - currentIndex) * 1 : 0}px)`
          : 'none'};
      -webkit-filter: {isBlue && i !== currentIndex
          ? `blur(${Math.abs(i - currentIndex) < 7 ? Math.abs(i - currentIndex) * 1 : 0}px)`
          : 'none'};
      "
      >
        <div>{lyric.text}</div>
        {#if tlyric.trim() !== ''}
          <div class="t-text">{lyric.text_t}</div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .box {
    overflow-y: scroll;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: auto;
  }
  .ly {
    word-wrap: break-word;
    font-size: 28px;
    font-weight: bold;
    color: #fff;
    padding: 20px;
    transition: all 0.5s ease-in;
    -webkit-transition: all 0.5s ease-in;
    opacity: 0.5;
    filter: blur(1px);
    -webkit-filter: blur(1px);
    text-align: justify;
  }
  .active {
    opacity: 1;
    filter: none;
    -webkit-filter: none;
  }
  .t-text {
    font-size: 16px;
  }
</style>
