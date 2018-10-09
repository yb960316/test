var app = getApp();

Page({
    data: {},
    onLoad: function(t) {
        app.setNavigationBarColor(this);
        var a = this;
        app.util.request({
            url: "entry/wxapp/system",
            cachetime: "0",
            success: function(t) {
                a.setData({
                    system: t.data
                });
            }
        }), console.log(t), a.setData({
            state: t.state
        });
    },
    formSubmit: function(t) {
        wx.navigateTo({
            url: "info?form_id=" + t.detail.formId + "&state=" + this.data.state
        });
    },
    getUserInfo: function(t) {
        console.log(t), app.globalData.userInfo = t.detail.userInfo, this.setData({
            userInfo: t.detail.userInfo,
            hasUserInfo: !0
        });
    }
});