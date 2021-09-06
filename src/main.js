import App from './App.svelte';

localStorage.setItem('isShowToast', '0');
if (localStorage.getItem('searchkeywords')) {
  if (localStorage.getItem('searchkeywords').length > 10000) localStorage.removeItem('searchkeywords');
}

//按照750设计稿宽度处理font-size，方便开发尺寸
const oHtml = document.documentElement;
const clientWidth = oHtml.clientWidth;
const vM = 750;
const vfontSize = 100;
// 移动设备
oHtml.style.fontSize = (vfontSize * clientWidth) / vM + 'px';
localStorage.setItem('fullWidth', clientWidth);

const app = new App({
  target: document.body,
  props: {
    name: 'world',
  },
});

export default app;
