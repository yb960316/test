var app = getApp();

Page({
    data: {},
    onLoad: function(o) {
        app.setNavigationBarColor(this), wx.setNavigationBarTitle({
            title: "核销抢购订单"
        });
        var t = this;
        console.log(o);
        var e = decodeURIComponent(o.scene);
        console.log(e);
        var n = e, i = o.storeid;
        this.setData({
            moid: n,
            storeid: i
        }), wx.showLoading({
            title: "加载中"
        }), app.getUserInfo(function(o) {
            console.log(o), t.setData({
                smuid: o.id
            });
        });
    },
    hx: function() {
        var o = this.data.moid, t = this.data.storeid, e = this.data.smuid;
        console.log("扫码人的storeid", t, "smuid", e, "订单id", o), app.util.request({
            url: "entry/wxapp/QgHx",
            cachetime: "0",
            data: {
                order_id: o,
                store_id: t,
                user_id: e
            },
            success: function(o) {
                console.log(o), "核销成功" == o.data ? wx.showToast({
                    title: "核销成功",
                    icon: "success",
                    duration: 1e3
                }) : wx.showModal({
                    title: "提示",
                    content: o.data
                }), setTimeout(function() {
                    wx.navigateBack({});
                }, 1e3);
            }
        });
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {}
});