<script>
  import { onMount, onDestroy } from 'svelte';
  import { pop } from 'svelte-stack-router';
  import md5 from 'crypto-js/md5';
  import { LinksLine } from 'svelte-remixicon';
  import QrCode from 'svelte-qrcode';

  import { NavBar, Input, Button } from '../components/base';

  import { isHomePageStore, isLoginStore } from '../store/common';
  import { playIsMinStore } from '../store/play';
  import { userInfoStore, userLikeSongIdsStore, userLikeListIdStore } from '../store/user';

  import { loginWithPhone, loginWithEmail, loginQrCodeKey, loginQrCodeCreate, loginQrCodeCheck } from '../api/auth';
  import { userPlaylist, userLikedSongsIDs, likedArtists, userAccount, sendSmsCode } from '../api/user';

  import { setCookies, Alert, Toast } from '../utils/common';

  let timerLogin = null;
  let phone = '';
  let email = '';
  let password_phone = '';
  let password_email = '';
  let code_phone = '';
  let type = 'phone';
  $: phoneType = 'code'; //code--短信验证，pwd--密码验证
  let tiptext =
    '您的密码会进行 MD5 加密后再传输到网易云 API。「简易云音乐」不会传输您的账号数据到任何非网易云音乐官方服务器。本工程源码已开源，可随时到 https://github.com/dufu1991/simple-cloud-music 查看验证逻辑。实在不放心建议使用短信验证或二维码登录。';
  $: loginType = type === 'qr' ? '二维码登录' : type === 'phone' ? '手机号登录' : '邮箱登录';
  $: qrImg = '';
  $: qrTip = '请扫码';
  $: btnText = '获取验证码';
  function loginSuccFun(res) {
    //登录成功
    setCookies(res.cookie);
    userInfoStore.set(res);
    localStorage.setItem('userInfo', JSON.stringify(res));
    userPlaylistFun(res);
  }
  //手机号登录
  async function getClickPhone() {
    if (!isPhone(phone)) {
      Toast('请输入正确的手机号');
    } else if (phoneType === 'code' && code_phone.length != 4) {
      Toast('请输入四位验证码');
    } else {
      let params = {};
      if (phoneType === 'code') {
        //验证码验证
        params = {
          phone,
          captcha: code_phone,
          password: 'fakePassword',
        };
      } else {
        //密码验证
        params = {
          phone,
          md5_password: password_phone,
          password: 'fakePassword',
        };
      }
      const res = await loginWithPhone(params);
      if (res.code === 200) {
        loginSuccFun(res);
      } else {
        Alert('登录不成功, 请重新登录。');
      }
    }
  }
  //邮箱登录
  async function getClickEmail() {
    const res = await loginWithEmail({
      email,
      md5_password: password_email,
      password: 'fakePassword',
    });
    if (res.code === 200) {
      loginSuccFun(res);
    } else {
      Alert('登录不成功, 请重新登录。');
    }
  }
  onMount(() => {
    isHomePageStore.set(false);
    playIsMinStore.set(false);
  });
  onDestroy(() => {
    playIsMinStore.set(true);
  });
  function getpassword_phone(e) {
    password_phone = md5(e.detail.value).toString();
  }
  function getcode_phone(e) {
    code_phone = e.detail.value.toString();
  }
  function getpassword_email(e) {
    email_phone = md5(e.detail.value).toString();
  }
  function getPhone(e) {
    phone = e.detail.value;
  }
  function getEmail(e) {
    email = e.detail.value;
  }
  async function userPlaylistFun(login) {
    //获取用户收藏歌单ID列表,用于判断是否已经收藏
    const res = await userPlaylist({
      uid: login.account.id,
      limit: 10000,
      offset: 0,
    });
    if (res.code === 200) {
      let ids = [];
      for (let i = 0; i < res.playlist.length; i++) {
        ids.push(res.playlist[i].id);
      }

      if (
        res.playlist[0].creator.userId === $userInfoStore.account.id &&
        res.playlist[0].name.substr(-5) === '喜欢的音乐'
      ) {
        userLikeListIdStore.set(res.playlist[0].id);
        localStorage.setItem('userLikeListId', res.playlist[0].id);
      }

      localStorage.setItem('usePlayListIds', JSON.stringify(ids));
      userLikedSongsIDsFun(login);
    } else {
      Alert('获取收藏歌单失败');
    }
  }
  async function userLikedSongsIDsFun(login) {
    //获取用户喜爱歌曲ID列表,用于判断是否已经收藏
    const res = await userLikedSongsIDs(login.account.id);
    if (res.code === 200) {
      let ids = [];
      for (let i = 0; i < res.ids.length; i++) {
        ids.push(res.ids[i]);
      }
      isLoginStore.set(true);
      localStorage.setItem('isLogin', true);
      userLikeSongIdsStore.set(JSON.stringify(ids));
      localStorage.setItem('useLoveSongIds', JSON.stringify(ids));
      likedArtistsFun();
    } else {
      alert('获取喜爱歌曲失败');
    }
  }
  //获取收藏的歌手
  async function likedArtistsFun() {
    const res = await likedArtists({ limit: 2000 });
    if (res.code === 200) {
      let ids = [];
      for (let i = 0; i < res.data.length; i++) {
        ids.push(res.data[i].id);
      }
      localStorage.setItem('useLoveSongerIds', JSON.stringify(ids));
      setTimeout(() => {
        pop();
      }, 100);
    } else {
      alert('获取喜爱歌手失败');
    }
  }
  async function qrLoginFun() {
    type = 'qr';
    const res = await loginQrCodeKey();
    if (res.code === 200) {
      loginQrCodeCreateFun(res.data.unikey);
    }
  }
  async function loginQrCodeCreateFun(key) {
    const res = await loginQrCodeCreate({
      key,
    });
    if (res.code === 200) {
      qrImg = res.data.qrurl;
      timerLogin = setInterval(() => {
        loginQrCodeCheckFun(key);
      }, 1000);
    }
  }
  async function loginQrCodeCheckFun(key) {
    const res = await loginQrCodeCheck(key);
    if (res.code === 800) {
      qrTip = res.message;
    } else if (res.code === 801) {
      qrTip = res.message;
    } else if (res.code === 802) {
      qrTip = res.message;
    } else if (res.code === 803) {
      clearInterval(timerLogin);
      setTimeout(() => {
        userAccountFun(res.cookie);
      }, 300);
    } else {
      clearInterval(timerLogin);
    }
  }
  async function userAccountFun(cookie) {
    const res = await userAccount(cookie);
    if (res.code === 200) {
      let newres = res;
      newres.cookie = cookie;
      loginSuccFun(newres);
    }
  }
  async function sendSmsCodeFun() {
    if (btnText === '获取验证码') {
      if (!isPhone(phone)) {
        Toast('请输入正确的手机号');
      } else {
        const res = await sendSmsCode(phone);
        if (res.code === 200) {
          Toast('验证码已发送至' + phone.substring(phone.length - 4) + '，请注意查收！', 2000);
          setinter60();
        }
      }
    }
  }
  function setinter60() {
    let time = 59;
    let myTimer = setInterval(() => {
      time--;
      if (time === 0) {
        clearInterval(myTimer);
        btnText = '获取验证码';
      } else {
        btnText = time + 's 后重发';
      }
    }, 1000);
  }
  function isPhone(phone) {
    //手机号正则
    let mPattern = /^1[3-9]\d{9}$/;
    //返回 true or false
    return mPattern.test(phone);
  }
