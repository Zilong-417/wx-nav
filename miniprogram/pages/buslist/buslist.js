// pages/buslist/buslist.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        //公交站点
        stops: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(getCurrentPages())
        var stoplist = JSON.parse(options.goplan)
        var that = this
        console.log(stoplist)
        var goods = options.goods
        var stop = []
        var count = 0
        for (var p in stoplist) {
            console.log(stoplist)
            console.log(stoplist[p].cost)
            var ways = stoplist[p].segments
            console.log(ways[2] == undefined)
            console.log(ways)
            //只记录三程内的方案
            if (ways.length <= 4) {
                if ((stoplist[p].segments[2] != undefined && stoplist[p].segments[2].bus.buslines.length == 0)) {
                    console.log('第二：' + ways[1].bus.buslines.length + '****' + p)
                    count++
                    var stopname2 = ways[1].bus.buslines[0].departure_stop.name //第二程起点站牌名字
                    var stoplocation2 = ways[1].bus.buslines[0].departure_stop.location //第二程起点坐标
                    var stoplocation_name2 = ways[1].bus.buslines[0].departure_stop.name //第二程起点站牌名字
                    var arrival_stop2 = ways[1].bus.buslines[0].arrival_stop.location //第二程终点坐标
                    var arrival_stop_name2 = ways[1].bus.buslines[0].arrival_stop.name //第二程终点站牌名字
                    var busname2 = String(ways[1].bus.buslines[0].name).split('(')[0] //第二程路线名
                    var buspolyline2 = ways[1].bus.buslines[0].polyline //第二程行驶路线
                    var via_stops2 = ways[1].bus.buslines[0].via_stops //第二程途径站点
                    var origin_location2 = ways[1].walking.origin //步行起始位置
                    var destination_location2 = ways[1].walking.destination //第二程步行终点位置
                    var steps2 = ways[1].walking.steps //第二程步行方案
                    var walkdis2 = ways[1].walking.distance
                    var istransfer1 = ways[1].bus.buslines.length
                    stop.push({
                        cost: stoplist[p].cost, //总花费
                        sum_time: Math.round(stoplist[p].duration / 3600 * 100) / 100, //总用时
                        walk_dis: stoplist[p].walking_distance, //第一程前往站牌行走距离
                        stopname: ways[0].bus.buslines[0].departure_stop.name, //第一程站牌名
                        stoplocation: ways[0].bus.buslines[0].departure_stop.location, //第一程起点坐标
                        stoplocation_name: ways[0].bus.buslines[0].departure_stop.name, //第一程起点站牌名字
                        arrival_stop: ways[0].bus.buslines[0].arrival_stop.location, //第一程终点坐标
                        arrival_stop_name: ways[0].bus.buslines[0].arrival_stop.name, //第一程终点站牌名字
                        busname: String(ways[0].bus.buslines[0].name).split('(')[0], //第一程路线名
                        buspolyline: ways[0].bus.buslines[0].polyline, //第一程行驶路线
                        via_stops: ways[0].bus.buslines[0].via_stops, //第一程途径站点
                        origin_location: ways[0].walking.origin, //步行起始位置
                        destination_location: ways[0].walking.destination, //第一程步行终点位置
                        steps: ways[0].walking.steps, //第一程步行方案
                        istransfer0: 0,
                        istransfer1: istransfer1, //判断是否要换乘
                        istransfer2: 0,
                        //第二
                        stopname2: stopname2,
                        busname2: busname2,
                        buspolyline2: buspolyline2,
                        via_stops2: via_stops2,
                        origin_location2: origin_location2,
                        destination_location2: destination_location2,
                        steps2: steps2,
                        walkdis2: walkdis2,
                        stoplocation2: stoplocation2,
                        stoplocation_name2: stoplocation_name2,
                        arrival_stop2: arrival_stop2,
                        arrival_stop_name2: arrival_stop_name2
                    })
                } else if (stoplist[p].segments[2] != undefined && stoplist[p].segments[2].bus.buslines.length != 0) {
                    console.log('第三层' + Number(ways[1].bus.buslines.length + ways[2].bus.buslines.length) + '****' + p)
                    count++
                    var stopname2 = ways[1].bus.buslines[0].departure_stop.name //第二程起点站牌名字
                    var stoplocation2 = ways[1].bus.buslines[0].departure_stop.location //第二程起点坐标
                    var stoplocation_name2 = ways[1].bus.buslines[0].departure_stop.name //第二程起点站牌名字
                    var arrival_stop2 = ways[1].bus.buslines[0].arrival_stop.location //第二程终点坐标
                    var arrival_stop_name2 = ways[1].bus.buslines[0].arrival_stop.name //第二程终点站牌名字
                    var busname2 = String(ways[1].bus.buslines[0].name).split('(')[0] //第二程路线名
                    var buspolyline2 = ways[1].bus.buslines[0].polyline //第二程行驶路线
                    var via_stops2 = ways[1].bus.buslines[0].via_stops //第二程途径站点
                    var origin_location2 = ways[1].walking.origin //步行起始位置
                    var destination_location2 = ways[1].walking.destination //第二程步行终点位置
                    var steps2 = ways[1].walking.steps //第二程步行方案
                    var walkdis2 = ways[1].walking.distance
                    var istransfer1 = ways[1].bus.buslines.length
                    var stopname3 = ways[2].bus.buslines[0].departure_stop.name //第三程起点站牌名字
                    var stoplocation3 = ways[2].bus.buslines[0].departure_stop.location //第三程起点坐标
                    var stoplocation_name3 = ways[2].bus.buslines[0].departure_stop.name //第三程起点站牌名字
                    var arrival_stop3 = ways[2].bus.buslines[0].arrival_stop.location //第三程终点坐标
                    var arrival_stop_name3 = ways[2].bus.buslines[0].arrival_stop.name //第三程终点站牌名字
                    var busname3 = String(ways[2].bus.buslines[0].name).split('(')[0] //第三程路线名
                    var buspolyline3 = ways[2].bus.buslines[0].polyline //第三程行驶路线
                    var via_stops3 = ways[2].bus.buslines[0].via_stops //第三程途径站点
                    var origin_location3 = ways[2].walking.origin //步行起始位置
                    var destination_location3 = ways[2].walking.destination //第三程步行终点位置
                    var steps3 = ways[2].walking.steps //第三程步行方案
                    var walkdis3 = ways[2].walking.distance
                    var istransfer1 = ways[1].bus.buslines.length + ways[2].bus.buslines.length
                    stop.push({
                        cost: stoplist[p].cost, //总花费
                        sum_time: Math.round(stoplist[p].duration / 3600 * 100) / 100, //总用时
                        walk_dis: stoplist[p].walking_distance, //第一程前往站牌行走距离
                        stopname: ways[0].bus.buslines[0].departure_stop.name, //第一程站牌名
                        stoplocation: ways[0].bus.buslines[0].departure_stop.location, //第一程起点坐标
                        stoplocation_name: ways[0].bus.buslines[0].departure_stop.name, //第一程起点站牌名字
                        arrival_stop: ways[0].bus.buslines[0].arrival_stop.location, //第一程终点坐标
                        arrival_stop_name: ways[0].bus.buslines[0].arrival_stop.name, //第一程终点站牌名字
                        busname: String(ways[0].bus.buslines[0].name).split('(')[0], //第一程路线名
                        buspolyline: ways[0].bus.buslines[0].polyline, //第一程行驶路线
                        via_stops: ways[0].bus.buslines[0].via_stops, //第一程途径站点
                        origin_location: ways[0].walking.origin, //步行起始位置
                        destination_location: ways[0].walking.destination, //第一程步行终点位置
                        steps: ways[0].walking.steps, //第一程步行方案
                        istransfer0: 0,
                        istransfer1: 1,
                        istransfer2: istransfer1, //判断是否要换乘
                        //第二
                        stopname2: stopname2,
                        busname2: busname2,
                        buspolyline2: buspolyline2,
                        via_stops2: via_stops2,
                        origin_location2: origin_location2,
                        destination_location2: destination_location2,
                        steps2: steps2,
                        walkdis2: walkdis2,
                        stoplocation2: stoplocation2,
                        stoplocation_name2: stoplocation_name2,
                        arrival_stop2: arrival_stop2,
                        arrival_stop_name2: arrival_stop_name2,
                        //第三
                        stopname3: stopname3,
                        busname3: busname3,
                        buspolyline3: buspolyline3,
                        via_stops3: via_stops3,
                        origin_location3: origin_location3,
                        destination_location3: destination_location3,
                        steps3: steps3,
                        walkdis3: walkdis3,
                        stoplocation3: stoplocation3,
                        stoplocation_name3: stoplocation_name3,
                        arrival_stop3: arrival_stop3,
                        arrival_stop_name3: arrival_stop_name3,
                    })
                } else {
                    console.log('第一：' + '0')
                    count++
                    stop.push({
                        cost: stoplist[p].cost, //总花费
                        sum_time: Math.round(stoplist[p].duration / 3600 * 100) / 100, //总用时
                        walk_dis: stoplist[p].walking_distance, //第一程前往站牌行走距离
                        stopname: ways[0].bus.buslines[0].departure_stop.name, //第一程站牌名
                        stoplocation: ways[0].bus.buslines[0].departure_stop.location, //第一程站牌坐标
                        stoplocation_name: ways[0].bus.buslines[0].departure_stop.name, //第一程终点名字
                        busname: String(ways[0].bus.buslines[0].name).split('(')[0], //第一程路线名
                        buspolyline: ways[0].bus.buslines[0].polyline, //第一程行驶路线
                        via_stops: ways[0].bus.buslines[0].via_stops, //第一程途径站点
                        origin_location: ways[0].walking.origin, //步行起始位置
                        destination_location: ways[0].walking.destination, //第一程步行终点位置
                        steps: ways[0].walking.steps, //第一程步行方案
                        istransfer0: 0, //判断是否要换乘
                        istransfer1: 0,
                        istransfer2: 0
                    })
                }
            }
        }
        if (count == 0) {
            wx.showModal({
                title: '提示',
                content: '很抱歉！由于目的位置过远，没有找到合适的公交',
                success(res) {
                    if (res.confirm) {
                        console.log('用户点击确定')
                        wx.redirectTo({
                            url: '../../pages/trip/trip',
                        })
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            })
        }
        this.setData({
            stops: stop,
            goods: goods,
            stop_box_left_change: 'stop_box_left_change'
        })
    },
    //前往公交详情页
    gobusdetail(e) {
        console.log(e)
        var that = this
        var stop = that.data.stops
        console.log(that.data.stops)
        console.log(e.currentTarget.dataset.busname)
        for (var i = 0; i < stop.length; i++) {
            console.log(stop[i].busname)
            if (stop[i].busname == e.currentTarget.dataset.busname) {
                var stop = JSON.stringify(that.data.stops[i]);
                wx.navigateTo({
                    url: '../../pages/busdetail/busdetail?busname=' + e.currentTarget.dataset.busname + '&cost=' + e.currentTarget.dataset.cost + '&sumtime=' + e.currentTarget.dataset.sumtime + '&stop=' + stop
                })

            }
        }
        that.setData({
            busname1: e.currentTarget.dataset.busname,
            cost1: e.currentTarget.dataset.cost,
            sumtime1: e.currentTarget.dataset.sumtime
        })

    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        console.log(this.data.stops)
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function (e) {

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