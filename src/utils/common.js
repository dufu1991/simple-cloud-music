import Cookies from 'js-cookie';
import Emoji from './emoji';

// 设置MusicU cookie
export function setMusicU(key, value) {
  return Cookies.set(key, value);
}

// 设置cookie
export function setCookies(string) {
  const cookies = string.split(';;');
  cookies.map(cookie => {
    document.cookie = cookie;
  });
}

// 获取cookie
export function getCookies() {
  return document.cookie;
}

//时间戳转为时间
//format支持五种格式，'yyyy年MM月dd日'、'yyyyMMdd'、'yyyy-MM-dd'、'yyyy/MM/dd'、'yyyy-MM-dd hh:mm:ss'
export function formatTime(time, format = 'yyyy年MM月dd日') {
  const timer = new Date(time);
  const Y = timer.getFullYear();
  const M = timer.getMonth() + 1 < 10 ? '0' + (timer.getMonth() + 1) : timer.getMonth() + 1;
  const D = timer.getDate() < 10 ? '0' + timer.getDate() : timer.getDate();
  const h = timer.getHours() < 10 ? '0' + timer.getHours() : timer.getHours();
  const m = timer.getMinutes() < 10 ? '0' + timer.getMinutes() : timer.getMinutes();
  const s = timer.getSeconds() < 10 ? '0' + timer.getSeconds() : timer.getSeconds();
  switch (format) {
    case 'yyyy年MM月dd日':
      return `${Y}年${M}月${D}日`;
    case 'yyyyMMdd':
      return `${Y}${M}${D}`;
    case 'yyyy-MM-dd':
      return `${Y}-${M}-${D}`;
    case 'yyyy/MM/dd':
      return `${Y}/${M}/${D}`;
    case 'yyyy-MM-dd hh:mm:ss':
      return `${Y}-${M}-${D} ${h}:${m}:${s}`;
    default:
      console.log('format参数不对');
      break;
  }
}

/**歌曲详情中歌手数据为数组，此工具转换为字符拼接
 * @param {需要处理的数据数组} Array
 */
export function songerListToStr(arr = [], isObj = true) {
  let songerList = [];
  if (isObj) {
    for (let i = 0; i < arr.length; i++) {
      songerList.push(arr[i].name);
    }
    return songerList.join('/');
  } else {
    for (let i = 0; i < arr.length; i++) {
      songerList.push(arr[i]);
    }
    return songerList.join('/');
  }
}

/**
 * 数字转整数 如 100000 转为10万
 * @param {需要转化的数} num
 * @param {需要保留的小数位数} point
 */
export function tranNumber(num, point = 1) {
  let numStr = parseInt(num).toString();
  // 万以内直接返回
  if (numStr.length < 5) {
    return numStr;
  }
  //大于8位数是亿
  else if (numStr.length > 8) {
    let decimal = numStr.substring(numStr.length - 8, numStr.length - 8 + point);
    return parseFloat(parseInt(num / 100000000) + '.' + decimal) + '亿';
  }
  //大于6位数是十万 (以10W分割 10W以下全部显示)
  else if (numStr.length > 4) {
    let decimal = numStr.substring(numStr.length - 4, numStr.length - 4 + point);
    return parseFloat(parseInt(num / 10000) + '.' + decimal) + '万';
  }
}

/**
 * 让任意对象滚动一定距离的scrollTop
 * @param {滚动的元素} obj
 * @param {滚动的距离} target
 * @param {滚动时间} time
 */
export function scrollAnimate(obj, target, time = 500) {
  clearInterval(obj.timer);
  let step = (target - obj.scrollTop) / (time / 10);
  obj.timer = setInterval(function () {
    step = step > 0 ? Math.ceil(step) : Math.floor(step);
    obj.scrollTop = obj.scrollTop + step;
    if (obj.scrollTop >= target || obj.scrollTop + obj.offsetHeight >= obj.scrollHeight) {
      clearInterval(obj.timer);
    }
  }, 10);
}

/**
 * 让任意对象滚动指定的scrollTop
 * @param {滚动的元素} dom
 * @param {滚动指定的最终scrollTop} position
 */
export function scrollSmoothTo(dom, position) {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback, element) {
      return setTimeout(callback, 17);
    };
  }
  // 当前滚动高度
  var scrollTop = dom.scrollTop;
  // 滚动step方法
  var step = function () {
    // 距离目标滚动距离
    var distance = position - scrollTop;
    // 目标滚动位置
    scrollTop = scrollTop + distance / 10;
    if (Math.abs(distance) < 1) {
      dom.scrollTo(0, position);
    } else {
      dom.scrollTo(0, scrollTop);
      requestAnimationFrame(step);
    }
  };
  step();
}

