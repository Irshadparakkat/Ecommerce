const mongoose = require("mongoose");
const shortid = require('shortid');

const orderSchema = new mongoose.Schema({
    orderId:{
        type:String,
        default: shortid.generate,
        unique: true
      },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    items:[{
     product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
     },
     quantity:{
        type:Number,
        required:true
     },
     totalprice:{
        type:Number,
        required:true
     }
    }],
    payment:{
      type:String,
    },
    status:{
        type:String,
        default:"order confirmed"
    },
    total:{
        type:Number,
        required:true
    },
    address:{
      type:String,
    ref:'address'
    },
    created:{
        type:Date,
    },
    coupon :{

      type:String,
      default:'Not Used'
    }

})
const Order = mongoose.model("Order", orderSchema)

module.exports = Order