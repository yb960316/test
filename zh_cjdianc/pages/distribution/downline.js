var app = getApp();

Page({
    data: {
        ac_index: 0
    },
    onLoad: function(n) {
        app.setNavigationBarColor(this);
        var t = this, a = wx.getStorageSync("users").id;
        app.util.request({
            url: "entry/wxapp/MyTeam",
            cachetime: "0",
            data: {
                user_id: a
            },
            success: function(n) {
                console.log(n.data), t.setData({
                    MyTeam: n.data
                });
            }
        });
    },
    one: function(n) {
        this.setData({
            ac_index: 0
        });
    },
    two: function(n) {
        this.setData({
            ac_index: 1
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