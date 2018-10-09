var a = getApp();

Page({
    data: {
        showText: !0,
        home: {},
        height:0
    },
    onLoad: function(o) {

        var a = this;
        a.setData({
          home:a.data.home[0]
        })
          wx.setNavigationBarTitle({
                    title: '跑腿'
                });
            
       
    },
    placeOrder: function(){
      wx.navigateTo({
        url: 'clerk?type=paotui',
      })
    },
    clerkOrder: function(){
      wx.navigateToMiniProgram({
        appId: 'wxf4215ddb980d557b',
      })
    }
});