//界面toast提示
/*使用方法 Toast('这是一个弹框',2000)*/
export function Toast(msg, duration, callback) {
  duration = isNaN(duration) ? 1000 : duration;
  if (localStorage.getItem('isShowToast') === '1') {
  } else {
    localStorage.setItem('isShowToast', '1');
    let m = document.createElement('div');
    m.innerHTML = msg;
    m.style.cssText =
      'max-width:80%;padding:10px;color: rgb(255, 255, 255);text-align: center;border-radius: 4px;position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);z-index: 999999;background: rgba(0, 0, 0,.7);font-size: 14px;';
    document.body.appendChild(m);
    setTimeout(function () {
      const d = 0.5;
      m.style.transition = 'ttransform ' + d + 's ease-in, opacity ' + d + 's ease-in';
      m.style.opacity = '0';
      setTimeout(function () {
        localStorage.setItem('isShowToast', '0');
        document.body.removeChild(m);
        if (typeof callback === 'function') callback();
      }, d * 1000);
    }, duration);
  }
}

//界面alert提示
/*使用方法 Alert('这是一个弹框')*/
export function Alert(msg, btnText = '我知道了') {
  let m = document.createElement('div');
  m.onclick = function () {
    // m.style.display = "none";
    document.body.removeChild(m);
  };
  let strHtml = `<div>${msg}</div><div style='height:36px;width:60%;line-height:36px;color:#fff;margin:20px auto 0px;background:var(--primary-text-color);border-radius: 4px;'>${btnText}</div>`;
  m.innerHTML = strHtml;
  m.style.cssText =
    'width:60%;padding:20px;color: #666;text-align: center;border-radius: 10px;position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);z-index: 999999;background: rgba(255, 255, 255, 1);font-size: 14px;box-shadow: 0 0 30px 0 rgba(0, 0, 0, 0.15)';
  document.body.appendChild(m);
}

/**
 *
 * @param {string} msg 提示文本
 * @param {function}} callback 点击确定后回调
 * @param {string} yes 确定文字
 * @param {string} no 取消文字
 */
export function Confirm(msg, callback, yes = '确定', no = '取消') {
  let m = document.createElement('div');
  let strHtml = `<div>${msg}</div><div style='height:36px;line-height:36px;color:#fff;margin:20px auto 0px;display:flex'><div style='flex:1;background:#e2e2e2;color:#666;line-height:36px;border-radius: 4px;margin:0 5px;' id='ConfirmNo'>${no}</div> <div style='margin:0 5px;flex:1;border-radius: 4px;line-height:36px;background:var(--primary-text-color);' id='ConfirmYes'>${yes}</div></div>`;
  m.innerHTML = strHtml;
  m.style.cssText =
    'width:60%;padding:20px;color: #666;text-align: center;border-radius: 10px;position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);z-index: 999999;background: rgba(255, 255, 255, 1);font-size: 14px;box-shadow: 0 0 30px 0 rgba(0, 0, 0, 0.15)';
  document.body.appendChild(m);
  document.getElementById('ConfirmNo').onclick = function () {
    document.body.removeChild(m);
  };
  document.getElementById('ConfirmYes').onclick = function () {
    document.body.removeChild(m);
    callback();
  };
}

/**
 * 将数组按照指定长度分割
 * @param {Array} array ,传入数组
 * @param {Number} subLength ，分割长度
 * @returns 返回处理后的数组
 */
export function cutArray(array, subLength = 150) {
  let newArr = [];
  if (array.length <= subLength) {
    newArr.push(array);
    return newArr;
  } else {
    let index = 0;
    while (index < array.length) {
      newArr.push(array.slice(index, (index += subLength)));
    }
    return newArr;
  }
}

/**
 * 将文本中包含无法显示的 emoji 表情转成图片显示。比如 [吃惊] 之类
 * @param {string} text
 * @returns
 */
