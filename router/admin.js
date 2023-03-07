const express=require("express")

const controller =require("../controller/admin")

const{varifyAdmin} = require('../middlewares/verifyadmin')

const multer =require("../middlewares/multer")

const router=express.Router()










router.get("/",controller.get_adminlog);

router.post("/adminhome",controller.post_adminlog)

router.get('/getCategorySales', varifyAdmin, controller.getCategorySales);

router.get('/payment-methods',varifyAdmin,controller.get_Linegraph)

router.get("/adminhome",varifyAdmin,controller.get_adminhome);

router.get("/addproduct",varifyAdmin,controller.get_addproduct);

router.post("/addproduct",varifyAdmin,multer.uploadmulti.array('productImages', 4),controller.post_addproduct);


router.get("/allcatogary",varifyAdmin,controller.get_catogary);


router.get("/addcatogary",varifyAdmin,controller.get_addcatogory);

router.post("/addedcatogary" ,varifyAdmin,multer.upload.single('categoryImage'),controller.Post_addcatogary);

router.get("/allproduct",varifyAdmin,controller.get_allproduct)


router.get('/banner',varifyAdmin,controller.get_banner)

router.post("/addbanner" ,varifyAdmin,multer.bannerupload.single('bannerImage'),controller.post_addbanner);


router.get("/adminuser",varifyAdmin,controller.get_userdetails)

router.post("/updateUserStatus",varifyAdmin,controller.post_updateuser)

router.get("/addnewcoupen",varifyAdmin,controller.get_addcoupen)

router.get("/addnewbanner",varifyAdmin,controller.get_addbanner)


router.post("/postaddcoupon",varifyAdmin,controller.post_addcoupen)

router.get("/coupon",varifyAdmin,controller.get_coupenlist)

router.post("/updateOrderStatus",varifyAdmin,controller.post_updateOrder)

router.get('/deletecoupon/:id',controller.delete_coupon);

router.get('/delete-category/:id',varifyAdmin,controller.deleteCatogary)

router.get('/singleproductview/:id',varifyAdmin,controller.get_productview)


router.get('/deletproduct/:id',varifyAdmin,controller.deleteProduct)

router.get('/editproduct/:id',varifyAdmin,controller.editproduct)

router.post('/editproduct',varifyAdmin,controller.Post_editproduct)

router.get('/deletbanner/:id',varifyAdmin,controller.bannerDelete)

router.get('/adminorder',varifyAdmin,controller.userorders)

router.get('/adminorder/:orderId',varifyAdmin,controller.get_orderdetail)

router.get ('/deletelorder/:orderId',varifyAdmin,controller.delete_order)
router.get('/logout',controller.get_logout)


module.exports = router;