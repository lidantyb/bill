// components/type-data/type-data.js
Component({
   /**
    * 组件的属性列表
    */
   properties: {
     booking: {
       type: Object,
       value: {}
     },
 
     total: {
       type: Number,
       value: 1
     }
   },
 
   /**
    * 组件的方法列表
    */
   methods: {
     click(e) {
       // console.log('clicktypedata e ==> ', e);
       this.triggerEvent('clicktypedata', {_ids: e.currentTarget.dataset._ids});
     }
   }
 })
 