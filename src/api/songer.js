import request from '../utils/request';

/**
 * 获取歌手详情
 * 说明 : 调用此接口 , 传入歌手 id, 可获得获取歌手详情
 * 必选参数 : id: 歌手 id
 * 接口地址 : /artist/detail
 * 调用例子 : /artist/detail?id=11972054 (Billie Eilish)
 */
export function getSongerDetail(id) {
  return request({
    url: '/artist/detail',
    method: 'get',
    params: {
      id,
    },
  });
}
/**
 * 获取歌手描述
 * 说明 : 调用此接口 , 传入歌手 id, 可获得歌手描述
 * 必选参数 : id: 歌手 id
 * 接口地址 : /artist/desc
 * 调用例子 : /artist/desc?id=6452 ( 周杰伦 )
 */
export function getSongerDesc(id) {
  return request({
    url: '/artist/desc',
    method: 'get',
    params: {
      id,
    },
  });
}
/**
 * 歌手热门50首歌曲
 * 说明 : 调用此接口,可获取歌手热门50首歌曲
 * 必选参数 : id: 歌手 id
 * 接口地址 : /artist/top/song
 * 调用例子 : /artist/top/song?id=6452 ( 周杰伦 )
 */
export function getSongerTop(id) {
  return request({
    url: '/artist/top/song',
    method: 'get',
    params: {
      id,
    },
  });
}

/**
 * 收藏歌手
 * 说明 : 调用此接口 , 传入歌手 id, 可收藏歌手
 * - id: 歌手 id
 * - t: 操作,1 为收藏,其他为取消收藏
 * @param {Object} params
 * @param {number} params.id
 * @param {number} params.t
 */
export function followAArtist(params) {
  return request({
    url: '/artist/sub',
    method: 'get',
    params,
  });
}

/**
 * 相似歌手
 * 说明 : 调用此接口 , 传入歌手 id, 可获得相似歌手
 * - id: 歌手 id
 * @param {number} id
 */
export function similarArtists(id) {
  return request({
    url: '/simi/artist',
    method: 'get',
    params: { id },
  });
}

/**
 * 歌手歌手
 * 说明 : 调用此接口 , 可获取热门歌手数据
 * - 可选参数 : limit: 取出数量 , 默认为 50
 * offset: 偏移数量 , 用于分页 , 如 :( 页数 -1)*50, 其中 50 为 limit 的值 , 默认 为 0
 * 接口地址 : /top/artists
 * 调用例子 : /top/artists?offset=0&limit=30
 */
export function topArtists(limit, offset) {
  return request({
    url: '/top/artists',
    method: 'get',
    params: { limit, offset },
  });
}

/**
 * 歌手全部歌曲
说明 : 调用此接口,可获取歌手全部歌曲 必选参数 :
id : 歌手 id
可选参数 :
order : hot ,time 按照热门或者时间排序
limit: 取出歌单数量 , 默认为 50
offset: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)*50, 其中 50 为 limit 的值
接口地址 : /artist/songs
调用例子 : /artist/songs?id=6452
 */
export function getAllSongs(id, order, limit, offset) {
  return request({
    url: '/artist/songs',
    method: 'get',
    params: { id, order, limit, offset },
  });
}
