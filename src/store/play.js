import { writable } from 'svelte/store';

//播放器播放与暂停状态。true/false
export const playStatusStore = writable(false);
//播放器是否显示最大化。true/false
export const playIsMaxStore = writable(false);
//底部是否显示播放控制条，首次打开无歌曲播放时不显示。true/false
export const playIsMinStore = writable(true);
//当前播放歌曲信息
export const currentSongStore = writable(
  JSON.parse(localStorage.getItem('currentSong'))
    ? JSON.parse(localStorage.getItem('currentSong'))
    : {
        name: '简易云音乐',
        al: {
          picUrl: '/images/defaultCover.png',
        },
        url: 'https://m8.music.126.net/20210907010112/541ee038536db12045e4a99d565becd8/ymusic/5614/195d/ad51/33fff191fffc2fd5da6c94d71e7777ef.mp3',
        ar: [{ name: '简易云音乐' }],
      }
);
//下一曲播放歌曲信息
export const nextSongStore = writable({});
//当前播放歌曲在播放列表位置
export const currentSongIndexStore = writable(0);
//正在播放的播放列表
export const currentPlayListStore = writable([
  JSON.parse(localStorage.getItem('currentSong'))
    ? JSON.parse(localStorage.getItem('currentSong'))
    : {
        name: '简易云音乐',
        al: {
          picUrl: '/images/defaultCover.png',
        },
        url: 'https://m8.music.126.net/20210907010112/541ee038536db12045e4a99d565becd8/ymusic/5614/195d/ad51/33fff191fffc2fd5da6c94d71e7777ef.mp3',
        ar: [{ name: '简易云音乐' }],
      },
]);
//是否在加载歌曲
export const isLoadingSongStore = writable(false);
//全屏播放器顶部距离页面顶部的距离
export const maxPlayToTopStore = writable('100%');

//是否正在私人FM播放
export const isFMPlayStore = writable(localStorage.getItem('isFMPlay') === '1' ? true : false);
//私人FM当前播放
export const FMPlayStore = writable(
  JSON.parse(localStorage.getItem('FMPlay')) ? JSON.parse(localStorage.getItem('FMPlay')) : {}
);
//私人FM下一首播放
export const FMPlayNextStore = writable({});
//播放时间
export const currentTimeStore = writable('');
//当前歌曲歌词
export const currentLyricStore = writable(
  JSON.parse(localStorage.getItem('currentLyric'))
    ? JSON.parse(localStorage.getItem('currentLyric'))
    : {
        songId: '',
        lyric: '',
        tlyric: '',
      }
);
//播放器主要区域显示的内容，cover--歌曲封面；list--播放列表；lyric--歌词
export const mainCoverTypeStore = writable('cover');
//播放模式，repeat--列表循环，repeatOnce--单曲循环，shuffle--随机，heart--心动模式
export const playRepeatModelStore = writable('repeat');
//当前歌曲码率
export const currentSongQualityStore = writable(128000);
//音频可视化
export const showVisualizerStore = writable(localStorage.getItem('showVisualizer') === '1' ? '1' : '0');
