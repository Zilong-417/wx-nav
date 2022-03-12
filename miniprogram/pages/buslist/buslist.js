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

        var stoplist = JSON.parse(options.goplan)
        console.log(stoplist)
        var goods = options.goods
        var stop = []
        for (var p in stoplist) {
            console.log(stoplist)
            console.log(stoplist[p].cost)
            var ways = stoplist[p].segments
            console.log(ways[0].bus.buslines[0].via_stops)
            stop.push({
                cost: stoplist[p].cost, //花费
                walk_dis: stoplist[p].walking_distance, //行走距离
                sum_time: Math.round(stoplist[p].duration / 3600 * 100) / 100, //总用时
                stopname: ways[0].bus.buslines[0].departure_stop.name, //站牌名
                stoplocation: ways[0].bus.buslines[0].departure_stop.location, //首站牌坐标
                busname: String(ways[0].bus.buslines[0].name).split('(')[0], //路线名
                buspolyline: ways[0].bus.buslines[0].polyline, //行驶路线
                via_stops: ways[0].bus.buslines[0].via_stops, //途径站点
                origin_location: ways[0].walking.origin, //步行起始位置
                destination_location: ways[0].walking.destination, //步行终点位置
                steps: ways[0].walking.steps //步行方案
            })
            console.log(stop)
        }
        this.setData({
            stops: stop,
            goods: goods
        })
    },
    //前往公交详情页
    gobusdetail(e) {
        console.log(e)
        var that = this
        var stop = that.data.stops
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