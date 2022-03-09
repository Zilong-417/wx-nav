/*trip.js */
var app = getApp();
//获取录音管理器对象
var rm = wx.getRecorderManager();
var plugin = requirePlugin("WechatSI")
let manager = plugin.getRecordRecognitionManager()
// 引入SDK核心类
var QQMapWX = require('../../lib/qqmap-wx-jssdk');
// 实例化API核心类
var qqmapsdk;
Page({
  //页面的初始数据
  data: {
    hasRecord: false,
    isDot: "block",
    isTouchStart: false,
    isTouchEnd: false,
    value: '100',
    touchStart: 0,
    touchEnd: 0,
    vd: '',
    //自定义标记点
    markers: [],
    //是否被放大
    isbig: true
  },
  //生命周期函数--监听页面加载
  onLoad: function (_options) {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'VDUBZ-LMOEX-Y7J4V-TIIKL-U2H62-JLFGY'
    });
    //录音
    var that = this;
    manager.onRecognize = function (res) {
      cons.log("current result", res.result)
    }
    manager.onStop = function (res) {
      console.log('识别开始');
      var result = res.result;
      var s = result.indexOf('。') //找到第一次出现下划线的位置
      result = result.substring(0, s) //取下划线前的字符
      var searchType = that.data.searchType;
      that.setData({
        addtext: result
      })
      wx.showToast({
        title: result,
      })
    }
    manager.onError = function (res) {
      console.log('manager.onError')
      console.log(res) //报错信息打印
      wx.showToast({
        title: res.msg,
      })
      // UTIL.log("error msg", res.msg)
    }
    //获取用户当前位置
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log(res)
        var lat = res.latitude;
        var lon = res.longitude;
        // 根据坐标获取当前位置名称，腾讯地图逆地址解析
        qqmapsdk.reverseGeocoder({
            location: {
              latitude: lat,
              longitude: lon
            },
            success: function (res) {
              console.log(res)
              var ad = res.result.address;
              that.setData({
                address: ad,
                markers: [{
                  id: 0,
                  title: ad,
                  latitude: lat,
                  longitude: lon,
                  iconPath: "../../images/from.png",
                  width: 40,
                  height: 40,
                  callout: {
                    content: "当前位置",
                    color: '#0000ff',
                    fontSize: 20,
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: '#0000ff',
                    padding: 2,
                    display: 'ALWAYS'
                  }
                }]
              })
            }
          }),
          that.setData({
            lat: res.latitude,
            lon: res.longitude,
            stop_detail_none: 'stop_detail_none'
          })
      }
    });
  },
  // 点击录音按钮
  onRecordClick: function () {
    wx.getSetting({
      success: function (t) {
        console.log(t.authSetting), t.authSetting["scope.record"] ? console.log("已授权录音") : (console.log("未授权录音"),
          wx.openSetting({
            success: function (t) {
              console.log(t.authSetting);
            }
          }));
      }
    });
  },
  //长按录音开始
  recordStart: function (e) {
    var that = this
    // UTIL.stopTTS();
    manager.start({
      duration: 30000,
      lang: "zh_CN"
    }), that.setData({
      touchStart: e.timeStamp,
      isTouchStart: true,
      isTouchEnd: false,
      showPg: true,
    })
    var a = 15,
      o = 10;
    this.timer = setInterval(function () {
      that.setData({
        value: that.data.value - 100 / 1500
      }), (o += 10) >= 1e3 && o % 1e3 == 0 && (a--, console.log(a), a <= 0 && (rm.stop(),
        clearInterval(that.timer), that.animation2.scale(1, 1).step(), that.setData({
          animationData: that.animation2.export(),
          showPg: false,
        })));
    }, 10);
  },
  //长按录音结束
  recordTerm: function (e) {
    //结束录音
    var searchType = e.currentTarget.dataset.type;
    this.setData({
      isTouchEnd: true,
      isTouchStart: false,
      touchEnd: e.timeStamp,
      showPg: false,
      value: 100,
      searchType: searchType,
      background: "#ED6C00",
      yysb: "长按语音识别"
    }), clearInterval(this.timer);;
    manager.stop();
    wx.showToast({
      title: '正在识别……',
      icon: 'loading',
      duration: 2000
    })
  },
  //放大地图
  big(e) {
    console.log(e)
    var that = this

    //key查询附近公交
    qqmapsdk.search({
      keyword: '公交',
      location: that.data.lat + ',' + that.data.lon,
      // 计算距离函数
      Rad(d) {
        //根据经纬度判断距离
        return d * Math.PI / 180.0;
      },
      getDistance(lat1, lng1, lat2, lng2) {
        // lat1用户的纬度
        // lng1用户的经度
        // lat2商家的纬度
        // lng2商家的经度
        var radLat1 = this.Rad(lat1);
        var radLat2 = this.Rad(lat2);
        var a = radLat1 - radLat2;
        var b = this.Rad(lng1) - this.Rad(lng2);
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * 6378.137;
        s = Math.round(s * 10000) / 10;
        s = s.toFixed(1) + '米' //保留两位小数
        console.log('经纬度计算的距离:' + s)
        return s
      },
      success(res) {
        console.log(res)
        var mark = []
        for (let i in res.data) {
          mark.push({
            iconPath: '../../images/busstop.png',
            title: res.data[i].title,
            id: i,
            longitude: res.data[i].location.lng,
            latitude: res.data[i].location.lat,
            distance: this.getDistance(that.data.lat, that.data.lon, res.data[i].location.lat, res.data[i].location.lng)
          })
        }
        mark.unshift({
          iconPath: '../../images/from.png',
          id: 0,
          distance: 0 + '米',
          longitude: that.data.lon,
          latitude: that.data.lat,
          title: that.data.address,
          iconPath: "../../images/from.png",
          width: 40,
          height: 40,
          callout: {
            content: "当前位置",
            color: '#0000ff',
            fontSize: 20,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: '#0000ff',
            padding: 2,
            display: 'ALWAYS'
          }
        })
        console.log(mark)
        //收放地图
        if (that.data.isbig == true) {
          that.setData({
            markers: mark,
            isbig: !that.data.isbig,
            map_change: 'map_change',
            search_nav_none: 'search_nav_none',
            sub_none: 'sub_none',
            voice_box_none: 'voice_box_none',
            stop_detail_none: ''
          })
        } else {
          that.setData({
            markers: mark,
            isbig: !that.data.isbig,
            map_change: '',
            search_nav_none: '',
            sub_none: '',
            voice_box_none: '',
            stop_detail_none: 'stop_detail_none'
          })
        }
      }
    })
  },
  //获取目的名字
  getgoods: function (e) {
    console.log(e)
    this.setData({
      'addtext': e.detail.value
    })
  },
  //前往目的地
  goaddress: function (e) {
    var that = this
    console.log(e)
    //通过地理位置名字获取经纬度
    qqmapsdk.geocoder({
      //获取表单传入地址
      address: '佛山' + that.data.addtext, //地址参数
      success: function (res) { //成功后的回调
        console.log(res)
        //获取高德地图公交站信息
        const promise = new Promise(function (resolve, reject) {
          wx.request({
            url: "https://restapi.amap.com/v3/direction/transit/integrated?origin=" + that.data.lon + "," + that.data.lat + "&destination=" + res.result.location.lng + "," + res.result.location.lat + "&city=佛山&output=json&key=83435cf7e1f8e7b06c1d9a5353e94c06",
            success: function (res) {
              console.log(res.data.route.transits)
              resolve(res)
            },
            fail: () => {
              reject("系统异常，请重试！")
            }
          })
        })
        promise.then(function (res) {
          var route = JSON.stringify(res.data.route.transits);
          wx.navigateTo({
            url: '../../pages/buslist/buslist?goplan=' + route + '&goods=' + that.data.addtext
          })
        }, function () {})
      }

    })


  },
  //清空内容
  reset: function (e) {
    console.log(e)
    this.setData({
      'addtext': ''
    })

  },
  //前往站牌
  gostop: function (e) {
    var that=this
    console.log(e)
    var stop_lat=e.currentTarget.dataset.latitude
    var stop_lon=e.currentTarget.dataset.longtitude
    var stop_name=e.currentTarget.dataset.name
     //获取高德地图步行方案
     const promise = new Promise(function (resolve, reject) {
      wx.request({
        url: "https://restapi.amap.com/v3/direction/walking?origin=" + that.data.lon + "," + that.data.lat + "&destination=" + stop_lon + "," + stop_lat + "&city=佛山&output=json&key=83435cf7e1f8e7b06c1d9a5353e94c06",
        success: function (res) {
          resolve(res)
        },
        fail: () => {
          reject("系统异常，请重试！")
        }
      })
    })
    promise.then(function (res) {
      console.log(res)
      var steps = JSON.stringify(res.data.route.paths[0].steps);
      wx.navigateTo({
        url: '../../pages/walk/walk?stop_lat='+stop_lat+'&stop_lon='+stop_lon+'&stop_name='+stop_name+'&now_lat='+that.data.lat+'&now_lon='+that.data.lon+'&steps='+steps,
      })
    }, function () {})
    
  }

})