</script>

<NavBar title={loginType} />
<div class="login-page">
  <div class="desc">请使用网易云音乐账号登录</div>
  <div class="lead">
    <div class="netease">
      <img src="/images/nm_logo.png" alt="" />
    </div>
    <div class="arr">
      <LinksLine />
    </div>
    <div class="simple"><img src="/images/sm_logo.png" alt="" /></div>
  </div>
  {#if type === 'qr'}
    <div class="qr">
      <div class="qr-tip">{qrTip}</div>
      <div class="qrcode">
        <QrCode value={qrImg} />
      </div>
      <div class="tip">直接使用网易云音乐 APP 扫码登录，或截图保存之后使用网易云音乐 APP 扫码登录。</div>
      <div class="type-switch">
        <span
          on:click={() => {
            clearInterval(timerLogin);
            type = 'phone';
          }}
        >
          手机号登录
        </span>&nbsp;｜&nbsp;
        <span
          on:click={() => {
            clearInterval(timerLogin);
            type = 'email';
          }}
        >
          邮箱登录
        </span>
      </div>
    </div>
  {/if}
  {#if type === 'phone'}
    <div class="phone">
      <Input label="手机号" type="tel" maxlength="11" on:setInput={getPhone} />
      {#if phoneType === 'pwd'}
        <Input label="密码" type="password" maxlength="40" bind:password_phone on:setInput={getpassword_phone} />
      {/if}
      {#if phoneType === 'code'}
        <Input
          label="验证码"
          type="tel"
          maxlength="4"
          bind:code_phone
          rightBtn={true}
          {btnText}
          on:setInput={getcode_phone}
          on:setBtn={sendSmsCodeFun}
        />
      {/if}
      <div class="phone-switch">
        {#if phoneType === 'pwd'}
          <span
            on:click={() => {
              phoneType = 'code';
            }}
          >
            短信验证
          </span>{/if}
        {#if phoneType === 'code'}
          <span
            on:click={() => {
              phoneType = 'pwd';
            }}
          >
            密码验证
          </span>
        {/if}
      </div>
      <div class="btn">
        <Button on:BtnClick={getClickPhone} type="primary">登录</Button>
      </div>
      {#if phoneType === 'pwd'}
        <div class="tip">{tiptext}</div>
      {/if}
      <div class="type-switch">
        <span on:click={qrLoginFun}> 二维码登录 </span>&nbsp;｜&nbsp;
        <span
          on:click={() => {
            type = 'email';
            clearInterval(timerLogin);
          }}
        >
          邮箱登录
        </span>
      </div>
    </div>
  {/if}

  {#if type === 'email'}
    <div class="email">
      <Input label="邮箱" maxlength={30} type="text" on:setInput={getEmail} />
      <Input label="密码" type="password" maxlength="40" bind:password_email on:setInput={getpassword_email} />
      <div class="btn">
        <Button on:BtnClick={getClickEmail} type="primary">登录</Button>
      </div>
      <div class="tip">{tiptext}</div>
      <div class="type-switch">
        <span
          on:click={() => {
            clearInterval(timerLogin);
            type = 'phone';
          }}>手机号登录</span
        >&nbsp;｜&nbsp;
        <span on:click={qrLoginFun}>二维码登录</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .desc {
    font-size: 12px;
    text-align: center;
    color: #666;
    margin: 20px;
  }
  .qr-tip {
    text-align: center;
    margin: 20px auto;
  }
  .login-page {
    padding-top: 50px;
    font-size: 16px;
  }
  .btn {
    margin: 10px auto;
    width: 80%;
  }
  .qr {
    text-align: center;
  }
  .qrcode {
    margin: auto;
    width: 200px;
    height: 200px;
    background: cornflowerblue;
  }
  .tip {
    width: 80%;
    text-align: justify;
    font-size: 12px;
    line-height: 16px;
    margin: 20px auto;
    word-break: break-all;
  }
  .lead {
    text-align: center;
    align-items: center;
    margin: 20px auto;
    width: 50%;
    display: flex;
    justify-content: center;
  }
  .netease {
    flex: 1.5;
  }
  img {
    width: 100%;
  }
  .arr {
    color: rgb(139, 139, 139);
    flex: 1;
  }
  .simple {
    flex: 1.5;
  }
  .phone-switch {
    margin: 20px;
    text-align: center;
    color: var(--primary-text-color);
  }
  .type-switch {
    position: fixed;
    width: 100%;
    bottom: 40px;
    text-align: center;
    color: var(--primary-text-color);
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }
</style>
