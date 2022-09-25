import * as echarts from '../../components/ec-canvas/echarts';
let tool = require('../../js/tools');
//保存绘制canvas图形对象
let chartCanvas = null;
Page({
  data: {
    loading: false,
    ec: {
      onInit: null
    },
    //日期
    date: '选择日期',
    copyDate: '',
    //结束日期
    end: '',
    //日期状态, 0年,1月,2日
    dateStatus: 0,
    //默认激活下标
    activeIndex: 0,
    //收入支出
    subType: [{
        title: '收入',
        type: 'sr',
        money: 0
      },
      {
        title: '支出',
        type: 'zc',
        money: 0
      }
    ],
    //大月 具有31天的月份
    largeMonth: ['01', '03', '05', '07', '08', '10', '12'],
    //记账数据
    bookingData: {}
  },

  //初始化查询方式选择的日期
  initDate() {
    let dateStatus = this.data.dateStatus;
    let date = this.data.copyDate;
    if (dateStatus == 0) {
      this.data.date = `${date[0]}年`;
    } else if (dateStatus == 1) {
      this.data.date = `${date[0]}年${date[1]}月`;
    } else {
      this.data.date = `${date[0]}年${date[1]}月${date[2]}日`;
    }
    this.setData({
      date: this.data.date
    })
  },

  onLoad() {
    let currentDate = tool.formatDate(new Date(), 'yyyy-MM-dd');
    this.setData({
      end: currentDate,
      copyDate: currentDate.split('-'),
      ec: {
        onInit: this.initChart
      }
    })
    this.initDate();
    this.findBookingDataByDate();
  },

  //初始化canvas - 饼图
  initChart(canvas, width, height, dpr) {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      dexicePixelRatio: dpr // new
    });
    canvas.setChart(chart);
  
    // var option = {
    //   backgroundColor: '#ffffff',
    //   // 颜色需要动态设置
    //   color: ['#37A2DA', '#32C5E9', '#67E0E3', '#91F2DE', '#FFDB5C', '#FF9F7F'],
    //   legend: {
    //     top: 'bottom',
    //     left: 'center'
    //   },
    //   series: [{
    //     label: {
    //       normal: {
    //         fontSize: 14
    //       }
    //     },
    //     type: 'pie',
    //     center: ['50%', '50%'],
    //     radius: [0, '50%'],
    //     // 饼图数据需要动态设置
    //     data: [{
    //         value: 55,
    //         name: '北京'
    //       },
    //       {
    //         value: 20,
    //         name: '武汉'
    //       },
    //       {
    //         value: 10,
    //         name: '杭州'
    //       },
    //       {
    //         value: 20,
    //         name: '广州'
    //       },
    //       {
    //         value: 38,
    //         name: '上海'
    //       }
    //     ]
    //   }]
    // };
    // chart.setOption(option);
    //绘制canvas
    chart.setOption({});

    chartCanvas = chart;
    return chart;
  },

  

  // 选择日期
  selectDate(e) {
    // console.log('e ==> ', e);
    let date = e.detail.value.split('-');
    this.setData({
      copyDate: date
    })
    this.initDate();
    this.findBookingDataByDate();
  },

  //切换日查询方式
  toggleDateType() {
    let dateStatus = this.data.dateStatus;
    if (dateStatus == 2) {
      dateStatus = 0;
    } else {
      dateStatus++;
    }
    this.setData({
      dateStatus
    })
    this.initDate();
    this.findBookingDataByDate();
  },

  //切换收入-支出
  toggleSubType(e) {
    // console.log('e ==> ', e);
    let index = e.currentTarget.dataset.index;
    if (index == this.data.activeIndex) {
      return;
    }
    this.setData({
      activeIndex: index
    })
    this.getColorsByType();
  },

  //绘制饼图
  drawPie(colors, tyData) {
    let option = {
      backgroundColor: "#ffffff",
      legend: {
        top: 'bottom',
        left: 'center'
      },
      series: [{
        label: {
          normal: {
            fontSize: 14
          }
        },
        type: 'pie',
        center: ['50%', '50%'],
        radius: [0, '60%'],
        //颜色需要动态设置
        color: colors,
        //饼图数据需要动态设置
        data: tyData
      }]
    };
    setTimeout(()=>{
      chartCanvas.setOption(option);
    },500)
  },

  //获取不同类型的颜色(收入-支出)
  getColorsByType() {
    //颜色
    let colors = [];
    //获取指定类型的颜色（收入-支出）
    let type = this.data.bookingData[this.data.subType[this.data.activeIndex].title];
    let tyData = type ? type.subType : [];
    // console.log('tyData ==> ', tyData);
    tyData.forEach(v => {
      colors.push(v.color);
    })
    // console.log('colors ==> ', colors);
    this.drawPie(colors, tyData);
  },

  //查询记账数据
  findBookingData(name, data) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.cloud.callFunction({
      name,
      data,
    }).then(result => {
      wx.hideLoading();
      // console.log('【查询记账数据】result ==> ', result);

      //按照收入和支出分类
      let typeData = {};

      //遍历result.result.data
      result.result.data.forEach(v => {
        if (!typeData[v.costName]) {
          typeData[v.costName] = [v];
        } else {
          typeData[v.costName].push(v);
        }
      })
      // console.log('typeData ==> ', typeData);

      //在收入和支出筛选子类型(学习, 健康,...)
      let bookingData = {};
      for (let key in typeData) {
        let ty = {
          total: 0,
          type:"",
          subType: {}
        };
        typeData[key].forEach(v => {
          // console.log('v ===> ',v);
          ty.total += Number(v.money);
          ty.type = v.costName;

          //寻找subType是否含有学习、健康等类型
          let keys = Object.keys(ty.subType);
          if (keys.indexOf(v.iconTitle) ===  -1) {
            // console.log('v1111 ===> ',v);
            //如果找不到, 初始化

            //随机生成一个颜色
            let color = tool.createRandomColor();
            // let color = '#26b59a';

            //ty.subType.sr 或者 ty.subType.zc
            ty.subType[v.iconTitle] = {
              name: v.iconTitle,
              title: v.iconTitle,
              value: Number(v.money),
              count: 1,
              // type: v.costName=='收入'?'sr':'zc',
              icon: v.iconUrl,
              color,
              _ids: [v._id]
            }
          } else {
            ty.subType[v.iconTitle].value += Number(v.money);
            ty.subType[v.iconTitle].count++;
            // ty.subType[v.iconTitle].type.push(v.costName=='收入'?'sr':'zc');
            ty.subType[v.iconTitle]._ids.push(v._id);
          }
        })

        bookingData[key] = ty;
        // console.log('ty ==> ', ty);
      }
      // console.log('bookingData ==> ', bookingData);
      // 
      this.data.subType.forEach(v => {
        v.money = 0;
        if (bookingData[v.title]) {
          v.money = bookingData[v.title].total;
        }
      })
      for (let k in bookingData) {
        let bd = bookingData[k].subType;
      //   console.log('bd ==> ', bd);
        let tyDataArray = [];
        for (let key in bd) {
          bd[key].ty = key;
          bd[key].name = bd[key].name + ' ' + Math.round(bd[key].value / bookingData[k].total * 100) + '%';
          tyDataArray.push(bd[key]);
        }
        bookingData[k].subType = tyDataArray;
      }
      // console.log('this.data.subType ==> ',this.data.subType)
      // console.log('bookingData ==> ', bookingData);
      
      this.setData({
        bookingData,
        subType: this.data.subType
      })

      // console.log('this.data.bookingData ==> ', this.data.bookingData);

      this.getColorsByType();

    }).catch(err => {
      wx.hideLoading();
      // console.log('err ==> ', err);
    })
  },

  //根据日期查询记账数据
  findBookingDataByDate() {
    //获取查询日期条件
    let start = '';
    let end = '';
    //获取当前日期
    let current = tool.formatDate(new Date(), 'yyyy-MM-dd').split('-');
    // console.log('current ==> ', current);
    //获取用户查询的日期
    let copyDate = this.data.copyDate;
    // console.log('copyDate ==> ', copyDate);
    //如果同年
    if (current[0] == copyDate[0]) {
      // console.log('同年');
      if (this.data.dateStatus == 0) {
        /**
         * 1、按年查询
         * date的查询条件范围：当年-01-01 至 当年-当前的月份-当前的日份
         **/
        start = `${copyDate[0]}-01-01`;
        end = current.join('-');
      } else if (this.data.dateStatus == 1) {
        /**
         * 2、按月查询
         * 
         **/
        start = `${copyDate[0]}-${copyDate[1]}-01`;
        // console.log('按月查询');
        if (current[1] == copyDate[1]) {
          //如果同月
          //date的查询条件范围 当年当月-01 至 当年当月当日
          // start = `${current[0]}-${current[1]}-01`;
          end = current.join('-');
        } else {
          //如果不同月
          if (copyDate[1] == 2) {
            //如果是2月份
            //判断年份是否为闰年
            if (copyDate[0] % 400 == 0 || (copyDate[0] % 4 == 0 && copyDate[0] % 100 != 0)) {
              //date的查询条件范围 当年-02-01 至 当年02-29
              end = `${copyDate[0]}-${copyDate[1]}-29`;
            } else {
              end = `${copyDate[0]}-${copyDate[1]}-28`;
            }
          } else {
            //如果不是2月份
            //判断月份是否大月(1, 3, 5, 7, 8, 10, 12)
            if (this.data.largeMonth.indexOf(copyDate[1]) > -1) {
              end = `${copyDate[0]}-${copyDate[1]}-31`;
            } else {
              end = `${copyDate[0]}-${copyDate[1]}-30`;
            }
          }
        }
      } else {
        /**
         * 3、按日查询
         * date的查询条件范围：当年当月当日
         **/
        // console.log('按日查询');
        start = copyDate.join('-');
        end = copyDate.join('-');
      }
    } else {
      // console.log('不同年');
      if (this.data.dateStatus == 0) {
        //按年查询
        start = `${copyDate[0]}-01-01`;
        end = `${copyDate[0]}-12-31`;
      } else if (this.data.dateStatus == 1) {
        //按月查询
        start = `${copyDate[0]}-${copyDate[1]}-01`;
        if (copyDate[1] == 2) {
          //如果是2月份
          //判断年份是否为闰年
          if (copyDate[0] % 400 == 0 || (copyDate[0] % 4 == 0 && copyDate[0] % 100 != 0)) {
            //date的查询条件范围 当年-02-01 至 当年02-29

            end = `${copyDate[0]}-${copyDate[1]}-29`;
          } else {
            end = `${copyDate[0]}-${copyDate[1]}-28`;
          }

        } else {
          //如果不是2月份
          //判断月份是否大月(1, 3, 5, 7, 8, 10, 12)
          if (this.data.largeMonth.indexOf(copyDate[1]) > -1) {
            end = `${copyDate[0]}-${copyDate[1]}-31`;
          } else {
            end = `${copyDate[0]}-${copyDate[1]}-30`;
          }
        }
      } else {
        //按日查询
        start = copyDate.join('-');
        end = copyDate.join('-');
      }
    }
    // console.log('start ==> ', start);
    // console.log('end ==> ', end);

    // 如果存在end
    if (end) {
      //根据start和end查询记账数据
      //调用云函数【xg2_get_msg_data】
      this.findBookingData('xg2_get_msg_data', {
        startTime:start,
        endTime:end
      });
      // wx.cloud.callFunction({
      //   name:'xg2_get_msg_data',
      //   data:{
      //     startTime:start,
      //     endTime:end
      //   }
      // }).then(result => {
      //   console.log('result ==> ',result);
      // }).catch(err => {
      //   console.log('err ==> ',err);
      // })
    } 
  },

})

//保存绘制canvas图形对象
// let chartCanvas = null;

//   onShow() {
//     this.findBookingDataByDate();
//   },

//   

//   

//   

//   

//   

//   

//   

//   

//   },
// });