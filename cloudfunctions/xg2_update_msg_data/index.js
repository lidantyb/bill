// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 获取数据库引用
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  // doc()：自动识别数据库集合数据的_id字段
  // update： 更新数据
  return await db.collection("xg2-msg-data").doc(event.id).update({
    data:event.newData
  })
}