// miniprogram/pages/user/user.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 判断用户是否授权
    isAuth: false,     
    // 用户信息
    userInfo: {
      nickName: "请先登录"  
    }       
  },
  // 点击获取用户信息事件
  getUserInfo(){
    wx.getUserProfile({
      // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      desc: '用于完善会员资料', 
      success: (res) => {
        console.log("登录成功==》",res)
        this.setData({
          userInfo: res.userInfo,
          isAuth: true
        })
        // 添加缓存数据
        wx.setStorage({
          data: true,
          key: 'isAuth',
        })
      },
      fail: err => {
        console.log("登录失败==》",err)
        wx.setStorage({
          data: false,
          key: 'isAuth',
        })
      }
    })

  },
  // 分类点击事件
  toSort(){
    wx.navigateTo({
      url: '/pages/sort/sort',
    }) 
  }
  // 
  // 账户点击事件
  // 分享给好友
  
})