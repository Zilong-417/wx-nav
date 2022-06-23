// pages/walk/walk.js
var app = getApp()
// 引入SDK核心类
var QQMapWX = require('../../lib/qqmap-wx-jssdk');
// 实例化API核心类
var qqmapsdk;
//引入插件：微信同声传译
const plugin = requirePlugin('WechatSI');
var utils=require('../../util/util.js')
Page({
    /**
     * 页面的初始数据
     */
    data: {
        markers: [],
        scale_change: false,
        road_detail: true,
        step_ways: [],
        src: '',
        show_nowaction: [],
        falg1: true,
        judge:utils.flag(50)
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        console.log(getCurrentPages())
        var that = this
        var steps = JSON.parse(options.steps) //行走路线
        console.log(steps)
        var mark = []
        var points = []
        var step_way = []
        var show1 = []
        //终点
        mark.push({
            markerId: 1,
            title: '终点',
            latitude: options.stop_lat,
            longitude: options.stop_lon,
            iconPath: "../../images/to.png",
            width: 40,
            height: 40,
        })
        //起点
        mark.push({
            markerId: 2,
            title: '起点',
            latitude: options.now_lat,
            longitude: options.now_lon,
            iconPath: "../../images/from.png",
            width: 40,
            height: 40
        })
        //行走路线点报点
        for (var i = 0; i < steps.length; i++) {
            var that = this
            var instruction = steps[i].instruction
            var action = steps[i].action
            var po_Len = steps[i].polyline.split(';');
            console.log(po_Len)
            step_way.push({
                instruction: instruction,
                action: action,
                action1_location: po_Len[0],
                action2_location: po_Len[po_Len.length - 1],
            })
            console.log(step_way);
            that.setData({
                step_ways: step_way
            })
        }
        //行走路线坐标处理
        for (var i = 0; i < steps.length; i++) {
            var po_Len = steps[i].polyline.split(';');
            for (var j = 0; j < po_Len.length; j++) {
                points.push({
                    longitude: parseFloat(po_Len[j].split(',')[0]), //split(',')表示把指定的字符串按照","来拆分成字符串数组,[0]是拆分出来的数组第一个元素了。
                    latitude: parseFloat(po_Len[j].split(',')[1])
                })
            }
        }
        console.log(points)
        console.log(mark)
        //获取实时位置改变
        wx.startLocationUpdateBackground({
            success: (res) => {
                // 计算距离函数
                var distance = function (lat1, lng1, lat2, lng2) {
                    var radLat1 = lat1 * Math.PI / 180.0
                    var radLat2 = lat2 * Math.PI / 180.0
                    var a = radLat1 - radLat2;
                    var b = (lng1 * Math.PI / 180.0) - (lng2 * Math.PI / 180.0);
                    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
                    s = s * 6378.137;
                    s = Math.round(s * 10000) / 10;
                    s = s.toFixed(1) //保留两位小数
                    console.log('经纬度计算的距离:' + s)
                    return Number(s)
                }
                //成功的逻辑
                wx.onLocationChange((res) => { //获取实时的定位信息
                    console.log(res)
                    var that = this
                    console.log(res.latitude + '/' + res.longitude)
                    // this.mapCtx.translateMarker({
                    //     markerId: 0,
                    //     destination: {
                    //         latitude:options.stop_lat,
                    //         longitude: options.stop_lon
                    //     },
                    //     rotate: 40,
                        
                    //     success: res => {
                    //         console.log('translateMarker success');
                    //     },
                    //     fail: err => {
                    //         console.log('translateMarker fail', err);
                    //     }
                    // })
                    mark.unshift({
                        markerId: 0,
                        title: '当前位置',
                        latitude: res.latitude,
                        longitude: res.longitude
                    })
                    mark.splice(0, mark.length - 3)
                    console.log(mark)
                    console.log(step_way)
                    //查看当前位置与报点
                    for (var i = 0; i < step_way.length; i++) {
                        var x = step_way[i].action1_location.split(',')
                        var y = step_way[i].action2_location.split(',')
                        var action1_lat = x[1]
                        var action1_lon = x[0]
                        var action2_lat = y[1]
                        var action2_lon = y[0]
                        console.log(action1_lon + ',' + action1_lat)
                        var action1_dis = distance(res.latitude, res.longitude, action1_lat, action1_lon)
                        console.log('离标志点1:' + action1_dis)
                        var action2_dis = distance(res.latitude, res.longitude, action2_lat, action2_lon)
                        console.log('离标志点2:' + action2_dis)
                        var action3_dis = distance(action1_lat, action1_lon, action2_lat, action2_lon)
                        console.log('报点两点距离:' + action3_dis)
                        if (action1_dis <5) {
                            var that = this
                            //console.log('falg3' + that.data.falg3)
                            var flag1=that.data.judge[i]
                            if (flag1) {
                                show1.unshift({
                                    id: 0,
                                    voice: step_way[i].instruction
                                })
                                that.setData({
                                    ['judge'+'['+i+']']:!flag1,
                                    voice: show1[0].voice
                                })
                                console.log('这里的步行指引为：' + that.data.voice)
                            } else {
                                continue
                            }
                        }else{
                            var that = this
                            console.log('falg1' + that.data.falg1)
                            if (that.data.falg1) {
                                show1.unshift({
                                    id: 0,
                                    voice: '按照步行导航路线行走哦！'
                                })
                                that.setData({
                                    falg1: false,
                                    voice: show1[0].voice
                                })
                                console.log('这里的步行指引为：' + that.data.voice)
                                console.log('flag1：' + that.data.falg1)
                            } else {
                                continue
                            }
                        }
                        console.log(that.data.judge)
                        var content = that.data.voice;
                        plugin.textToSpeech({
                            lang: "zh_CN",
                            tts: true,
                            content: content,
                            success: function (res) {
                                console.log(res);
                                console.log("succ tts", res.filename);
                                that.setData({
                                    src: res.filename
                                })
                                that.yuyinPlay();
                            },
                            fail: function (res) {
                                console.log("fail tts", res)
                            }
                        })
                    }
                    that.setData({
                        markers: mark,
                        polyline: [{
                            points: points,
                            color: "#0066FF",
                            width: 6,
                            arrowLine:true
                        }],
                        steps: steps,
                        stop_name: options.stop_name
                    })
                })
            },
            fail: (err) => {
                //失败的逻辑
                //1.wx.showModal引导用户授权
                //2.通过wx.openSetting让用户开启权限
                wx.showModal({ //引导用户授权
                    content: '请手动打开权限',
                    confirmText: "确认",
                    cancelText: "取消",
                    success: function (res) {
                        //点击“确认”时打开设置页面
                        if (res.confirm) {
                            wx.openSetting({ //打开设置页面让用户选择权限
                                success: (res) => {
                                    if (res.authSetting["scope.userLocationBackground"] == true) {
                                        wx.onLocationChange((data) => { //实时获取用户最新的经纬度信息
                                            console.log(data)
                                        })
                                    }
                                }
                            })
                        } else { //取消打开设置授权页面
                            wx.showToast({
                                title: "取消授权~",
                                icon: 'none',
                            })
                        }
                    }
                })
            }
        })
    },
    //地图放大
    big() {
        var that = this
        that.setData({
            scale_change: true
        })
    },
    //地图缩小
    small() {
        var that = this
        that.setData({
            scale_change: false
        })
    },
    //底部路线详情
    navigation_show(e) {
        console.log(e)
        var that = this
        if (that.data.road_detail == true) {
            that.setData({
                road_detail: !that.data.road_detail,
                road_detail_change: 'road_detail_change'
            })
        } else {
            that.setData({
                road_detail: !that.data.road_detail,
                road_detail_change: ''
            })
        }
    },
    //播放语音
    yuyinPlay: function (e) {
        if (this.data.src == '') {
            console.log(暂无语音);
            return;
        }
        this.innerAudioContext.src = this.data.src //设置音频地址
        this.innerAudioContext.play(); //播放音频
    },
    // 暂停语音
    end: function (e) {
        this.innerAudioContext.pause(); //暂停音频
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function (res) {
        //this.mapCtx = wx.createMapContext('map')
        //创建内部 audio 上下文 InnerAudioContext 对象。
        this.innerAudioContext = wx.createInnerAudioContext();
        this.innerAudioContext.onError(function (res) {
            console.log(res);
            wx.showToast({
                title: '语音播放失败',
                icon: 'none',
            })
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        //重新加载页面
        this.onLoad();
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
        //关闭页面暂停语音
        this.innerAudioContext.pause(); //暂停音频
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
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

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})