import { writable } from "svelte/store";

//歌单ID
export const playListIdStore = writable("");

//歌单详情
export const playListDetailStore = writable({});

//今日推荐歌曲列表
export const todayListStore = writable([]);