export function emojiToImg(text) {
  const regex = /\[[^\[\]]{1,4}\]/g; //  /\[.{1,10}\]/g
  if (!text.match(regex)) {
    let fullText = `<span>${text}</span>`;
    return fullText;
  } else {
    let textMatchList = text.match(regex);
    if (textMatchList.length > 0) {
      //包含[]表情
      for (let x = 0; x < textMatchList.length; x++) {
        if (textMatchList[x].indexOf('][') > -1) {
          let itemList = textMatchList[x].split('][');
          for (let t = 0; t < itemList.length; t++) {
            if (itemList[t].substr(0, 1) !== '[') {
              itemList[t] = `[${itemList[t]}`;
            }
            if (itemList[t].substr(itemList[t].length - 1, 1) !== ']') {
              itemList[t] = `${itemList[t]}]`;
            }
          }
          textMatchList = itemList;
        }
      }
      for (let p = 0; p < textMatchList.length; p++) {
        textMatchList[p] = textMatchList[p].substr(1); //删除首字符
        textMatchList[p] = textMatchList[p].substring(0, textMatchList[p].length - 1); //删除最后末字符
      }
      const newtextMatchList = textMatchList;
      if (newtextMatchList.length > 1) {
        let newText = text;
        for (let i = 0; i < newtextMatchList.length; i++) {
          if (Emoji.hasOwnProperty(newtextMatchList[i])) {
            newText = newText.replace(
              new RegExp(`\\[${newtextMatchList[i]}\\]`, 'g'),
              `<img style="vertical-align:middle;height:18px;width:18px;" src="${emojiToUrl(
                Emoji[newtextMatchList[i]]
              )}"></img>`
            );
          } else {
            newText = text;
          }
        }
        let fullText = `<span>${newText}</span>`;
        return fullText;
      } else {
        if (Emoji.hasOwnProperty(newtextMatchList[0])) {
          let newText = text.replace(
            new RegExp(`\\[${newtextMatchList[0]}\\]`, 'g'),
            `<img style="vertical-align:middle;height:18px;width:18px;" src="${emojiToUrl(
              Emoji[newtextMatchList[0]]
            )}"></img>`
          );
          let fullText = `<span>${newText}</span>`;
          return fullText;
        } else {
          let fullText = `<span>${text}</span>`;
          return fullText;
        }
      }
    } else {
      let fullText = `<span>${text}</span>`;
      return fullText;
    }
  }
}
function emojiToUrl(value) {
  if (value.substring(0, 2) === 'dx') {
    return `/images/dd_and_xx/${value}.png`;
  } else {
    return `https://s1.music.126.net/style/web2/emt/emoji_${value}.png`;
  }
}

/**
 * 处理 URL 中的参数
 * @param {string} search,传入的参数
 * @returns 返回处理之后的对象
 */
export function getRequest(search) {
  let theRequest = new Object();
  let strs = '';
  if (search.indexOf('?') != -1) {
    let str = search.substr(1);
    strs = str.split('&');
    for (let i = 0; i < strs.length; i++) {
      theRequest[strs[i].split('=')[0]] = decodeURIComponent(strs[i].split('=')[1]);
    }
  }
  return theRequest;
}

/**
 * 封装 ripple 点击效果。传入要产生涟漪效果的 DOM 元素即可
 * @param {dom} dom
 */
export function ripple(dom, list = false) {
  if (list) {
    for (let t = 0; t < dom.childNodes.length; t++) {
      dom.childNodes[t].addEventListener('touchstart', createRipple);
      dom.childNodes[t].addEventListener('touchend', removeRipple);
    }
  } else {
    dom.addEventListener('touchstart', createRipple);
    dom.addEventListener('touchend', removeRipple);
  }
}
function computeRippleStyles(element, event) {
  const { top, left } = element.getBoundingClientRect();
  const { clientWidth, clientHeight } = element;
  const radius = Math.sqrt(clientWidth ** 2 + clientHeight ** 2) / 2;
  const size = radius * 2;
  const localX = event.changedTouches[0].clientX - left;
  const localY = event.changedTouches[0].clientY - top;
  const centerX = (clientWidth - radius * 2) / 2;
  const centerY = (clientHeight - radius * 2) / 2;
  const x = localX - radius;
  const y = localY - radius;
  return { x, y, centerX, centerY, size };
}
function createRipple(event) {
  const container = this;
  const { x, y, centerX, centerY, size } = computeRippleStyles(container, event);
  const ripple = document.createElement('div');
  ripple.classList.add('my-ripple');
  ripple.style.opacity = `0`;
  ripple.style.transform = `translate(${x}px, ${y}px) scale3d(.3, .3, .3)`;
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  // 记录水波的创建时间
  ripple.dataset.createdAt = String(performance.now());
  const { position } = window.getComputedStyle(container);
  container.style.overflow = 'hidden';
  position === 'static' && (this.style.position = 'relative');
  container.appendChild(ripple);
  window.setTimeout(() => {
    ripple.style.transform = `translate(${centerX}px, ${centerY}px) scale3d(1, 1, 1)`;
    ripple.style.opacity = `.2`;
  });
}
function removeRipple() {
  const container = this;
  const ripples = container.querySelectorAll('.my-ripple');
  if (!ripples.length) {
    return;
  }
  const lastRipple = ripples[ripples.length - 1];
  // 通过水波的创建时间计算出扩散动画还需要执行多久，确保每一个水波都完整的执行了扩散动画
  const delay = 300 - performance.now() + Number(lastRipple.dataset.createdAt);
  setTimeout(() => {
    lastRipple.style.opacity = `0`;
    setTimeout(() => lastRipple.parentNode?.removeChild(lastRipple), 300);
  }, delay);
}

