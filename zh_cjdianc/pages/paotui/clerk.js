var a = getApp();
var QQMapWX = require("../../utils/qqmap-wx-jssdk.js");
var qqmapsdk;
Page({
  data: {
    borderRadius: 5,
    latitude: 0,
    longitude: 0,
    markers: [],
    callout: {
      content: '预计还有10分钟到达',
      bgColor: "#736F6E",
      color: "#ffffff",
      padding: 10,
      display: "ALWAYS",
      borderRadius: 5
    },
    mobileLocation: {//移动选择位置数据
      longitude: 0,
      latitude: 0,
      address: '',
    },
    mobileTouchLocation:{
      longitude: 0,
      latitude: 0,
      address: '',
    },
    imgs:'',
    distances: 0, //运送距离
    times:0,  //运送时间
    fee:0,    //运送金额
    carfee:0,//车辆类型费
    weight:0,//货物重量
    // discount:0,//红包折扣
    carlist:[{id:0,carname:'请选择车辆类型，默认为电动车',rule:''}],
    goodslist:[{id:0,goodstype:'请选择货物类型，默认为不计重量货物'}],
    // redbacklist:[{id:0,redbackmoney:0}],
    index:0,
    index1:0,
    // index2:0,
    carid:0,
    carrule:'',
    goodsid:0,
    redbackid:0,
    agreement:{},
    goodstype:{},
    caragreement:'',
    backred:0,//红包
    uploadStr:'',
    types:'paotui',
    starttime:'00:00',
    endtime :'00:00',
    showModel:false,
    zfwz: "微信支付",
    btntype: "btn_ok1",
    zffs: 1,
    zfz: !1,
    order_id:0,
    mdoaltoggle: true,
  },
  onLoad: function (e) {
    // 实例化API核心类
    
    qqmapsdk = new QQMapWX({
      key: '5BVBZ-RGT66-AD6S2-EICIE-MVZR3-EUBWZ'
    });
    var that = this;
    that.setData({
      types:e.type
    })
    //获取位置
    wx.getLocation({
      type: 'gcj02',//默认为 wgs84 返回 gps 坐标，gcj02 返回可用于wx.openLocation的坐标
      success: function (res) {
        var marker = [{
          id: 0,
          latitude: res.latitude,
          longitude: res.longitude,
          callout: {//窗体
            content: that.data.callout.content,
            bgColor: that.data.callout.bgColor,
            color: that.data.callout.color,
            padding: that.data.callout.padding,
            display: that.data.callout.display,
            borderRadius: that.data.callout.borderRadius
          },
        }];
        var mobileLocation = {
          latitude: res.latitude,
          longitude: res.longitude,
        };
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          markers: marker,
        });
        //根据坐标获取当前位置名称，显示在顶部:腾讯地图逆地址解析
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (addressRes) {
            var address = addressRes.result.formatted_addresses.recommend;
            mobileLocation.address = address;
            console.log(address)
            //当前位置信息
            that.setData({
              mobileLocation: mobileLocation,
            });
          }
        });
      }
    });
    //获取说明、获取车辆类型、获取货物类型、获取基本设置信息
    var id = wx.getStorageSync('users').id;
    a.util.request({
      url:'entry/wxapp/Basept',
      data:{id:id},
      success:function(e){
        // console.log(e,'请求');
        var index = that.data.index;
        var index1 = that.data.index1;
        var index2 = that.data.index2;
        e.data[1] = e.data[1].concat(that.data.carlist);
        e.data[2] = e.data[2].concat(that.data.goodslist);

        that.setData({
          carlist:e.data[1],
          goodslist:e.data[2],
          base:e.data[0],
          agreement:e.data[3],
        });
        
        that.setData({
          carid: that.data.carlist[index].id,
          carrule: that.data.carlist[index].rule,
        })
        // if(e.data[4]!='')
        // {
        //   e.data[4] = e.data[4].concat(that.redbacklist);
        //   that.setData({
        //     redbacklist:e.data[4]
        //   })
        // }
        var carid = that.data.carlist[index].id, rule = that.data.carlist[index].rule;
        var gid = that.data.goodslist[index1].id;
        // var rid = that.data.redbacklist[index2].id;
        wx.setStorageSync('carsetmsg',[carid,rule]);//缓存车辆信息
        wx.setStorageSync('goodstypeid', gid);//缓存货物类型
        // wx.setStorageSync('redbackid', rid);//红包ID
      },
      fail:function(e){
        console.log(e,'fail')
      }
    });
    this.mapCtx = wx.createMapContext('qqMap');
    
    // console.log(m);
    a.util.request({
      url: "entry/wxapp/UserInfo",
      cachetime: "0",
      data: {
        user_id: id
      },
      success: function (t) {
          that.setData({
            userInfo: t.data
          });
      }
    });
  },
  startChange:function(e){
    var that = this
    that.setData({
      starttime:e.detail.value
    })
  },
  endChange:function(e){
    var that = this
    that.setData({
      endtime: e.detail.value
    })
  },
  //移动选择接货点
  movePresentLocation: function () {
    var that = this;

    wx.chooseLocation({
      success: function (res) {
        console.log(res,'接货点');
        let mobileLocation = {
          longitude: res.longitude,
          latitude: res.latitude,
          address: res.address,
        };
        that.setData({
          mobileLocation: mobileLocation,
        });
        var touch = that.data.mobileTouchLocation;
        if(touch.latitude != 0 && touch.longitude != 0)
        {
            that.distance();
        }
      },
      fail: function (err) {
        console.log(err)
      }
    });
  },
  //移动选择送货点
  moveTouchLocation: function () {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        console.log(res,'送货点')
        let mobileTouchLocation = {
          longitude: res.longitude,
          latitude: res.latitude,
          address: res.address,
        };
        that.setData({
          mobileTouchLocation: mobileTouchLocation,
        });
        var present = that.data.mobileLocation;
        if (present.latitude != 0 && present.longitude != 0) {
          console.log(present,'起点')
            that.distance();
          
        }        
      },
      fail: function (err) {
        console.log(err)
      }
    });
  },
  radioChange1: function (t) {
    console.log("radio1发生change事件，携带value值为：", t.detail.value), "wxzf" == t.detail.value && this.setData({
      zffs: 1,
      zfwz: "微信支付",
      btntype: "btn_ok1"
    }), "yezf" == t.detail.value && this.setData({
      zffs: 2,
      zfwz: "余额支付",
      btntype: "btn_ok2"
    }), "jfzf" == t.detail.value && this.setData({
      zffs: 3,
      zfwz: "积分支付",
      btntype: "btn_ok3"
    }), "hdfk" == t.detail.value && this.setData({
      zffs: 4,
      zfwz: "货到付款",
      btntype: "btn_ok4"
    });
  },
  uploadImg:function(e){
    var that = this;
    wx.chooseImage({
      count:3,
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
          that.setData({
            imgs: tempFilePaths
          })
          wx.showLoading({
            title: '正在上传',
          })
        that.newUploadImg();

      }
    })
  },
  imgStatus:function(k){
    var that = this;
    var key = k.target.id;
    wx.showActionSheet({
      itemList: ['查看大图','删除','取消'],
      success:function(res){
        var selectCode = res.tapIndex;
        var imgs = that.data.imgs
        var uploadStr = that.data.uploadStr;
        if(selectCode == '0'){
         var imgsHttp = imgs[key];
         console.log(imgs[key],'图片信息')
          wx.previewImage({
            current: imgsHttp , // 当前显示图片的http链接
            urls:imgs
          })
        }else if(selectCode == '1'){
            imgs.splice(key,1);
            uploadStr.splice(key,1);
            that.setData({
              imgs:imgs,
              uploadStr:uploadStr
            })
        }
      }
    })
  },
  distance:function(){
    var that = this;
    qqmapsdk = new QQMapWX({
      key: '5BVBZ-RGT66-AD6S2-EICIE-MVZR3-EUBWZ'
    });
    qqmapsdk.calculateDistance({
      mode:'driving',
      from:{
        latitude: that.data.mobileLocation.latitude,
        longitude: that.data.mobileLocation.longitude
      },
      to:[{
          latitude: that.data.mobileTouchLocation.latitude,
          longitude: that.data.mobileTouchLocation.longitude
      }],
      success: function (res) {
        //距离
        var distance = res.result.elements['0'].distance //米
        var duration = res.result.elements['0'].duration //秒
        if(distance == -1){
          distance = 0;
        }
        var newDistance = distance/1000;

        if(duration>3600){
          var newDuration = duration/3600;
          var unit = '小时';
        }else{
          var newDuration = duration/60; //分钟
          var unit = '分钟'
        }
        that.setData({
          distances:newDistance,
          times:newDuration.toFixed(2)+unit
        });
        that.calPrice();
      },
    })
    
  },
  calculatePrice:function(){
    //计算费用
  },
  //计算重量
  calWeight:function(e){
    var that = this;
    if(e.detail.value!=''){
      that.setData({
        weight:e.detail.value
      })
    }else{
      that.setData({
        weight: 0
      })
    }
    that.calPrice();
  },
  //选择车的类型
  selectCar:function(e){
    var that = this,index = e.detail.value,rules =that.data.carlist[index].rule,id=that.data.carlist[index].id;
    that.setData({
      index:index,
      carid:id,
      carrule:rules
    });
    wx.setStorageSync('carsetmsg', [id,rules]);//获取车辆信息
    that.calPrice();
  },
  //选择货物类型
  goodsTypeChange:function(e){
    var that=this;
    var index1 = e.detail.value,id = that.data.goodslist[index1].id;
    that.setData({
      index1:index1,
      goodsid:id,
    });
    wx.setStorageSync('goodstypeid', id);//存储货物类型id
    
  },
  //选择抵扣金额
  // selectRed:function(e){
  //   var that=this;
  //   var index2 = e.detail.value, id = that.data.redbacklist[index2].id, discount = that.data.redbacklist[index2].redbackmoney;
  //   console.log(discount,'diso');
  //   that.setData({
  //     index2:index2,
  //     redbackid:id,
  //     discount:discount
  //   })
  //   wx.setStorageSync('redbackid', id);
  //   that.calPrice();    
  // },
  //计算价格
  calPrice:function(){
    var that = this;
    var distances = that.data.distances;
    var weights = that.data.weight;
    var rules = wx.getStorageSync('carsetmsg');
    var base  = that.data.base;
    console.log(base,'基础规则');
    console.log(rules,'独立规则');
    if( rules[1]!= '' && rules!='')
    {
     
      //计算价格，单独计算规则
      var rule = rules[1];
      var price = parseInt(rule.price);//最低价格
      var distance = parseInt(rule.distance);//最低距离
      var distance2 = parseInt(rule.distance2);//增长距离,
      var distance_price = parseInt(rule.distance_price);//增长价格
      var weight = parseInt(rule.weight);//增长重量
      var weight_price = parseInt(rule.weight_price);//重量价格
      var distanceTotal = 0;
      //距离低于起送距离
      if(distances - distance<=0)
      {
        //低于起送距离
        distanceTotal = 0;
      }else{
        distanceTotal = distances - distance;
      }
      var fee = (((distanceTotal / distance2) * distance_price) + price) + ((weights / weight) * weight_price);
    }else{
      //统一规则
      var rule = rules[1];
      var price = parseInt(base.price);//最低价格
      var distance = parseInt(base.distance);//最低距离
      var distance2 = parseInt(base.distance2);//增长距离,
      var distance_price = parseInt(base.distance_price);//增长价格
      var weight = parseInt(base.weight);//增长重量
      var weight_price = parseInt(base.weight_price);//重量价格
      var distanceTotal = 0;
      //距离低于起送距离
      if (distances - distance <= 0) {
        //低于起送距离
        distanceTotal = 0;
      } else {
        distanceTotal = distances - distance;
      }
      var fee = (((distanceTotal / distance2) * distance_price) + price) + ((weights / weight) * weight_price);
    }
    // var discount = parseInt(that.data.discount);
    var fees = (fee - 0).toFixed(2);//订单总价格
    if(fees>0)
    {
      that.setData({
        fee: fees
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '金额不能小于0元请更换抵扣券或改写其他设置',
      })
    }
  },
  //创建订单
  createTable:function(e){
    var that = this;
    // console.log(e,'订单信息');
    //存订单
    //订单类型
    var ordertype = that.data.types;
    //车辆类型
    var cartypeid = wx.getStorageSync('carsetmsg')[0];
    //货物类型
    var goodstype = wx.getStorageSync('goodstypeid')[0];
    //图片信息
    var imgspath = that.data.uploadStr;
    //价格
    var fee = that.data.fee;
    //接货详细地址
    var address_view = e.detail.value.address_view;
    //接货时间
    var starttime = that.data.starttime;
    //接货联系人
    var name = e.detail.value.name;
    //接货联系方式
    var tel = e.detail.value.tel;
    //收货详细地址
    var touch_address_view = e.detail.value.touch_address_view;
    //收货时间
    var endtime = that.data.endtime;
    //收货联系人
    var touch_name = e.detail.value.touch_name;
    //收货联系方式
    var touch_tel = e.detail.value.touch_tel;
    //货物描述
    var goods_view = e.detail.value.goods_view;
    //里程
    var distances = that.data.distances;
    //耗时
    var times = that.data.times;
    //货物重量
    var weight = that.data.weight;
    //发货人ID
    var user_id = wx.getStorageSync('users').id;
    //发货人地址
    var mobileLocation = that.data.mobileLocation;
    //收货人地址
    var mobileTouchLocation = that.data.mobileTouchLocation;    
    if(fee <= 0)
    {
      wx.showModal({
        title: '提示',
        content: '金额不能小于0元请更换抵扣券或改写其他设置',
      })
      return false;
    }
    //其他信息
    if(e.detail.value.name=='')
    {
      wx.showToast({
        title: '请填写取件人姓名',
        duration: 2000,
        image:'/zh_cjdianc/img/x.png',
        mask:true
      })
      return false;
    }
    if(e.detail.value.tel == '' || e.detail.value.tel.length!=11)
    {
      wx.showToast({
        title: '手机号格式错误',
        duration: 2000,
        image: '/zh_cjdianc/img/x.png',
        mask: true
      })
      return false;
      //取件人联系方式错误
    }
    if(e.detail.value.touch_name == '')
    {
      wx.showToast({
        title: '请填写收件人姓名',
        duration: 2000,
        image: '/zh_cjdianc/img/x.png',
        mask: true
      })
      return false;
      //收件人姓名错误
    }
    if(e.detail.value.touch_tel == '' || e.detail.value.touch_tel.length!=11)
    {
      wx.showToast({
        title: '请填写正确的手机号格式',
        duration: 2000,
        image: '/zh_cjdianc/img/x.png',
        mask: true
      })
      return false;
     
    }
    if(mobileLocation.address == '')
    {
      wx.showToast({
        title: '请选择正确的取货地址',
        duration: 2000,
        image: '/zh_cjdianc/img/x.png',
        mask: true
      })
      return false;
      //发货地址错误
    }
    if(mobileTouchLocation.address == '')
    {
      wx.showToast({
        title: '请选择正确的收货地址',
        duration: 2000,
        image: '/zh_cjdianc/img/x.png',
        mask: true
      })
      return false;
      //收货地址错误
    }
    wx.showLoading({
      title: '创建订单中',
    })
    a.util.request({
      url:'entry/wxapp/createorder',
      method:'POST',
      cachetime: "0",
      data:{
        user_id:user_id,
        money:fee,
        tel:tel,
        name:name,
        address: mobileLocation.address,
        lat_lon: mobileLocation.latitude + ',' + mobileLocation.longitude,
        address_view:address_view,
        present_times:starttime,
        touch_tel:touch_tel,
        touch_name:touch_name,
        touch_address: mobileTouchLocation.address,
        touch_lat_lon: mobileTouchLocation.latitude + ',' + mobileTouchLocation.longitude,
        touch_address_view:touch_address_view,
        delivery_time:endtime,
        goods_type:goodstype,
        present_car:cartypeid,
        goods_img:imgspath,
        goods_view:goods_view,
        goods_weight:weight,
        mileage:distances,
        times:times,
        type:ordertype,
      },
      success:function(e){
        console.log(e);
        // e.code = 0;
        if(e.data.code==0)
        {
          setTimeout(function () {
            wx.hideLoading()
          }, 2000)
          wx.showModal({
            title: '提示',
            content: '订单创建失败',
          })

        }else if(e.data.code==1)
        {
  
          setTimeout(function () {
            wx.hideLoading()
          }, 2000)
          that.setData({
            showModel:true
          });
          //设置订单号
          that.setData({
            order_id:e.data.orderid
          })
        }
      }

    })

  },
  newUploadImg:function(){
    var that = this;
    var tempFilePaths = that.data.imgs;
    if (tempFilePaths != '') {
      //执行图片上传
      var uploadImgCount = 0;
      var uploadStr = new Array();
      for (var i = 0, h = tempFilePaths.length; i < h; i++) {
        console.log(i, '计数器');
        wx.uploadFile({
          url: 'https://test.yiyawlkj.com/app/index.php?i=7&t=0&v=5.7.1&from=wxapp&c=entry&a=wxapp&do=upload&&m=zh_cjdianc',
          filePath: tempFilePaths[i],
          name: 'upfile',
          header: {
            "Content-Type": "multipart/form-data",
            'accept': 'application/json'
          },
          success: function (res) {
            // console.log(res);
            uploadStr.push(res.data);
             that.setData({
               uploadStr:uploadStr
             })
            setTimeout(function () {
              wx.hideLoading()
            }, 2000)
            wx.showToast({
              title: '上传成功',
              icon: 'success',
              duration: 2000
            })            
          },
          fail: function (res) {
            console.log(res, '失败');
          }
        })
      }
    }
  },
  formSubmit:function(e)
  {
    var that = this;
    var zffs = e.detail.value.radiogroup;
    var fee  = that.data.fee;
    var openid = wx.getStorageSync('users').openid;
    var wallet = that.data.userInfo.wallet;
    that.setData({
      zfz:1
    })
    console.log(e);
    if(zffs=='yezf')
    {
      if (wallet-that.data.fee < 0)
      {
     
        wx.showModal({
          title: '提示',
          content: '余额不足请更换支付方式',
        })
        return false;
      }
    }
    a.util.request({
      url:'entry/wxapp/newpay',
      method:'POST',
      cachetime: "0",
      data:{
        'orderid':that.data.order_id,
        'zffs':zffs,
        'openid':openid,
        'fee':fee
      },
      success:function(e)
      {
        that.setData({
          zfz:!1
        })
        if(zffs=='yezf')
        {
            var code = e.data.code;
            if(code == '0')
            {
              wx.showModal({
                title: '提示',
                content: '余额不足请更换支付方式',
              })
              return false;
            }else if( code == '1'){
              wx.showModal({
                title: '提示',
                content:'扣除余额失败',
              })
              return false;
            }else if( code == '2'){
              that.setData({
                mdoaltoggle:false,
                showModel:false
              })
            setTimeout(function () {
              wx.reLaunch({
                url: "../wddd/order?status=2"
              });
            }, 1e3) 
            }
        }else if(zffs=='wxzf'){
          wx.requestPayment({
            timeStamp: e.data.timeStamp,
            nonceStr: e.data.nonceStr,
            package: e.data.package,
            signType: e.data.signType,
            paySign: e.data.paySign,
            success: function (t) {
              console.log(t.data), console.log(t), console.log(d);
            },
            complete: function (t) {
              if (t.errMsg =="requestPayment:ok")
              {
                a.util.request({
                  url:'entry/wxapp/wxzforder',
                  method:'POST',
                  data:{
                    'orderid': e.data.orderid,
                    'fee'    : e.data.fee,
                    'code': e.data.out_trade_no
                  }
                });
              }
              console.log(t), "requestPayment:fail cancel" == t.errMsg && (wx.showToast({
                title: "取消支付",
                icon: "loading",
                duration: 1e3
              }), setTimeout(function () {
                wx.reLaunch({
                  url: "../wddd/order"
                });
              }, 1e3)), "requestPayment:ok" == t.errMsg && (o.setData({
                mdoaltoggle: !1
              }), setTimeout(function () {
                wx.reLaunch({
                  url: "../wddd/order?status=2"
                });
              }, 1e3));
            }
          });
        }

      }

    })
  }
});
