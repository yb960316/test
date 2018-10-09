var app = getApp();

Page({
    data: {},
    onLoad: function(t) {
        app.setNavigationBarColor(this);
        var o = this;
        console.log(t);
        var i = decodeURIComponent(t.scene);
        console.log(i, i.split(","));
        var a = i.split(",")[1], n = i.split(",")[0], e = t.storeid;
        this.setData({
            moid: a,
            msjid: n,
            storeid: e
        }), wx.showLoading({
            title: "加载中"
        }), app.getUserInfo(function(t) {
            console.log(t), o.setData({
                smuid: t.id
            });
        }), app.util.request({
            url: "entry/wxapp/StoreInfo",
            cachetime: "0",
            data: {
                store_id: n
            },
            success: function(t) {
                console.log("商家详情", t), o.setData({
                    admin_id: t.data.store.admin_id
                });
            }
        });
    },
    hx: function() {
        var t = this.data.storeid, o = this.data.admin_id, i = this.data.smuid, a = this.data.moid, n = this.data.msjid;
        console.log("扫码人的storeid", t, "smuid", i, "admin_id", o, "订单id", a, "msjid", n), 
        t == n || o == i ? app.util.request({
            url: "entry/wxapp/OkOrder",
            cachetime: "0",
            data: {
                order_id: a
            },
            success: function(t) {
                console.log(t), "1" == t.data ? (wx.showToast({
                    title: "核销成功",
                    icon: "success",
                    duration: 1e3
                }), setTimeout(function() {
                    wx.navigateBack({});
                }, 1e3)) : wx.showToast({
                    title: "请重试",
                    icon: "loading",
                    duration: 1e3
                });
            }
        }) : (wx.showModal({
            title: "提示",
            content: "您暂无核销权限"
        }), setTimeout(function() {
            wx.navigateBack({});
        }, 1e3));
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {}
});