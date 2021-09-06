import { get } from 'svelte/store';
import axios from 'axios';
import Cookies from 'js-cookie';
import { isLoadingStore } from '../store/common';
import { Alert } from './common';

let baseURL = ENV === 'development' ? 'http://xx.xx.xx.xx:3000/' : '/api/';

const service = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

service.interceptors.request.use(function (config) {
  if (!config.params) config.params = {};
  //开发环境增加cookie，避免跨域301错误
  if (config.params.cookie) {
    config.params.cookie = config.params.cookie;
  } else if (baseURL[0] !== '/') {
    config.params.cookie = `MUSIC_U=${Cookies.get('MUSIC_U')};`;
  }
  if (!config.isHideLoading) {
    if (!get(isLoadingStore)) {
      isLoadingStore.set(true);
    }
  }
  return config;
});

service.interceptors.response.use(
  response => {
    isLoadingStore.set(false);
    const res = response.data;
    if (res.code === 200) {
      return res;
    } else if (res.code === 800) {
      return res;
    } else if (res.code === 801) {
      return res;
    } else if (res.code === 802) {
      return res;
    } else if (res.code === 803) {
      return res;
    } else {
      if (res.code) {
        Alert(
          response.config.url + '-' + res.code + '：' + (res.message ? res.message : res.msg ? res.msg : '未知错误')
        );
        return res;
      } else {
        Alert(response + '：' + response);
        return res;
      }
    }
  },
  error => {
    isLoadingStore.set(false);
    //签到不做报错处理
    if (error.response.config.url != '/daily_signin') {
      Alert(
        error.response.data.code +
          '：' +
          (error.response.data.message
            ? error.response.data.message
            : error.response.data.msg
            ? error.response.data.msg
            : '未知错误')
      );
      return  error.response.data;
     
      // Promise.then(error => {
      //   console.log(333, error);
      // });
      // return Promise.reject(error);
    }
  }
);

export default service;
