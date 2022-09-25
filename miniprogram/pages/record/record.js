// miniprogram/pages/record/record.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 支出收入标题数据
    costTitle: [
      {
        name: "支出",  // 标题内容
        type: "pay",  // 标题类型
        isAct: true   // 当前激活状态
      },
      {
        name: "收入",
        type: "income",
        isAct: false
      }
    ],
    // 轮播图图标数据
    bannerIcon: {
      pay: [],
      income: []
    },
    // 记录激活的图标数据
    actIcon: {
      type: "",  // 图标类型
      index: "", // 滑块对应下标
      id: ""     // 图标下标
    },
    // 当前选中日期，默认今天
    currentDate: "",
    // 用户填写的金额 日期 备注
    info: {
      money: "",
      date: "",
      comment: ''
    },
    currentNum: 0,  // 轮播滑块的下标
    today: ""       // 当天日期
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 调用函数，获取图标数据
    this.getIcon();
    // 调用函数，获取当天日期
    this.getToday();
  },
  // 收入支出标题点击切换事件
  // titleTap: function(){}
  titleTap(e){
    // e: 事件对象event
    // console.log(e)

    // 获取当前点击的标题对应的下标
    var index = e.currentTarget.dataset.index;
    // console.log(index)

    // 取消上一个激活的标题
    for(var i = 0; i < this.data.costTitle.length; i++){
      // 第一种： 设置所有数据为未激活状态， 仅适用数据较少时；
      // this.data.costTitle[i].isAct = false;
      // 第二种： 查找激活的数据，将该数据设置为未激活
      if(this.data.costTitle[i].isAct){
        this.data.costTitle[i].isAct = false;
        break; // 找到激活数据则终止循环
      }
    }

    // 设置当前点击的标题为激活状态
    this.data.costTitle[index].isAct = true;

    // 数据响应，更改视图层的数据
    this.setData({
      costTitle: this.data.costTitle
    })

    // console.log(this.data.costTitle)
  },
  // 获取轮播图图标数据
  getIcon(){
    
    // 调用云函数，获取数据
    wx.cloud.callFunction({
      name: "xg2_get_icon",  // 云函数名称
      success: res => {      // 成功回调
        // console.log("获取图标数据成功==》",res)
        
        // 获取返回的数据
        var data = res.result.data;
        // console.log(data)

        // 声明对象，存放数据
        var banner = {
          pay: [],   // 存放支出图标
          income: [] // 存放收入图标
        }

        // 将数据分类，根据收入支出分类
        data.forEach(v => {
          // 给每条数据添加一个激活字段，默认都是未激活
          v.isAct = false;
          // console.log("当前项==>",v)
          // if(v.type == "pay"){
          //   banner.pay.push(v)
          // }else{
          //   banner.income.push(v)
          // }
          // 简写
          banner[v.type].push(v)
        })
        // banner.pay[2].isAct = true

        // console.log(banner)

        // 遍历对象获取对应数据 for in
        for(var k in banner){
          // k: 键名
          // console.log("k==>",banner[k])

          // 开始截取下标
          var beginIndex = 0;

          // 条件循环语句while(条件){代码块} 先判断条件是否成立，如果成立则执行代码块，执行完代码块后会再次判断条件是否成立，如果成立则再次执行代码块，以此类推，直到条件不成立，则终止循环
          while(beginIndex < banner[k].length){

            // slice(开始截取下标，结束截取下标)，数组截取元素的方法，截取的内容会以一个新的数组返回,截取的内容不包括结束截取下标对应的数据
           var newArr = banner[k].slice(beginIndex, beginIndex+8);
          //  console.log("newArr==>",newArr);

           // 将截取的数据添加到bannerIcon里
           this.data.bannerIcon[k].push(newArr)

           // 重新更改开始截取下标
           beginIndex += 8;   // beginIndex = beginIndex + 8
          }
        }

        // console.log(this.data.bannerIcon)

        // 数据响应，更新视图层的数据
        this.setData({
          bannerIcon: this.data.bannerIcon
        })

      },
      fail: err => {        // 失败回调
        // console.log("获取图标数据失败==》",err)
      }
    })
  },
  // 轮播图标点击事件
  bannerIconTap(e){
    // console.log(e)

    // 获取当前点击的图标对应类型
    var type = e.currentTarget.dataset.type;

    // 获取当前点击的图标在第几个滑块上
    var index = e.currentTarget.dataset.index;

    // 获取当前点击的图标是第几个
    var id = e.currentTarget.dataset.id;
    // console.log(type, index, id)

    // 判断当前点击的图标是否已经激活，如果已经激活则取消激活，反之设置激活
    if(this.data.bannerIcon[type][index][id].isAct){
      // 条件成立则说明当前点击的图标是激活状态
      this.data.bannerIcon[type][index][id].isAct = false;

      // 当前页面没有激活的图标，则actIcon的数据要清空
      this.data.actIcon.type = "";
      this.data.actIcon.index = "";
      this.data.actIcon.id = "";

    }else{
        // 练习：下周检查
    // 取消上一个激活的图标数据
    // 完成收入图标的点击事件
    // 第一种：查找所有的图标数据，判断每一个图标数据是否是激活的图标，如果是就取消
    // for(var k in this.data.bannerIcon){
    //   // console.log(this.data.bannerIcon[k])
    //   for(var i = 0; i < this.data.bannerIcon[k].length; i++){
    //     for(var j = 0; j < this.data.bannerIcon[k][i].length; j++){
    //       if(this.data.bannerIcon[k][i][j].isAct){
    //         this.data.bannerIcon[k][i][j].isAct = false;
    //         break; // 找到激活图标则终止循环
    //       }
    //     }

    //   }
    // }

    // 第二种： 记录激活的图标信息，根据图标信息取消激活、

    if(this.data.actIcon.type != ""){
      this.data.bannerIcon[this.data.actIcon.type][this.data.actIcon.index][this.data.actIcon.id].isAct = false;
    }

    // 设置当前点击的图标为激活状态
    this.data.bannerIcon[type][index][id].isAct = true;

    // 记录当前点击的图标信息
    this.data.actIcon.type = type;
    this.data.actIcon.index = index;
    this.data.actIcon.id = id;
    }
    // console.log(this.data.actIcon)

    // 数据响应
    this.setData({
      bannerIcon: this.data.bannerIcon
    })
  },
  // 获取当天日期
  getToday(){
    // 获取时间对象
    var time = new Date();
    // 获取年份
    var y = time.getFullYear();
    // console.log(y)
    // 获取月份 计算机月份是从0开始，所以真是月份需+1
    var m = time.getMonth() + 1;
    // console.log(m)
    // 获取日
    var d = time.getDate();
    // console.log(d)
    // 数据响应
    this.setData({
      currentDate: y + "年" + this.addZero(m) + "月" + this.addZero(d) + "日",
      "info.date": y + "-" + this.addZero(m) + "-" + this.addZero(d),
      today: y + "-" + this.addZero(m) + "-" + this.addZero(d)
    })
    // console.log(this.data.info)
  },
  // 补零函数
  addZero(num){
    return num < 10 ? "0"+num : num;
  },
  // 获取用户填写的金额日期备注事件
  getInfo(e){
    // console.log(e)
    // 获取当前要修改的数据类型
    var type = e.currentTarget.dataset.type;

    // 如果修改的数据是日期，则要处理显示的数据
    if(type == "date"){
      // split(): 字符串分割方法，返回一个数组
       var valArr = e.detail.value.split("-");
      //  console.log(valArr)

       this.data.currentDate = valArr[0] + "年" + valArr[1] + "月" + valArr[2] + "日"
    }

    // 修改用户填写的值
    this.data.info[type] = e.detail.value;

    // 数据响应
    this.setData({
      info: this.data.info,
      currentDate: this.data.currentDate
    })
    console.log('获取输入的数据：',this.data.info)
  },
  // 添加一条记账记录
  addMsgData(){
    console.log('getInfo ==> ',this.data.getInfo)
    // 存放用户所填写的数据
    var msgData = {};

    // 获取标题数据
    for(var i = 0; i < this.data.costTitle.length; i++){
      if(this.data.costTitle[i].isAct){
        msgData.costName = this.data.costTitle[i].name;
        msgData.costType = this.data.costTitle[i].type;
      }
    }
    // 获取激活的图标数据
    // 判断用户是否有选择图标。如果有则保存数据，没有则不能保存数据
    if(this.data.actIcon.type == ""){
      // 条件成立则说明页面没有激活的图标

      // 显示提示框告知用户选择图标在保存
      wx.showToast({
        title: '请选择图标类型',
        icon: "none",
        mask: true,
        duration: 2000
      })
      return; // 终止代码以下代码不执行
    }else{
      var actType = this.data.actIcon.type; // 当前激活的图标类型
      var actIndex = this.data.actIcon.index; // 当前激活图标对应的滑块下标
      var actId = this.data.actIcon.id;  // 当前图标对应下标
      msgData.iconUrl = this.data.bannerIcon[actType][actIndex][actId].imgUrl;
      msgData.iconTitle = this.data.bannerIcon[actType][actIndex][actId].title;
    }
    // this.getInfo()
    // 判断用户是否有填写金额，如果没有则默认为0.00
    if(this.data.info.money == ""){
      this.data.info.money = "0.00"
    }

    // 获取用户填写的金额 日期 备注
    for(var k in this.data.info){
      console.log(this.data.info[k])
      msgData[k] = this.data.info[k]
    }

    // 显示提示框
    wx.showLoading({
      title: '正在保存...',
      mask: true
    })
    console.log('添加的数据 ==> ',msgData)
    // 调用云函数
    wx.cloud.callFunction({
      name: "xg2_add_msg_data",
      data: msgData,
      success: res => {
        // console.log("添加数据成功==》",res)

        // 数据保存成功，页面恢复原样
        this.resetData();

        // 数据保存成功，关闭加载框
        wx.hideLoading();

        // 数据保存成功，跳转到首页
        wx.switchTab({
          url: "../home/home"
        })
      },
      fail: err => {
        // console.log("添加数据失败==》", err)
      }
    })

    // console.log("msgData==>", msgData)
  },
  // 重置页面数据
  resetData(){

    // 重置标题数据
    this.data.costTitle[0].isAct = true;
    this.data.costTitle[1].isAct = false;

    // 取消激活的图标数据
    this.data.bannerIcon[this.data.actIcon.type][this.data.actIcon.index][this.data.actIcon.id].isAct = false;

    this.data.actIcon.type = "";
    this.data.actIcon.index = "";
    this.data.actIcon.id = "";

    var timeArr = this.data.today.split("-");
    // console.log(timeArr)

    // 数据响应
    this.setData({
      costTitle: this.data.costTitle,
      bannerIcon: this.data.bannerIcon,
      currentNum: 0,
      info: {
        money: "",
        date: this.data.today,
        comment: ""
      },
      currentDate: timeArr[0] + "年" + timeArr[1] + "月" + timeArr[2] + "日"
    })

    // console.log(this.data.info)
  }
})