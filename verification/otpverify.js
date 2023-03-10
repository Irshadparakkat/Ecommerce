
const dotenv = require('dotenv');
dotenv.config({ path: './config/dev.env' });


// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure

const accountSid = process.env.ACCOUNTSID

const authToken = process.env.AUTHTOCKEN

const verifySid = process.env.VERIFYSID

const client = require("twilio")(accountSid, authToken);





function sendotp(sendotpphone){

client.verify.v2.services(verifySid)
                .verifications
                .create({to: `+91${sendotpphone}`, channel: 'sms'})
                .then(verification => console.log(verification.status));
}



function verifyotp(phone,otp){
        return new Promise((resolve,reject)=>{
         client.verify.v2.services(verifySid)
           .verificationChecks
           .create({to: `+91${phone}`, code: otp})
           .then((verification_check) =>{ 
               console.log(verification_check.status);
         resolve(verification_check)
       })
   
   })
   }


  module.exports ={
    sendotp,
    verifyotp
}
