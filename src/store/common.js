import { writable } from 'svelte/store';

//是否展示底部TabBar
// export const isShowTabBarStore = writable(false);

//是否Loading
export const isLoadingStore = writable(false);

//用户是否登录
export const isLoginStore = writable(JSON.parse(localStorage.getItem('isLogin')) ? true : false);
//当前是否是Home页面，为了处理首页三个页面不频繁加载
export const isHomePageStore = writable(true);
//路由变化是否刷新页面
export const defaultResumableStore = writable(false);
//主页active
export const homeActiveStore = writable('1');
//自动滚动
export const restoreScrollStore = writable(localStorage.getItem('restoreScroll') === '0' ? false : true);
//音质
export const musicQualityStore = writable(
  localStorage.getItem('musicQuality') ? localStorage.getItem('musicQuality') : '0'
);
//是否显示歌词翻译
export const isShowTranslateStore = writable(localStorage.getItem('isShowTranslate') === '0' ? false : true);
//当前歌手详情 id，用于刷新歌手详情页
export const currentDetailSongerIdStore = writable(0);
//解决歌手全部歌曲不返回歌曲封面问题
export const coverImgUrlStore = writable('');
