// pades/busdetail/busdetail.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        stopdetail: [],
        markers:[]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        var stops = JSON.parse(options.stop)
        console.log(stops)
        var stopde = []
        var points = []
        var mark=[]
        var busname = options.busname
        var cost = options.cost
        var sumtime = options.sumtime
        //路线坐标处理
        var po_Len = stops.buspolyline.split(';');
        console.log(po_Len)
        for (var j = 0; j < po_Len.length; j++) {
            points.push({
                longitude: parseFloat(po_Len[j].split(',')[0]),
                latitude: parseFloat(po_Len[j].split(',')[1]),
            })
        }
        console.log(points)
        stopde.push({
            busname: busname,
            cost: cost,
            sumtime: sumtime
        })
        //获取实时位置改变
        wx.startLocationUpdateBackground({
            success: (res) => {
                //成功的逻辑
                wx.onLocationChange((res) => { //获取实时的定位信息
                    var that = this
                    mark.push({
                        id: 0,
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
                    mark.splice(0, mark.length - 1)
                    console.log(mark)
                    that.setData({
                        markers: mark
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
        console.log(points)
        var that = this
        that.setData({
            stopdetail: stopde,
            polyline: [{
                points: points,
                color: "#0091ff",
                width: 6
            }],
            busname: busname
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