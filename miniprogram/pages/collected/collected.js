// miniprogram/pages/collected/collected.js
var totalSize = 0;
var currentIndex = 0;
var shoucang = [];
const MAX_LIMIT = 10;  //一次最多获取十条商品记录数据

var temp = [];   //把数据库shangpin集合里的所有数据以十条为单位放入temp数组里，即temp里每个元素又是一个个长度为10的数组，其中最后一个长度可能不为10
var app ;
var openId;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    itemDetailUrl: '/pages/detail/detail',
    items: [],
    loading: true,
    reachBottom: false,
    isEmpty: false,
  },
  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function (options) {
    totalSize = 0;
    temp = [];
    shoucang = [];
    const db = wx.cloud.database();
    const _ = db.command
    await db.collection('shoucang').where({ _openid: openId }).count().then(res => { //获取数据库中shoucang集合该用户收藏记录的总共数目
      totalSize = res.total;
    })
    // 计算需分几次取
    const batchTimes = Math.ceil(totalSize / 10);
    // 承载所有读操作的 promise 的数组
    for (i = 0; i < batchTimes; i++) {
      if (i != 0) {
        //不是第一次从数据库拿数据，需要跳过前10*i条
        await db.collection('shoucang').where({ _openid: openId }).orderBy('date', 'desc').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get().then(res => {
          shoucang = res.data;
        })
      }
      //若是第一次从数据库拿数据，则不需要跳过前10*i条，因此没有skip()，该函数参数不能为0
      else {
        await db.collection('shoucang').where({ _openid: openId }).orderBy('date', 'desc').limit(MAX_LIMIT).get().then(res => {
          shoucang = res.data;
        })
      }
      for (let j = 0; j < shoucang.length && j < MAX_LIMIT; j++) {
        await db.collection('shangpin').where({ _id: shoucang[j].commodityId }).get().then(
          res => {
            res.data[0].commodityPictures.sort()
            temp.push(res.data[0])
          });
      }
    }
    if (temp.length != 0) {
      this.setData({
        items: temp,
        loading: false,
      })
    }
    else {
      this.setData({ isEmpty: true, loading: false })
    }
    currentIndex = 1;
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   * 下拉刷新
   */
  onPullDownRefresh:async function () {
    this.setData({loading: true})
    totalSize = 0;
    temp = [];
    shoucang = [];
    const db = wx.cloud.database();
    const _ = db.command
    await db.collection('shoucang').where({ _openid: openId }).count().then(res => { //获取数据库中shoucang集合该用户收藏记录的总共数目
      totalSize = res.total;
    })
    // 计算需分几次取
    const batchTimes = Math.ceil(totalSize / 10);
    // 承载所有读操作的 promise 的数组
    for (i = 0; i < batchTimes; i++) {
      if (i != 0) {
        //不是第一次从数据库拿数据，需要跳过前10*i条
        await db.collection('shoucang').where({ _openid: openId }).orderBy('date', 'desc').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get().then(res => {
          shoucang = res.data;
        })
      }
      //若是第一次从数据库拿数据，则不需要跳过前10*i条，因此没有skip()，该函数参数不能为0
      else {
        await db.collection('shoucang').where({ _openid: openId }).orderBy('date', 'desc').limit(MAX_LIMIT).get().then(res => {
          shoucang = res.data;
        })
      }
      for (let j = 0; j < shoucang.length && j < MAX_LIMIT; j++) {
        await db.collection('shangpin').where({ _id: shoucang[j].commodityId }).get().then(
          res => {
            res.data[0].commodityPictures.sort()
            temp.push(res.data[0])
          });
      }
    }
    if (temp.length != 0) {
      this.setData({
        items: temp,
        loading: false,
      })
    }
    else {
      this.setData({ isEmpty: true, loading: false })
    }
    currentIndex = 1;
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom:async function () {
    const MAX_LIMIT = 10; //一次最多获取10条商品记录
    this.setData({ loading: true });

    var itemArr = this.data.items;  //要将之前的items里的数据一并放入，在之前items数据的基础上再增加新的商品记录

    if (shoucang.length > (currentIndex)*MAX_LIMIT) {
      for (let i = 0; i < MAX_LIMIT && i < (shoucang.length-MAX_LIMIT*currentIndex); i++) {
        itemArr.push(shoucang[currentIndex*MAX_LIMIT+i][0]);
      }

      this.setData({
        items: itemArr,
        loading: false
      })
      currentIndex++;
      if (shoucang.length <= currentIndex*MAX_LIMIT) {
        this.setData({
          reachBottom: true,
        })
      }
    }
    else {
      this.setData({
        loading: false,
        reachBottom: true,
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})