/*trip.js */
var app = getApp();
//获取录音管理器对象
var rm = wx.getRecorderManager();
var plugin = requirePlugin("WechatSI")
// 获取**全局唯一**的语音识别管理器**recordRecoManager**
let manager = plugin.getRecordRecognitionManager()
// 引入SDK核心类
var QQMapWX = require('../../lib/qqmap-wx-jssdk');
// 实例化API核心类
var qqmapsdk;

Page({
  getFre(s) {
    return parseInt(s);
  },
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
    isbig: true,
    words: [],
    toViewid: "v0",
    //出行方式默认隐藏
    hidden: false
  },
  //生命周期函数--监听页面加载
  onLoad: function (_options) {
    console.log(getCurrentPages())
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'VDUBZ-LMOEX-Y7J4V-TIIKL-U2H62-JLFGY'
    });
    //录音
    var that = this;
    console.log(that.data.addtext)
    //有新的识别内容返回，则会调用此事件
    manager.onRecognize = function (res) {
      console.log("current result", res.result)
    }
    manager.onStop = function (res) {
      console.log('识别开始');
      var result = res.result;
      if (result == '') {
        wx.showToast({
          icon: 'error',
          title: '没听清！'
        })
      } else {
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
    }
    //识别错误事件
    manager.onError = function (res) {
      console.log('manager.onError')
      console.log(res) //报错信息打印
      wx.showToast({
        title: '识别失败！',
        icon: 'error',
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
                  width: 37,
                  height: 37,
                  callout: {
                    content: "当前位置",
                    color: '#0000ff',
                    fontSize: 15,
                    borderRadius: 5,
                    borderWidth: 2,
                    borderColor: '#DDDDDD',
                    padding: 5,
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
  //长按按钮录音开始
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
  //松开按钮录音结束
  recordTerm: function (e) {
    console.log(e)
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
    }), clearInterval(this.timer);

    manager.stop();
    wx.showToast({
      title: '正在识别……',
      icon: 'loading',
      duration: 5000
    })
  },
  //放大缩小地图
  big(e) {
    console.log(e)
    var that = this
    if (that.data.isbig == false) {
      that.onLoad()
    }
    console.log(that.data.isbig)
    console.log(that.data.lat + ',' + that.data.lon)
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
        for (var i in res.data) {
          var index = String(90000000 + i)
          mark.push({
            iconPath: '../../images/busstop.png',
            title: res.data[i].title,
            id: index,
            longitude: res.data[i].location.lng,
            latitude: res.data[i].location.lat,
            distance: this.getDistance(that.data.lat, that.data.lon, res.data[i].location.lat, res.data[i].location.lng),
            width: 38,
            height: 38,
            callout: {
              content: res.data[i].title,
              color: '#0000ff',
              fontSize: 15,
              borderRadius: 5,
              borderWidth: 2,
              borderColor: '#DDDDDD',
              padding: 5,
              display: 'ALWAYS'
            }
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
            color: '#FF0000',
            fontSize: 18,
            borderRadius: 5,
            borderWidth: 2,
            borderColor: '#DDDDDD',
            padding: 5,
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
  //点击地点气泡事件
  bindshow(e) {
    console.log(e)
    var myid = e.detail.markerId
    //console.log(myid)
    var that = this
    that.setData({
      toViewid: `v${myid}`
    })
    console.log(that.data.toViewid)
    console.log(that.data.markers[1].id)
  },
  //获取目的名字
  getgoods: function (e) {
    console.log(e)
    this.setData({
      'addtext': e.detail.value
    })
  },
  //目的地方式选择
  goaddress: function (e) {
    var that = this
    that.setData({
      hidden: !that.data.hidden
    })
  },
  //关闭出行选择窗口
  candel_chose() {
    var that = this
    that.setData({
      hidden: !that.data.hidden
    })
  },
  //获取输入框焦点
  inputfouse(e) {
    var that = this
    that.setData({
      bindfocus: true
    })
  },
  //失去输入框焦点
  inputblur(e) {
    var that = this
    that.setData({
      bindfocus: false
    })
  },
  //公交出行(不可跨城市)
  gobus(e) {
    var that = this
    console.log(e)
    if (that.data.addtext == null || that.data.addtext == '') {
      wx.showToast({
        icon: 'error',
        title: '地址不能为空',
      })
      return false
    }
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
    this.setData({
      hidden: !this.data.hidden
    })
  },
  //自驾出行(可跨城市)
  gocart(e) {
    var that = this
    console.log(e)
    //通过地理位置名字获取经纬度
    qqmapsdk.geocoder({
      //获取表单传入地址
      address: that.data.addtext, //地址参数
      success: function (res) { //成功后的回调
        console.log(res)
        //获取高德地图自驾出行方案
        const promise = new Promise(function (resolve, reject) {
          wx.request({
            url: "https://restapi.amap.com/v3/direction/driving?origin=" + that.data.lon + "," + that.data.lat + "&destination=" + res.result.location.lng + "," + res.result.location.lat + "&extensions=all&output=json&key=83435cf7e1f8e7b06c1d9a5353e94c06",
            success: function (res) {
              console.log(res)
              resolve(res)
            },
            fail: () => {
              reject("系统异常，请重试！")
            }
          })
        })
        promise.then(function (res) {
          console.log(res.data.route.paths)
          var paths = JSON.stringify(res.data.route.paths);
          wx.navigateTo({
            url: '../../pages/cart/cart?paths=' + paths + '&goods=' + that.data.addtext + '&origin=' + res.data.route.origin + '&destination=' + res.data.route.destination
          })
        }, function () {})
      }
    })
    this.setData({
      hidden: !this.data.hidden
    })
  },
  //清空内容
  reset: function (e) {
    console.log(e)

    this.setData({
      addtext: ''
    })
    console.log(this.data.addtext)
  },
  //前往站牌
  gostop: function (e) {
    var that = this
    console.log(e)
    var stop_lat = e.currentTarget.dataset.latitude
    var stop_lon = e.currentTarget.dataset.longtitude
    var stop_name = e.currentTarget.dataset.name
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
      // console.log(steps)
      wx.navigateTo({
        url: '../../pages/walk/walk?stop_lat=' + stop_lat + '&stop_lon=' + stop_lon + '&stop_name=' + stop_name + '&now_lat=' + that.data.lat + '&now_lon=' + that.data.lon + '&steps=' + steps
      })
    }, function () {})

  },
  //点击识别图像
  cameraTap() {
    const that = this
    wx.chooseImage({
      success: (res) => {
        //获取图片的临时路径
        const tempFilePath = res.tempFilePaths[0]
        //根据官方的要求  用base64字符编码获取图片的内容
        wx.getFileSystemManager().readFile({
          filePath: tempFilePath,
          encoding: 'base64',
          success: function (res) {
            //调用方法
            that.getImgInfo(res.data)
          },
        })
      },
    })
  },
  //根据图片的内容调用API获取图片文字
  getImgInfo: function (imageData) {
    wx.showLoading({
      title: '识别中...',
    })
    var that = this
    that.getBaiduToken().then(res => {
      console.log(res)
      //获取token
      const token = res.data.access_token
      console.log(token)
      const detectUrl = `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${token}` // baiduToken是已经获取的access_Token      
      wx.request({
        url: detectUrl,
        data: {
          image: imageData
        },
        method: 'POST',
        dataType: 'json',
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 必须的        
        },
        success: function (res, resolve) {
          console.log(res)
          //将 res.data.words_result数组中的内容加入到中  
          var wordsstr = res.data.words_result.map(function (obj, index) {
            return obj.words
          })
          that.setData({
            addtext: wordsstr
          })
          console.log('识别后：' + res.data.words_result)
          wx.hideLoading()
        },
        fail: function (res, reject) {
          console.log('get word fail：', res.data);
          wx.hideLoading()
        },
        complete: function () {
          wx.hideLoading()
        }
      })
    })
  },
  // 获取百度access_token  
  getBaiduToken: function () {
    return new Promise(resolve => {
      var APIKEY = "U5DEIIPalSea6L8pjnjegwgc"
      var SECKEY = "h5xGvGMSPc6TN5ZG69uTy7VlMXiTGKeg"
      var tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${APIKEY}&client_secret=${SECKEY}`
      var that = this;
      wx.request({
        url: tokenUrl,
        method: 'POST',
        dataType: 'json',
        header: {
          'content-type': 'application/json; charset-UTF-8'
        },
        success: function (res) {
          console.log("[BaiduToken获取成功]", res);
          return resolve(res)
        },
        fail: function (res) {
          console.log("[BaiduToken获取失败]", res);
          return resolve(res)
        }
      })
    })
  },
  //设置下拉刷新
  onPullDownRefresh: function () {
    var that = this
    wx.showNavigationBarLoading() //在标题栏中显示加载
    //模拟加载
    setTimeout(function (res) {
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
      that.onLoad();
    }, 1500);
  },
  onShow: function () {
    console.log(getCurrentPages())
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    //加载页面
    this.onLoad();
  }
})