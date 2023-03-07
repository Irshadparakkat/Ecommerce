const moongoose = require('mongoose')
const addresSchema = new moongoose.Schema({
    user :{
        type: moongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    address : [{
        name:{
            type:String,
            max:20
        },
        email:{
            type:String
        },
        phone:{
            type:Number
        },
        state:{
            type:String
        },
        city:{
            type:String
        },
        pin:{
            type:Number
        },    
        address:{
            type:String
        },
        
    }]
})

const address = moongoose.model('address',addresSchema)
module.exports = address