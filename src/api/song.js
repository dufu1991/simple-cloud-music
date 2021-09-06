import request from '../utils/request';

/**
 * 获取音乐 url
 * 说明 : 使用歌单详情接口后 , 能得到的音乐的 id, 但不能得到的音乐 url, 调用此接口, 传入的音乐 id( 可多个 , 用逗号隔开 ), 可以获取对应的音乐的 url,
 * !!!未登录状态返回试听片段(返回字段包含被截取的正常歌曲的开始时间和结束时间)
 * @param {string} id - 音乐的 id，例如 id=405998841,33894312
 */
export function getSongUrl(id) {
  let br = 128000;
  switch (localStorage.getItem('musicQuality')) {
    case '0':
      br = 128000;
      break;
    case '1':
      br = 192000;
      break;
    case '2':
      br = 320000;
      break;
    case '3':
      br = 999000;
      break;
    default:
      br = 128000;
      break;
  }
  return request({
    url: '/song/url',
    method: 'get',
    params: {
      id,
      br,
    },
    isHideLoading: true,
  });
}

/**
 * 获取歌曲详情
 * 说明 : 调用此接口 , 传入音乐 id(支持多个 id, 用 , 隔开), 可获得歌曲详情(注意:歌曲封面现在需要通过专辑内容接口获取)
 * @param {string} ids - 音乐 id, 例如 ids=405998841,33894312
 */
export function getSongDetail(ids) {
  if (typeof ids === 'string') ids = ids.replace(/,,/, ',');
  return request({
    url: '/song/detail',
    method: 'get',
    params: {
      ids,
      timestamp: new Date().getTime(),
    },
  });
}
/**
 * 获取相似音乐
 * 说明 : 调用此接口 , 传入歌曲 id, 可获得相似歌曲
 * @param {string} id- 音乐 id, 例如 ids=405998841,33894312
 */
export function getSimiSong(id) {
  return request({
    url: '/simi/song',
    method: 'get',
    params: {
      id,
    },
  });
}
/**
 * 私人 FM( 需要登录 )
 *
 */
export function personalFM() {
  return request({
    url: '/personal_fm',
    method: 'get',
    params: {
      timestamp: new Date().getTime(),
    },
  });
}
/**
 * 喜欢音乐
 * 说明 : 调用此接口 , 传入音乐 id, 可喜欢该音乐
 * - id - 歌曲 id
 * - like - 默认为 true 即喜欢 , 若传 false, 则取消喜欢
 * @param {Object} params
 * @param {number} params.id
 * @param {boolean=} [params.like]
 */
export function likeThisSong(params) {
  params.timestamp = new Date().getTime();
  return request({
    url: '/like',
    method: 'get',
    params,
  });
}

//说明 : 调用此接口 , 传入音乐 id, 可把该音乐从私人 FM 中移除至垃圾桶
export function fmTrash(id) {
  return request({
    url: '/fm_trash',
    method: 'post',
    params: {
      timestamp: new Date().getTime(),
      id,
    },
  });
}

/**
 * 获取歌词
 * 说明 : 调用此接口 , 传入音乐 id 可获得对应音乐的歌词 ( 不需要登录 )
 * @param {number} id - 音乐 id
 */
export function getLyric(id) {
  return request({
    url: '/lyric',
    method: 'get',
    params: {
      id,
    },
  });
}

/**
 * 热门评论
 * 说明 : 调用此接口 , 传入 type, 资源 id 可获得对应资源热门评论 ( 不需要登录 )
 * 必选参数 : id : 资源 id
 * type: 数字 , 资源类型 , 对应歌曲 , mv, 专辑 , 歌单 , 电台, 视频对应以下类型
 * 0: 歌曲;1: mv;2: 歌单;3: 专辑;4: 电台;5: 视频
 * 可选参数 : limit: 取出评论数量 , 默认为 20
 * offset: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)*20, 其中 20 为 limit 的值
 * before: 分页参数,取上一页最后一项的 time 获取下一页数据(获取超过5000条评论的时候需要用到)
 * 接口地址 : /comment/hot
 * 调用例子 : /comment/hot?id=186016&type=0
 * @param {number} id
 * @param {number} type
 * @param {number} limit
 * @param {number} offset
 * @returns
 */
export function getHotComment(id, offset = 0, type = 0, limit = 20) {
  return request({
    url: '/comment/hot',
    method: 'get',
    params: {
      id,
      type,
      limit,
      offset,
      timestamp: new Date().getTime(),
    },
  });
}
/**
 * 新版评论接口
 * 说明 : 调用此接口 , 传入资源类型和资源id,以及排序方式,可获取对应资源的评论
 * 必选参数 :
 * id : 资源 id, 如歌曲 id,mv id
 * type: 数字 , 资源类型 , 对应歌曲 , mv, 专辑 , 歌单 , 电台, 视频对应以下类型
 * 0: 歌曲 1: mv 2: 歌单 3: 专辑 4: 电台 5: 视频 6: 动态f
 * 可选参数 :
 * pageNo:分页参数,第N页,默认为1
 * pageSize:分页参数,每页多少条数据,默认20
 * sortType: 排序方式,1:按推荐排序,2:按热度排序,3:按时间排序
 * cursor: 当sortType为3时且页数不是第一页时需传入,值为上一条数据的time
 * 接口地址 : /comment/new
 * 调用例子 : /comment/new?type=0&id=1407551413&sortType=3,
 * /comment/new?type=0&id=1407551413&sortType=3&cursor=1602072870260&pageSize=20&pageNo=2
 * @param {Object} params
 * @param {number} params.id
 * @param {number} params.type
 * @param {number} params.limit
 * @param {number} params.offset
 * @param {number} params.before
 */
export function getComment(id, type = 0, pageNo = 1) {
  return request({
    url: '/comment/new',
    method: 'post',
    params: {
      id,
      type,
      pageNo,
      pageSize: 20,
      sortType: 2,
      timestamp: new Date().getTime(),
    },
  });
}

/**
 * 给评论点赞
说明 : 调用此接口 , 传入 type, 资源 id, 和评论 id cid 和 是否点赞参数 t 即可给对 应评论点赞 ( 需要登录 )
必选参数 : id : 资源 id, 如歌曲 id,mv id
cid : 评论 id
t : 是否点赞 ,1 为点赞 ,0 为取消点赞
type: 数字 , 资源类型 , 对应歌曲 , mv, 专辑 , 歌单 , 电台, 视频对应以下类型
*/
export function likeComment(id, cid, type = 0, t) {
  return request({
    url: '/comment/like',
    method: 'get',
    params: {
      id,
      cid,
      type,
      t,
      timestamp: new Date().getTime(),
    },
  });
}
