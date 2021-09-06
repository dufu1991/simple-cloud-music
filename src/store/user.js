import { writable } from "svelte/store";

//用户信息
export const userInfoStore = writable(
  JSON.parse(localStorage.getItem("isLogin"))
    ? JSON.parse(localStorage.getItem("userInfo"))
    : {}
);

//用户喜欢的音乐IDs
export const userLikeSongIdsStore = writable(
  JSON.parse(localStorage.getItem("useLoveSongIds"))
    ? JSON.parse(localStorage.getItem("useLoveSongIds"))
    : []
);
//我喜欢的音乐歌单ID
export const userLikeListIdStore = writable(
  JSON.parse(localStorage.getItem("userLikeListId"))
    ? JSON.parse(localStorage.getItem("userLikeListId"))
    : ''
);