// 获取操作系统信息
export function getOsInfo() {
  var userAgent = navigator.userAgent.toLowerCase();
  var os = 'Unknown';
  var version = 'Unknown';
  if (userAgent.indexOf('win') > -1) {
    os = 'Windows';
    if (userAgent.indexOf('windows nt 5.0') > -1) {
      version = 'Windows 2000';
    } else if (userAgent.indexOf('windows nt 5.1') > -1 || userAgent.indexOf('windows nt 5.2') > -1) {
      version = 'Windows XP';
    } else if (userAgent.indexOf('windows nt 6.0') > -1) {
      version = 'Windows Vista';
    } else if (userAgent.indexOf('windows nt 6.1') > -1 || userAgent.indexOf('windows 7') > -1) {
      version = 'Windows 7';
    } else if (userAgent.indexOf('windows nt 6.2') > -1 || userAgent.indexOf('windows 8') > -1) {
      version = 'Windows 8';
    } else if (userAgent.indexOf('windows nt 6.3') > -1) {
      version = 'Windows 8.1';
    } else if (userAgent.indexOf('windows nt 6.2') > -1 || userAgent.indexOf('windows nt 10.0') > -1) {
      version = 'Windows 10';
    } else {
      version = 'Unknown';
    }
  } else if (userAgent.indexOf('iphone') > -1) {
    os = 'iPhone';
  } else if (userAgent.indexOf('mac') > -1) {
    os = 'Mac';
  } else if (
    userAgent.indexOf('x11') > -1 ||
    userAgent.indexOf('unix') > -1 ||
    userAgent.indexOf('sunname') > -1 ||
    userAgent.indexOf('bsd') > -1
  ) {
    os = 'Unix';
  } else if (userAgent.indexOf('linux') > -1) {
    if (userAgent.indexOf('android') > -1) {
      os = 'Android';
    } else {
      os = 'Linux';
    }
  } else {
    os = 'Unknown';
  }
  return { os, version };
}

//浏览器与版本号
export function getUserAgentInfo() {
  var userAgent = navigator.userAgent;
  var version;
  if (/opera/i.test(userAgent) || /OPR/i.test(userAgent)) {
    version = getVersion(userAgent, 'OPR/(\\d+\\.+\\d+)');
    return { browser: 'opera', version };
  } else if (/compatible/i.test(userAgent) && /MSIE/i.test(userAgent)) {
    version = getVersion(userAgent, 'MSIE (\\d+\\.+\\d+)');
    return { browser: 'ie', version };
  } else if (/Edge/i.test(userAgent)) {
    version = getVersion(userAgent, 'Edge/(\\d+\\.+\\d+)');
    return { browser: 'edge', version };
  } else if (/Firefox/i.test(userAgent)) {
    version = getVersion(userAgent, 'Firefox/(\\d+\\.+\\d+)');
    return { browser: 'firefox', version };
  } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    version = getVersion(userAgent, 'Safari/(\\d+\\.+\\d+)');
    return { browser: 'safari', version };
  } else if (/Chrome/i.test(userAgent) && /Safari/i.test(userAgent)) {
    version = getVersion(userAgent, 'Chrome/(\\d+\\.+\\d+)');
    return { browser: 'chrome', version };
  } else if (!!window.ActiveXObject || 'ActiveXObject' in window) {
    version = 11;
    return { browser: 'ie', version };
  }
}
//版本号
function getVersion(userAgent, reg) {
  var reBrowser = new RegExp(reg);
  reBrowser.test(userAgent);
  return parseFloat(RegExp['$1']);
}

//处理时间，将传入的时间（秒），转换为时分秒格式。
// times(number)
export function timeToMinute(times) {
  var result = '00:00';
  var hour, minute, second;
  if (times > 0) {
    hour = Math.floor(times / 3600);
    if (hour < 10) {
      hour = '0' + hour;
    }
    minute = Math.floor((times - 3600 * hour) / 60);
    if (minute < 10) {
      minute = '0' + minute;
    }
    second = Math.floor((times - 3600 * hour - 60 * minute) % 60);
    if (second < 10) {
      second = '0' + second;
    }
    if (hour == '00') {
      result = minute + ':' + second;
    } else if (minute == '00') {
      // result = hour + ":" + minute + ":" + second;
      result = minute + ':' + second;
    } else {
      result = second;
    }
  }
  return result;
}
