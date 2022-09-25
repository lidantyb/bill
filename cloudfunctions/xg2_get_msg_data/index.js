// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 获取数据库引用
const db = cloud.database()

// 获取数据库操作符
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
   return await db.collection("xg2-msg-data").where({
    date: _.gte(event.startTime).and(_.lte(event.endTime)),
    userInfo: event.userInfo
  }).get()
}