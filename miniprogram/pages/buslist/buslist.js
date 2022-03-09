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
            console.log(stoplist[p].cost)
            // for(var q in ways){
            //     var goways=ways[q].bus.buslines
            //     console.log(goways)
            //     for(var r in goways){
            //         var busname=goways[0].name
            //         console.log(busname)

            //     }
            // }
            var ways = stoplist[p].segments
            stop.push({
                cost: stoplist[p].cost, //花费
                walk_dis: stoplist[p].walking_distance, //行走距离
                sum_time: Math.round(stoplist[p].duration / 3600 * 100) / 100, //总用时
                stopname: ways[0].bus.buslines[0].departure_stop.name,
                busname: String(ways[0].bus.buslines[0].name).slice(0, 6),
                buspolyline: ways[0].bus.buslines[0].polyline
            })
            console.log(stop)

        }
        this.setData({
            stops: stop,
            goods: goods
        })
    },
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