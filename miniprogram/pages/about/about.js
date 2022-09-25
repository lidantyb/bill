// // pages/about/about.js
// Page({

//    /**
//     * 页面的初始数据
//     */
//    data: {
//       // 是否显示头像
//       isAuth:false,
//       // 用户信息
//       userInfo:{
//          nickName:'请先登录'
//       }
//    },

//    // 点击获取用户信息事件
//    getUserInfo(e){
//       console.log(e)
//       // 调用api
//       wx.getUserProfile({
//          // 必填，说明用途
//          desc:'用于完善会员资料',
//          success:(res) => {
//             console.log('登录成功==>',res)

//             this.setData({
//                isAuth:true,
//                userInfo:res.userInfo
//             })

//             wx.setStorage({
//               data: true,
//               key: 'isAuth',
//             })
//          },
//          fail:(err) => {
//             console.log('登录失败==>',err)
//          }
//       })
//    }
// })