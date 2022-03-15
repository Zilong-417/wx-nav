// pades/busdetail/busdetail.js
var app = getApp()
//引入插件：微信同声传译
const plugin = requirePlugin('WechatSI');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        stopdetail: [],
        markers: [],
        hidden: true,
        falg: true,
        falg1: true,
        src: '',
        voiceup: false
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
        var mark = []
        var via_stops = [] //第一程
        var via_stops2 = [] //第二程
        var show = []
        var busname = options.busname //第一程公交路线名
        var cost = options.cost //花费
        var sumtime = options.sumtime //总用时
        var viastop = stops.via_stops //第一程途径站点
        var stopname = stops.stopname //第一程站牌名
        var stoplocation = stops.stoplocation //第一程首站牌坐标
        var stoplocation_name = stops.stoplocation_name //第一程首站牌名
        var arrival_stop = stops.arrival_stop
        var arrival_stop_name = stops.arrival_stop_name
        var steps = stops.steps //第一程步行路线
        var origin_location = stops.origin_location //第一程起点坐标
        var destination_location = stops.destination_location //第一程终点坐标

        var istransfer = stops.istransfer //换乘数

        var busname2 = stops.busname2 //第二程公交路线名
        var viastop2 = stops.via_stops2 //第二程途径站点
        var stopname2 = stops.stopname2 //第二程站牌名
        var stoplocation2 = stops.stoplocation2 //第二程首站牌坐标
        var stoplocation_name2 = stops.stoplocation_name2 //第二程首站牌名
        var arrival_stop2 = stops.arrival_stop2 //第二程终点坐标
        var arrival_stop_name2 = stops.arrival_stop_name2 //第二程终点名
        var steps2 = stops.steps2 //第二程步行路线
        var origin_location2 = stops.origin_location2 //第二程起点坐标
        var destination_location2 = stops.destination_location2 //第二程终点坐标
        var walkdis2 = stops.walkdis2 //第二程行走距离
        console.log(origin_location + '/' + origin_location)

        //车程坐标处理
        if (istransfer > 0) {
            var po_Len = (stops.buspolyline + stops.buspolyline2).split(';');
        } else {
            var po_Len = stops.buspolyline.split(';');
        }
        console.log(po_Len)
        for (var j = 0; j < po_Len.length; j++) {
            points.push({
                longitude: parseFloat(po_Len[j].split(',')[0]),
                latitude: parseFloat(po_Len[j].split(',')[1]),
            })
        }
        console.log(points)
        //站牌信息

        stopde.push({
            busname2: busname2,
            busname: busname,
            cost: cost,
            sumtime: sumtime
        })

        //第一程途径站点坐标处理
        for (var i = 0; i < viastop.length; i++) {
            console.log(viastop[i].name + '/' + viastop[i].location)
            via_stops.push({
                index: i + 2,
                via_stops: viastop[i].name,
                longitude: parseFloat(viastop[i].location.split(',')[0]),
                latitude: parseFloat(viastop[i].location.split(',')[1]),
                isthis: false
            })
        }
        //第二程途径站点坐标处理
        if (istransfer > 0) {
            for (var j = 0; j < viastop2.length; j++) {
                console.log(viastop2[j].name + '/' + viastop2[j].location)
                via_stops2.push({
                    index: j + 2,
                    via_stops: viastop2[j].name,
                    longitude: parseFloat(viastop2[j].location.split(',')[0]),
                    latitude: parseFloat(viastop2[j].location.split(',')[1]),
                    isthis: false
                })
            }
            //第二程路线的第一个站点
            via_stops2.unshift({
                index: 1,
                via_stops: stoplocation_name2,
                longitude: parseFloat(stoplocation2.split(',')[0]),
                latitude: parseFloat(stoplocation2.split(',')[1]),
                isthis: false
            })
            //第二程终点下车
            via_stops2.push({
                index: via_stops2.length + 1,
                via_stops: arrival_stop_name2 + '要下车啦',
                longitude: parseFloat(arrival_stop2.split(',')[0]),
                latitude: parseFloat(arrival_stop2.split(',')[1]),
                isthat: true
            })
        }
        //第一程路线的第一个站点为用户点击的站点
        via_stops.unshift({
            index: 1,
            via_stops: stopname,
            longitude: parseFloat(stoplocation.split(',')[0]),
            latitude: parseFloat(stoplocation.split(',')[1]),
            isthis: false
        })
        //第一程终点下车
        via_stops.push({
            index: via_stops.length + 1,
            via_stops: arrival_stop_name + '要下车啦',
            longitude: parseFloat(arrival_stop.split(',')[0]),
            latitude: parseFloat(arrival_stop.split(',')[1]),
            isthat: true
        })
        console.log(via_stops)
        //获取用户实时位置改变
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
                    var that = this
                    mark.unshift({
                        id: 0,
                        title: '当前位置',
                        latitude: String(res.latitude),
                        longitude: String(res.longitude),
                        iconPath: "../../images/oldman.png",
                        width: 40,
                        height: 40,
                        callout: {
                            content: "当前位置",
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
                    //当前位置与第一程站牌距离逻辑
                    for (var i = 1; i < via_stops.length - 2; i++) {
                        var action1_dis = distance(res.latitude, res.longitude, via_stops[i].latitude, via_stops[i].longitude)
                        // console.log( via_stops[i].latitude+','+ via_stops[i].longitude)
                        console.log(action1_dis)
                        if (action1_dis < 10) {
                            via_stops[i].isthis = true
                            console.log(Boolean(via_stops[i].isthis))
                            console.log('播报到站提醒')
                            if (that.data.falg) {
                                show.unshift({
                                    id: 0,
                                    voice: via_stops[i].via_stops + '到了，请叔叔阿姨做好下车准备哦！'
                                })
                                that.setData({
                                    falg: false,
                                    voice: show[0].voice,
                                    rount_item_change: 'rount_item_change'
                                })
                                console.log(that.data.voice)
                            } else {
                                continue
                            }
                        } else if (action1_dis > 10) {
                            console.log('播报下一站')
                            if (!that.data.falg) {
                                show.unshift({
                                    id: 0,
                                    voice: '下一站' + via_stops[i + 1].via_stops
                                })
                                that.setData({
                                    falg: true,
                                    voice: show[0].voice,
                                })
                                console.log(that.data.voice)
                            } else {
                                continue
                            }
                        }
                        var content = that.data.voice;
                        if (that.data.voiceup) {
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
                    }
                    //当前位置与第二程站牌距离逻辑
                    if (istransfer > 0) {
                        for (var i = 0; i < via_stops2.length - 1; i++) {
                            var action1_dis = distance(res.latitude, res.longitude, via_stops2[i].latitude, via_stops2[i].longitude)
                            // console.log( via_stops[i].latitude+','+ via_stops[i].longitude)
                            console.log(action1_dis)
                            if (action1_dis < 10) {
                                via_stops2[i].isthis = true
                                console.log(Boolean(via_stops2[i].isthis))
                                console.log('播报到站提醒')
                                if (that.data.falg) {
                                    show.unshift({
                                        id: 0,
                                        voice: via_stops2[i].via_stops + '就要到了，请叔叔阿姨做好下车准备哦！'
                                    })
                                    that.setData({
                                        falg: false,
                                        voice: show[0].voice,
                                        rount_item_change: 'rount_item_change',
                                        hidden: false
                                    })
                                    console.log(that.data.voice)
                                } else {
                                    continue
                                }
                            } else if (action1_dis > 10) {
                                console.log('播报下一站')
                                if (!that.data.falg) {
                                    show.unshift({
                                        id: 0,
                                        voice: '下一站' + via_stops2[i + 1].via_stops
                                    })
                                    that.setData({
                                        falg: false,
                                        voice: show[0].voice,
                                    })
                                    console.log(that.data.voice)
                                } else {
                                    continue
                                }
                            }
                            var content = that.data.voice;
                            if (that.data.voiceup) {
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
                        }
                    }
                    console.log(via_stops)
                    that.setData({
                        markers: mark,
                        stopdetail: stopde,
                        polyline: [{
                            points: points,
                            color: "#0091ff",
                            width: 6
                        }],
                        busname: busname,
                        busname2: busname2,
                        viastops: via_stops,
                        viastops2: via_stops2,
                        steps: steps,
                        steps2: steps2,
                        origin_location: origin_location,
                        origin_location2: origin_location2,
                        destination_location: destination_location,
                        destination_location2: destination_location2,
                        stopname: stopname,
                        stopname2: stopname2,
                        stoplocation: stoplocation,
                        stoplocation2: stoplocation2,
                        re_lat: res.latitude,
                        re_lon: res.longitude,
                        walkdis2: walkdis2,
                        istransfer: istransfer,
                        rount_item_bottom_change: 'rount_item_bottom_change'
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
    end(e) {
        //this.innerAudioContext.pause(); //暂停音频
        var that = this
        console.log(that.data.voiceup)
        if (!that.data.voiceup) {
            this.innerAudioContext.pause(); //暂停音频
            wx.showToast({
                title: '关闭提醒成功',
            })
        } else {
            wx.showToast({
                title: '开启提醒成功',
            })
        }
        that.setData({
            stop_detail_right_change: 'stop_detail_right_change',
            voiceup: !that.data.voiceup
        })
    },
    //前往站牌
    go_busstop() {
        var that = this
        var stop_lat = that.data.stoplocation.split(',')[0]
        var stop_lon = that.data.stoplocation.split(',')[1]
        console.log(stop_lat + '/' + stop_lon)
        console.log(that.data.re_lon + '/' + that.data.re_lat)
        var stop_name = that.data.stopname
        //获取高德地图步行方案
        const promise = new Promise(function (resolve, reject) {
            wx.request({
                url: "https://restapi.amap.com/v3/direction/walking?origin=" + that.data.re_lon + "," + that.data.re_lat + "&destination=" + stop_lon + "," + stop_lat + "&city=佛山&output=json&key=83435cf7e1f8e7b06c1d9a5353e94c06",
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
            console.log(that.data.steps)
            var steps = JSON.stringify(that.data.steps);
            wx.navigateTo({
                url: '../../pages/walk/walk?stop_lat=' + stop_lat + '&stop_lon=' + stop_lon + '&stop_name=' + stop_name + '&now_lat=' + that.data.re_lat + '&now_lon=' + that.data.re_lon + '&steps=' + steps,
            })
            //console.log(steps)
        }, function () {})
    },
    //中转方案
    transfer() {
        var that = this
        var stop_lat2 = that.data.stoplocation2.split(',')[0]
        var stop_lon2 = that.data.stoplocation2.split(',')[1]
        var or_lat2 = that.data.origin_location2.split(',')[0]
        var or_lon2 = that.data.origin_location2.split(',')[1]
        console.log(stop_lat2 + '/' + stop_lon2)
        console.log(that.data.stopname2)
        var stop_name = that.data.stopname2
        //获取高德地图步行方案
        const promise = new Promise(function (resolve, reject) {
            wx.request({
                url: "https://restapi.amap.com/v3/direction/walking?origin=" + or_lon2 + "," + or_lat2 + "&destination=" + stop_lon2 + "," + stop_lat2 + "&city=佛山&output=json&key=83435cf7e1f8e7b06c1d9a5353e94c06",
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
            console.log(that.data.steps2)
            var steps2 = JSON.stringify(that.data.steps2);
            wx.navigateTo({
                url: '../../pages/walk/walk?stop_lat=' + stop_lat2 + '&stop_lon=' + stop_lon2 + '&stop_name=' + stop_name + '&now_lat=' + that.data.re_lat + '&now_lon=' + that.data.re_lon + '&steps=' + steps2,
            })
            //console.log(steps)
        }, function () {})
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
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
        wx.authorize({
            scope: 'scope.userLocation',
            success: (res) => {

            }
        })
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
        //重新加载页面
        this.onLoad();
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