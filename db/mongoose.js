const mongoose = require("mongoose")

const dotenv = require('dotenv');
dotenv.config({ path: './config/dev.env' });


mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
},console.log("mongodb is connected"))