// pages/cart/cart.js
var app = getApp()
// 引入SDK核心类
var QQMapWX = require('../../lib/qqmap-wx-jssdk');
// 实例化API核心类
var qqmapsdk;
//引入插件：微信同声传译
const plugin = requirePlugin('WechatSI');
var utils = require('../../util/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        markers: [],
        road_detail: true,
        scale_change: false,
        step_ways: [],
        src: '',
        show_nowaction: [],
        falg1: true,
        judge: utils.flag(100),
        judge2: utils.flag(100),
        i: 0,
        distance:0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options.origin + '/' + options.destination)
        var that = this
        var goods = options.goods //目的地
        var origin = options.origin //起点
        var destination = options.destination //终点
        var paths = JSON.parse(options.paths) //自驾路线
        var steps = paths[0].steps
        var distance = paths[0].distance //驾驶路程距离
        var duration = paths[0].duration //预计时间
        var traffic_lights = paths[0].traffic_lights //红绿灯数量
        var mark = []
        var points = [] //路线坐标
        var step_way = []
        var show1 = []
        var action3_dis = []
        console.log(steps)
        console.log(paths)
        //终点
        mark.push({
            markerId: 1,
            title: '终点',
            latitude: options.destination.split(',')[1],
            longitude: options.destination.split(',')[0],
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
        //自驾路线详细
        for (var i = 0; i < steps.length; i++) {
            if (steps.length - i > 1) {
                if (steps[i + 1].road == undefined) {
                    var road = '未命名路'
                } else {
                    var road = steps[i + 1].road
                }
            } else {
                continue
            }
            var that = this
            var instruction = steps[i].instruction
            var action = steps[i].action
            var item_distance = steps[i].distance
            var po_Len = steps[i].polyline.split(';');
            console.log(po_Len)
            console.log(road)
            step_way.push({
                instruction: instruction,
                action: action,
                item_distance: item_distance,
                road: road,
                action1_location: po_Len[0],
                action2_location: po_Len[po_Len.length - 1],
            })
            console.log(step_way);
            that.setData({
                step_ways: step_way
            })
        }
        //自驾路线坐标处理
        for (var i = 0; i < steps.length; i++) {
            var po_Len = steps[i].polyline.split(';');
            for (var j = 0; j < po_Len.length; j++) {
                points.push({
                    longitude: parseFloat(po_Len[j].split(',')[0]), //split(',')表示把指定的字符串按照","来拆分成字符串数组,[0]是拆分出来的数组第一个元素了。
                    latitude: parseFloat(po_Len[j].split(',')[1])
                })
            }
        }
        //获取实时位置改变
        wx.startLocationUpdateBackground({
            success: (res) => {
                // 计算距离函数
                var distance = function (lat1, lng1, lat2, lng2) {
                    // var radLat1 = lat1 * Math.PI / 180.0
                    // var radLat2 = lat2 * Math.PI / 180.0
                    // var a = radLat1 - radLat2;
                    // var b = (lng1 * Math.PI / 180.0) - (lng2 * Math.PI / 180.0);
                    // var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
                    // s = s * 6378.137;
                    // s = Math.round(s * 10000) / 10;
                    // s = s.toFixed(1) //保留两位小数
                    //获取自驾高德地图两点距离
                    var that=this
                    wx.request({
                        url: "https://restapi.amap.com/v3/distance?key=83435cf7e1f8e7b06c1d9a5353e94c06&origins=" + lng2 + "," + lat2 + "&destination=" + lng1 + "," + lat1 + "&type=1",
                        method:"GET",
                        success:function(res){                                                                          
                            console.log(res.data.results[0].distance)
                            that.setData({
                                distance:[]
                            })
                        },
                        fail: () => {
                            reject("系统异常，请重试！")
                        }
                    })
                }
                //成功的逻辑
                wx.onLocationChange((res) => { //获取实时的定位信息
                    console.log(res)
                    var that = this
                    console.log(res.latitude + '/' + res.longitude)
                    mark.unshift({
                        markerId: 0,
                        title: '当前位置',
                        latitude: String(res.latitude),
                        longitude: String(res.longitude)
                    })
                    mark.splice(0, mark.length - 2)
                    console.log(mark)
                    //查看当前位置与报点
                    for (var i = 0; i < step_way.length; i++) {
                        var x = step_way[i].action1_location.split(',')
                        var y = step_way[i].action2_location.split(',')
                        var road = step_way[i].road
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
                        if (action1_dis < action3_dis / 2) {
                            var that = this
                            var flag1 = that.data.judge[i]
                            if (flag1) {
                                show1.unshift({
                                    id: 0,
                                    voice: step_way[i].instruction
                                })
                                that.setData({
                                    ['judge' + '[' + i + ']']: !flag1,
                                    voice: show1[0].voice,
                                    road: road,
                                    action: step_way[i].action,
                                    action2_dis: action2_dis
                                })
                                console.log('这里的自驾指引为：' + that.data.voice)
                            } else {
                                that.setData({
                                    action2_dis: action2_dis
                                })
                                continue
                            }
                        }
                        console.log(that.data.judge)
                    }
                    that.setData({
                        markers: mark
                    })
                })
            }
        })
        that.setData({
            goods: goods,
            origin: origin,
            destination: destination,
            steps: steps,
            polyline: [{
                points: points,
                color: "#00DD00",
                width: 8
            }],
            distance: (distance / 1000).toFixed(1),
            duration: (duration / 60).toFixed(2),
            traffic_lights: traffic_lights
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
    onReady: function () {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        // this.mapCtx = wx.createMapContext('map')
        // this.mapCtx.moveToLocation()
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