// miniprogram/pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 页面数据
    info: {},
    // 用户修改的新数据
    newData: {},
    // 数据日期
    time: "",
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options==>",options)
    // 根据页面传递的_id字段获取本地缓存的数据
    wx.getStorage({
      key: options._id,
      success: res => {
        console.log(res)

        this.setData({
          info: res.data,
          time: res.data.date
        })
      }
    })
  },
  
  // 获取新数据的事件
  getNewData(e){
    // console.log(e)
    // 获取修改数据的名称
    var type = e.currentTarget.dataset.type;
    // console.log(type)
    this.data.newData[type] = e.detail.value;
    // console.log(this.data.newData)
    //如果修改的是日期数据，则要修改页面数据
    if(type == "date"){
      this.setData({
        time: e.detail.value
      })
    }

  },


  // 编辑数据的事件
  setMsgData(){
    // console.log(1111)
    // 如果新数据newData与原本数据info的值不同时则说明数据有更改，如果全部相同或则newData为空则说明数据没有更改，这时不用编辑功能

    // 判断用户数据是否有更改, 默认没有更改
    var isSet = false;

    // 遍历新数据对比数据是否有更改
    for( var k in this.data.newData){
      if(this.data.newData[k] != this.data.info[k]){
        // 条件成立则说明数据有更改
        isSet = true;
      }
    }
    if(isSet){
      // 条件成立则说明数据有更改， 则执行更改数据库数据的操作
      console.log("数据有更改")

      // 显示加载框
      wx.showLoading({
        title: '正在编辑...',
        mask: true
      })
      console.log('this.data.newData==>',this.data.newData)
      // 调用云函数
      wx.cloud.callFunction({
        name: "xg2_update_msg_data",
        data: {
          id: this.data.info._id,
          newData: this.data.newData
        },
        success: res => {
          console.log("修改成功==》", res)
          // 关闭加载框
          wx.hideLoading()
          // 编辑成功返回首页
          wx.navigateBack()
        },
        fail: err => {
          console.log("修改数据失败==》",err)
        }
      })

    }else{
      console.log("数据没有更改")
    }

  },
  
  // 删除数据事件
  deleteMsgData(){
    // 调用云函数，删除数据库数据
    wx.cloud.callFunction({
      name: "xg2_delete_msg_data",
      data: {
        id: this.data.info._id
      },
      success: res => {
        console.log("删除数据成功==》", res)
        // 删除成功返回首页
        wx.navigateBack()
      },
      fail: err => {
        console.log("删除数据失败==》",err)
      }
    })
  },
})