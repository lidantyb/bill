// miniprogram/pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentMonth: "",   // 当前选择的月份，默认是当月
    // 某月的总收入和总支出
    monthCost: {
      pay: 0,
      income: 0
    },
    // 某月结余金额
    surPlus: "0.00",
    monArrData: [],    // 月份数据   
    // 判断是否有月份数据, 默认没有
    hasData: false,
    // 判断页面是否是首次进入，默认是
    isOnload: true,
     // 判断用户是否有登录
     isLogin: false
  },
  onLoad(){
    // console.log("页面加载")
    // 调用函数。获取当月日期
    this.getMonth();

    // console.log("2021-01-25" < "2020-04-28")

    wx.getStorage({
      key: 'isAuth',
      success: res => {
        if(res.data){
           
          // 调用函数。获取当月数据
          this.getMsgData(this.data.currentMonth);
          this.setData({
            isLogin: true
          })
        }else{
          wx.showToast({
            title: '亲, 还没登录哦',
            icon: "none",
            mask: true
          })

          this.setData({
            isLogin: false
          })

          wx.switchTab({
            url: '/pages/user/user',
          })
        }
      }
    })

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // console.log("页面显示")
    if(this.data.isOnload){
      // 条件成立，则说明页面是首次进入
      this.data.isOnload = false;
    }else{
      // 调用函数。获取当月日期
    this.getMonth();

    // 调用函数。获取当月数据
    wx.getStorage({
      key: 'isAuth',
      success: res => {
        if(res.data){
          // 调用函数。获取当月数据
          this.getMsgData(this.data.currentMonth);
          this.setData({
            isLogin: true
          })
        }
      }
    })
    }
    
  },
  // 跳转到记账页面
  toRecord(){
    // wx.redirectTo({
    //   url: "../record/record"
    // })
    wx.navigateTo({
        url: "../record/record"
      })
  },
  // 获取当月日期函数
  getMonth(){

    // 获取时间对象
    var time = new Date();

    // 获取年份
    var y = time.getFullYear();

    // 获取月份
    var m = time.getMonth() + 1;

    // 数据响应
    this.setData({
      currentMonth: this.addZero(m) + "/" + y
    })

  },
  // 补零函数
  addZero(num){
    return num < 10 ? "0"+num : num;
  },
  // 选择月份事件
  selectMonth(e){
    // console.log(e)
    var monArr = e.detail.value.split("-");
    // console.log(monArr)
    // 数据响应
    this.setData({
      currentMonth: monArr[1] + "/" + monArr[0]
    })
     
    // 根据选择的月份，获取对应数据
    this.getMsgData(this.data.currentMonth);
  },
  // 获取某月数据函数
  getMsgData(month){
    // month： 要获取数据的月份
    // 获取某月数据原理： 只要数据库集合的数据日期在查询的月份的1号到该月的最后一天的范围之内，则该条数据就是该月数据
    // 如何判断数据日期是否在范围之内
    // 只要该条数据的日期大于等于该月的1号并且小于等于该月的最后一天， 则该日期就在范围之内       
    // 2021-04-01 <= 数据日期  <= 2021-04-30
  
    var dateArr = month.split("/");
   
    // 获取查询的月份的第一天日期
    var start = dateArr[1] + "-" + dateArr[0] + "-01";
    // console.log(start)
    // console.log(new Date(2020, 2, 0).getDate())  // 获取某月有多少天
    // 获取查询的月份有多少天‘
    var dayNum = new Date(dateArr[1], dateArr[0], 0).getDate();
    // 获取查询月份的最后一天的日期
    var end = dateArr[1] + "-" + dateArr[0] + "-" + dayNum;
    // console.log(end)

    // 清空月份总收入和总支出，确保收入与支出是从0开始累加
    this.data.monthCost.pay = 0;
    this.data.monthCost.income = 0;

    // 显示加载框
    wx.showLoading({
      title: '正在加载...',
      mask: true
    })

    // 清空本地缓存
    wx.getStorage({
      key: 'isAuth',
      success:res=>{
        // console.log('isAuth-res==>',res)
        wx.clearStorage();
        wx.setStorage({
          data: true,
          key: 'isAuth',
        })
      },
      fail:err=>{
        // console.log('isAuth-err==>',err)
      }
    })
    // wx.clearStorage();

    // 调用云函数
    wx.cloud.callFunction({
      name: "xg2_get_msg_data",
      data: {
        startTime: start,
        endTime: end
      },
      success: res => {
        // console.log("获取数据成功==》", res)
        // 成功获取数据则关闭加载框
        wx.hideLoading();
        // 获取返回的数据
        var data = res.result.data;
        // console.log(data)

        // 当数据长度为0时，则说明该月份没有数据
        if(data.length == 0){
          this.data.hasData = false;
        }else{
          this.data.hasData = true;
        }

        // 时间数组, 存放当前月份的数据有哪一些日期
        var timeArr = [];

        // 遍历数据，累加总收入和总支出
        data.forEach(v => {

          // 将遍历的每条数据存储在本地缓存上
          wx.setStorage({
            key: v._id,
            data: v
          })

          // 判断时间数组是否存在当前数据的日期，如果不存在则将该日期添加到时间数组里，如果存在则不需要添加
          // indexOf(要查询的元素) 数组/字符串查询某个元素的方法，如果数组/字符串存在该查询元素，则返回该查询元素对应的下标位置，如果不存在则返回 -1
          if(timeArr.indexOf(v.date) == -1){
            timeArr.push(v.date);
          }

          this.data.monthCost[v.costType] += Number(v.money);
        })

        // console.log(timeArr)

        // 总收入总支出累加完成后，计算结余
        // 结余 = 收入 - 支出
        var surNum = this.data.monthCost.income - this.data.monthCost.pay;

        // 累加完成。强制保留两个小数位
        // toFixed() 保留小数位方法, 调用者一定是数值
        this.data.monthCost.pay = Number(this.data.monthCost.pay).toFixed(2);
        this.data.monthCost.income = Number(this.data.monthCost.income).toFixed(2);

        // 处理月份数据
        // 将时间数组的元素从大到小排序
        // sort()数组排序方法。 按字符大小从小到大排序
        // reverse() 颠倒数组元素顺序方法
        timeArr.sort().reverse();

        // 存放月份每一天的数据
        var monthData = [];

        // console.log(timeArr)
        // 遍历时间数组，处理每一天的相关数据
        timeArr.forEach(v => {
          // v : 当前项 当前日期
          // 存放一天的相关数据
          var dayData = {};

          // 处理日期格式
          var dateArr = v.split("-");
          dayData.date = dateArr[0] + "年" + Number(dateArr[1]) + "月" + Number(dateArr[2]) + "日";
          // console.log(new Date(v).getDay())
          // 根据日期判断当前日期是星期几
          switch(new Date(v).getDay()){
            case 0:
              dayData.week = "星期日";
            break;
            case 1:
              dayData.week = "星期一";
            break;
            case 2:
              dayData.week = "星期二";
            break;
            case 3:
              dayData.week = "星期三";
            break;
            case 4:
              dayData.week = "星期四";
            break;
            case 5:
              dayData.week = "星期五";
            break;
            case 6:
              dayData.week = "星期六";
            break;
          }

          // 处理一天的总收入和总支出数据
          dayData.pay = 0;
          dayData.income = 0;

          dayData.info = [];  // 一天的所有消费数据
          // 遍历数据，判断当前数据是否是当前查询日期数据，如果是则根据数据类型累加总收入和总支出
          data.forEach(x => {
            // x: 当前项，当前数据
            if(x.date == v){
              dayData.info.push(x);
              dayData[x.costType] += Number(x.money);
            }
          })
          // 累加完成后。强制保留两个小数位
          dayData.pay = Number(dayData.pay).toFixed(2);
          dayData.income = Number(dayData.income).toFixed(2);

          // console.log(dayData)
          // 将当前日期的数据添加到monthData
          monthData.push(dayData);
        })
        // console.log(monthData)


        // 数据响应
        this.setData({
          monthCost: this.data.monthCost,
          surPlus: surNum.toFixed(2),
          monArrData: monthData,
          hasData: this.data.hasData
        })

      },
      fail: err => {
        // console.log("获取数据失败==》", err)
      }
    })

  },
  // 点击跳转详情页事件
  navToDetail(e){
    // console.log(e)
    // 获取当前点击的列表对应_id
    var id = e.currentTarget.dataset.index;
    // console.log(id)

    // 跳转到详情页
    wx.navigateTo({
      url: "../detail/detail?_id=" + id
    })
  }
})

// [
//   // 一个对象代表一天
//   {   // 2021-05-08
//     date: "2021年5月8日",
//     week: "星期六",
//     pay: "111",  // 一天的总支出
//     income: 2222, // 一天的总收入
//     info: []    // 一天所有的消费数据

//   },
//   { // 2021-05-07

//   },
//   { // 2021-05-01

//   }
// ]