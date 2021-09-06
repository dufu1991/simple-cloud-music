import Home from './pages/Home.svelte';
import PlayListDetail from './pages/PlayListDetail.svelte';
import Login from './pages/Login.svelte';
import TodayListDetail from './pages/TodayListDetail.svelte';
import LoveListDetail from './pages/LoveListDetail.svelte';
import MyAllPlayList from './pages/MyAllPlayList.svelte';
import Setting from './pages/Setting.svelte';
import Search from './pages/Search.svelte';
import SongerDetail from './pages/SongerDetail.svelte';
import BrSelect from './pages/BrSelect.svelte';
import MusicComment from './pages/MusicComment.svelte';
import AllCollectSongers from './pages/AllCollectSongers.svelte';
import SongerDesc from './pages/SongerDesc.svelte';
import MoreSonger from './pages/MoreSonger.svelte';
import MoreList from './pages/MoreList.svelte';
import MoreSong from './pages/MoreSong.svelte';
import About from './pages/About.svelte';
import Version from './pages/Version.svelte';

const routes = {
  '/playlistdetail': PlayListDetail,
  '/todayListDetail': TodayListDetail,
  '/loveListDetail': LoveListDetail,
  '/myAllPlayList': MyAllPlayList,
  '/login': Login,
  '/setting': Setting,
  '/search': Search,
  '/songerDetail': SongerDetail,
  '/brSelect': BrSelect,
  '/musicComment': MusicComment,
  '/allCollectSongers': AllCollectSongers,
  '/songerDesc': SongerDesc,
  '/moreSonger': MoreSonger,
  '/moreList': MoreList,
  '/moreSong': MoreSong,
  '/about': About,
  '/version': Version,
  '*': Home,
};

export default routes;
