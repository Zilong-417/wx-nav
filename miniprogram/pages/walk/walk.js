// pages/walk/walk.js
var app = getApp()
// 引入SDK核心类
var QQMapWX = require('../../lib/qqmap-wx-jssdk');
// 实例化API核心类
var qqmapsdk;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        markers: [],
        scale_change: false,
        road_detail: true,
        step_ways: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        var steps = JSON.parse(options.steps) //行走路线
        console.log(steps)
        var mark = []
        var points = []
        var step_way = []
        //终点
        mark.push({
            id: 1,
            title: '终点',
            latitude: options.stop_lat,
            longitude: options.stop_lon,
            iconPath: "../../images/to.png",
            width: 40,
            height: 40,
            callout: {
                content: "终点",
                color: '#0000ff',
                fontSize: 20,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: '#0000ff',
                padding: 2,
                display: 'ALWAYS'
            }

        })
        //起点
        mark.unshift({
            id: 0,
            title: '起点',
            latitude: options.now_lat,
            longitude: options.now_lon,
            iconPath: "../../images/from.png",
            width: 40,
            height: 40,
            callout: {
                content: "起点",
                color: '#0000ff',
                fontSize: 20,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: '#0000ff',
                padding: 2,
                display: 'ALWAYS'
            }
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
        var that = this
        //获取实时位置改变
        wx.startLocationUpdateBackground({
            success: (res) => {
                // 计算距离函数
                var distance = function (la1, lo1, la2, lo2) {
                    var La1 = la1 * Math.PI / 180.0;
                    var La2 = la2 * Math.PI / 180.0;
                    var La3 = La1 - La2;
                    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
                    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
                    s = s * 6378.137;
                    s = Math.round(s * 10000) / 10;
                    s = s.toFixed(2);
                    return s;
                }
                //成功的逻辑
                wx.onLocationChange((res) => { //获取实时的定位信息
                    var that = this
                    mark.push({
                        id: 2,
                        title: '爷在这里',
                        latitude: String(res.latitude),
                        longitude: String(res.longitude),
                        iconPath: "../../images/oldman.png",
                        width: 40,
                        height: 40,
                        callout: {
                            content: "👴在这",
                            color: '#000000',
                            fontSize: 20,
                            borderRadius: 5,
                            borderWidth: 1,
                            borderColor: '#0000ff',
                            padding: 2,
                            display: 'ALWAYS'
                        }
                    })
                    mark.splice(2, mark.length - 3)
                    console.log(mark)
                    //查看当前位置是否与报点相同
                    for (var i = 0; i < step_way.length; i++) {
                        var x = step_way[i].action1_location.split(',')
                        var action1_lon = x[0]
                        var action1_lat = x[1]
                        var y = step_way[i].action2_location.split(',')
                        var action2_lon = y[0]
                        var action2_lat = y[1]
                        console.log(action1_lon + ',' + action1_lat + ',' + action2_lon + ',' + action2_lat)
                        var action1_dis = distance(res.latitude, res.longitude, action1_lat, action1_lon)
                        var action2_dis = distance(res.latitude, res.longitude, action2_lat, action2_lon)
                        console.log(action2_dis+','+action1_dis)
                        if (action1_dis<5&&action1_dis>0) {
                            that.setData({
                                show_nowaction: step_way[i].instruction
                            })
                        } else if (action2_dis<5&&action2_dis>0) {
                            that.setData({
                                show_nowaction: step_way[i].action
                            })
                        }else{
                            that.setData({
                                show_nowaction: '爷爷，记得按照导航路线走哦！'
                            })
                        }
                    }
                    that.setData({
                        markers: mark,
                        polyline: [{
                            points: points,
                            color: "#0091ff",
                            width: 6
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
     */
    onPullDownRefresh: function () {

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