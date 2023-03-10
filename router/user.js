const express= require("express");



const uscontroller=require("../controller/usercontroller");

const{varifyUser} = require('../middlewares/verifyuser')

const{verifyingUser} = require('../middlewares/verifyinguser')


const router= express.Router()




router.get("/",uscontroller.get_userhome);

router.get("/filter/:category",uscontroller.get_productbyfilter)


router.get("/productview/:id",uscontroller.get_productview)


router.get('/login', uscontroller.get_loginpage);

router.post("/login",uscontroller.post_login)

router.get("/signup",uscontroller.get_signuppage)

router.post("/signup",uscontroller.post_signuppage)

router.get('/otp',uscontroller.getOtp)

router.post('/otp',uscontroller.postOtp)

router.get('/search',uscontroller.get_searchResult)

router.post('/addtowishlist',verifyingUser,uscontroller.addto_wishlist)

router.post("/addtocart",varifyUser,uscontroller.post_cartview)

router.delete('/wishlist/:itemName',verifyingUser,uscontroller.Delete_wishlist)

router.get("/cart",verifyingUser,uscontroller.get_cartview);

router.get("/userprofile/:id",uscontroller.get_userprofile)

router.get("/allproducts",uscontroller.get_allproducts)

router.get("/filterallproduct/:category",uscontroller.get_productbyfilterall)


router.get('/allwishlist',verifyingUser,uscontroller.get_wishlist)

router.delete("/removefromcart",verifyingUser,uscontroller.delete_fromthecart)

router.put("/updatecart",uscontroller.update_cart);

router.post("/coupenpost",uscontroller.coupen_check);


router.post('/applyingcoupen',uscontroller.applyingcoupen)

router.get('/checkout',verifyingUser,uscontroller.get_checkoutpage)

router.post('/return-order',verifyingUser,uscontroller.updateOrder)

router.post('/addresspost',uscontroller.postaddress)



router.get('/delete/:id',verifyingUser,uscontroller.deleteAddress);

router.post('/editaddress/:id',verifyingUser,uscontroller.EditAddress)

router.post('/create-order',uscontroller.paypalpayment)

router.post('/makepurchase',uscontroller.postorder)

router.get('/orders',verifyingUser,uscontroller.get_purchaseOrder)

router.get('/order/:orderId',verifyingUser,uscontroller.get_singleOrder)


router.get('/cancelorder/:orderId',verifyingUser,uscontroller.get_cancelOrder)

router.get('/invoice/:orderId',verifyingUser,uscontroller.get_invoice)

router.get('/logout',uscontroller.get_logout)

router.get('/errorpage',uscontroller.get_errorpage)

module.exports = router;
