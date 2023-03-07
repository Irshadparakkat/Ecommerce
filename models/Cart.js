const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  owner:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'user'
  },
  items:[{
      product:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Product'
      },
      quantity:{
       type:Number,
       default:1
      },
      totalprice:{
          type:Number,
          default:0
      },

      size:{
        type:String,
        required:true
      },
      Date:{
          type:Date,
          default:Date.now
      }
  }],
 
  cartTotal:{
      type:Number,
      default:0
  }
});


const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
