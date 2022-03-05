/*trip.js */
var app = getApp();
//获取录音管理器对象
var rm = wx.getRecorderManager();
//创建内部 audio 上下文 InnerAudioContext 对象
var innerAudioContext = wx.createInnerAudioContext()
//引入语音识别插件
let plugin = requirePlugin("QCloudAIVoice");
plugin.setQCloudSecret(1309974719, "AKIDwiEUUCdoiLhndCUVFiupTqwlJaaIjtmO", "MRFm22kBMGtFK8gxxg8JDqBG5cssb2C6", true);
let manager = plugin.getRecordRecognitionManager(); //获取全局唯一的语音识别管理器
var init // 声明一个全局变量，let为局部变量
// 引入SDK核心类
var QQMapWX = require('../../lib/qqmap-wx-jssdk');
// 实例化API核心类
var qqmapsdk;
//录音停止时调用，录音结束时自己触发
rm.onStop(function (e) {
    var a = this;
    wx.showLoading({
      title: "正在识别..."
    });

    //上传逻辑，获取到了录音文件的路径
    var n = {
      url: app.globalData.url + "upload",
      filePath: e.tempFilePath,
      name: "wx_record",
      header: {
        "Content-Type": "application/json"
      },
      success: function (_res) {

      }
    };
    //把录音发送到后台
    wx.uploadFile(n);
  }),

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
      var a = this;
      wx.authorize({
        scope: "scope.record",
        success: function () {
          console.log("录音授权成功");
        },
        fail: function () {
          console.log("录音授权失败");
        }
      }), a.onShow()
      var that = this;
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
                    address: ad,
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
              lon: res.longitude
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
      var that = this;
      //开始录音
      rm.start({
        format: "mp3",
        sampleRate: 32e3,
        encodeBitRate: 192e3
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
      rm.stop(),
        this.setData({
          isTouchEnd: true,
          isTouchStart: false,
          touchEnd: e.timeStamp,
          showPg: false,
          value: 100
        }), clearInterval(this.timer);
    },
    //放大地图
    big(e) {
      console.log(e)
      var that = this
      qqmapsdk.search({
        keyword: '公交',
        location: that.data.lat + ',' + that.data.lon,
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
            })
          }
          mark.unshift({
            iconPath: '../../images/from.png',
            id: 0,
            longitude: that.data.lon,
            latitude: that.data.lat,
            address: that.data.address,
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
          that.setData({
            markers: mark,
            isbig: e.target.dataset.isbig
          })
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
      // let plugin = requirePlugin('routePlan');
      // var key = 'VDUBZ-LMOEX-Y7J4V-TIIKL-U2H62-JLFGY'; //使用在腾讯位置服务申请的key
      // var referer = 'the older helper'; //调用插件的app的名称
      // var themeColor = '#7B68EE'; //主题颜色
      // 调用接口
      //通过地理位置名字获取经纬度
      qqmapsdk.geocoder({
        //获取表单传入地址
        address: that.data.addtext, //地址参数
        success: function (res) { //成功后的回调
          console.log(res)
          // let startPoint = JSON.stringify({ //起点
          //   'name': '当前位置',
          //   'latitude': '',
          //   'longitude': ''
          // });
          // let endPoint = JSON.stringify({ //终点
          //   'name': that.data.addtext,
          //   'latitude': lati,
          //   'longitude': longi
          // });
          // wx.navigateTo({
          //   url: 'plugin://routePlan/route-plan?key=' + key + '&referer=' + referer + '&endPoint=' + endPoint + '&themeColor=' + themeColor
          // });
          //获取高德地图公交站信息
          const promise=new Promise(function(resolve,reject){
            wx.request({
              url: "https://restapi.amap.com/v3/direction/transit/integrated?origin=" + that.data.lon + "," + that.data.lat + "&destination=" + res.result.location.lng + "," + res.result.location.lat + "&city=佛山&output=json&key=83435cf7e1f8e7b06c1d9a5353e94c06",
              success: function (res) {
                console.log(res.data.route.transits)
                resolve(res)
              },
              fail:()=>{
                reject("系统异常，请重试！")
              }
            })
          })
          promise.then(function(res){
            var route=JSON.stringify(res.data.route.transits);
            // //res.data.route.transits=eval('('+route+')')
            // var obj= rpn.calCommonExp(res.data.route.transits)
            wx.navigateTo({
              url:'../../pages/buslist/buslist?goplan='+route
            })
          },function(){})

          
          
        }
        
      })
     

    },
    //清空内容
    reset: function (e) {
      console.log(e)
      this.setData({
        'addtext': ''
      })

    }
  })