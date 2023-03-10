const mongoose = require('mongoose');
const Product = require("../models/Item");

const User = require("../models/User")
const Category = require("../models/catogary")
const Cart = require("../models/Cart");
const Coupon = require('../models/coupen');

const Wishlist = require('../models/wishlist');
const Banner = require('../models/banner');

const Address = require('../models/address');
const bcrypt = require('bcrypt');
const session = require("express-session");
const address = require('../models/address');
const Order = require('../models/order');
const { sendotp, verifyotp } = require("../verification/otpverify");


const paypal = require("@paypal/checkout-server-sdk")

const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  ))



module.exports.get_userhome = async (req, res) => {
  try {
    // Use aggregate to group products by name and get the first values of other fields
    const products = await Product.aggregate([
      {
        $group: {
          _id: "$name",
          sizes: { $push: "$size" },
          price: { $first: "$price" },
          images: { $first: "$images" },
          category: { $first: "$category" },
          stock: { $first: "$stock" },
          description: { $first: "$description" }
        }
      }
    ]);

    // Get all categories
    const categories = await Category.find();

    const banners = await Banner.find();

    // Check if user is authenticated
    if (req.session.authenticated) {
      const email = req.session.username;

      // Find the user
      const user = await User.findOne({ email: email });

      // Check if user is active
      if (user.status === 'active') {

        // Find the cart of the user and populate the product items
        const cart = await Cart.findOne({ owner: user._id }).populate("items.product");

        // Find the wishlist of the user if it exists and populate the products
        const wishlist = await Wishlist.findOne({ user: req.session.userId }).populate("products");

        // Render the userhome view with products, categories, user, cart, and wishlist
        res.render('user/userhome', { products, categories, user, cart, wishlist ,banners });

      } else {
        req.flash('error', "Your account is blocked");
        res.redirect('/login');
      }

    } else {
      // Render the userhome view with products and categories, without user and cart information
      res.render('user/userhome', { products, categories, user: null, cart: null, wishlist: null ,banners });
    }
  } catch (err) {
    console.log(err);
    res.redirect('/error') 

  }
};



module.exports.get_productview = async (req, res) => {
  const productName = req.params.id;

  const productsall = await Product.aggregate([
    {
      $group: {
        _id: "$name",
        sizes: { $push: "$size" },
        price: { $first: "$price" },
        images: { $first: "$images" },
        category: { $first: "$category" },
        stock: { $first: "$stock" },
        description: { $first: "$description" }
      }
    }
  ])
  Product.find({ name: productName })
    .then((products) => {
      if (!products) {
        console.log("cannot find any product with this name");
      } else {
        const sizes = products.map(p => p.size);
        const firstProduct = products[0];
        if (req.session.authenticated) {
      
          const email = req.session.username;
          User.findOne({ email: email }).then(user => {
            if (user.status === 'active') {
              Cart.findOne({ owner: user._id }).populate("items.product").then(cart => {
                if (cart) {
                  res.render('user/userproductview', { products: productsall, product: firstProduct, sizes: sizes, user: user, cart: cart, error: req.flash('error') });
                } else {
                  res.render('user/userproductview', { products: productsall, product: firstProduct, sizes: sizes, user: user, cart: null, error: req.flash('error') });
                }
              });
            }
          })
        } else {
          res.render("user/userproductview", { products: productsall, product: firstProduct, sizes: sizes, user: null, cart: null });
        }
      }
    }).catch((err) => {
      console.log(err)
      res.redirect('/error') 

    });
};








module.exports.get_loginpage = (req, res) => {

  if(req.session.authenticated){
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.redirect('/')

  }else{
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  res.render('user/userlogin', { error: req.flash('error'), success: req.flash('success') });  
}
}


module.exports.post_login = async (req, res) => {
  try {
    const { email, password, number } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password)
      if (isMatch) {
        req.session.authenticated = true;
        req.session.username = email;
        req.session.userId = user._id;
        console.log("login successfull");

        res.redirect("/")
      } else {
        req.flash('error', "Invalid password");
        res.redirect("/login")
      }
    } else {
      req.flash("error", "You are not a valid user");
      res.redirect("/signup")
    }
  } catch (err) {
    req.flash("error", "something went wrong, please try again.");
    res.redirect("/login");
  }
};



module.exports.get_signuppage = (req, res) => {
  res.render("user/usersignup", { error: req.flash('error') })
}



module.exports.post_signuppage = async (req, res) => {

  try {

    const { first_name, last_name, password, email, phone, gender } = req.body;

    const number = req.body.phone;
    const user = await User.findOne({ email: req.body.email })

    if (user) {
      req.flash('error', 'this email is already used');
      res.redirect("/signup");

    }

    else if (!number) {

      req.flash('error', 'please enter the phone Number');
      res.redirect("/signup");
    }
    else if (!first_name) {

      req.flash('error', 'please enter the correct name');
      res.redirect("/signup");

    }

    else if (!last_name) {

      req.flash('error', 'please enter the correct name');
      res.redirect("/signup");

    }

    else if (!email) {

      req.flash('error', 'please enter the correct email');
      res.redirect("/signup");

    }

    else if (!password) {

      req.flash('error', 'please enter the correct password');
      res.redirect("/signup");

    }

    else {

      req.session.usr1 = req.body

      sendotp(number);

      res.redirect('/otp')

    }


  } catch (err) {

    console.log(err);
    res.redirect('/error') 


  }
}

module.exports.getOtp = (req,res)=>{

  if(req.session.usr1){

res.render('user/otp',{ error: req.flash('error') })
}else{
  res.redirect('/signup')
}
}



module.exports.get_userprofile = async (req, res) => {

  const userId = req.params.id;

 
  try{

const user = await User.findById(userId)

const userAddress = await address.findOne({user : userId })

const cart = await Cart.findOne({ owner: user._id }).populate("items.product");


if(userAddress){

  const findaddress = userAddress.address;

  res.render('user/userprofile', { user: user , cart, findaddress ,userAddress})

}else{

  res.render('user/userprofile', { user: user , cart,userAddress })


}

  }

  catch(err){

    console.log(err)
    res.redirect('/error') 


  }
  
}



module.exports.postOtp = async (req, res) => {

  try {

    const { first_name, last_name, password, email, phone, gender } = req.session.usr1;
    const otp = req.body.otp;

    verifyotp(phone, otp).then(async (verification_check) => {
      if (verification_check.status === 'pending' || verification_check.status === 'failed') {
        req.flash('error', 'Invalid OTP. Please enter a valid OTP.');
        res.redirect('/otp');
      } else {
        const user = await User.create({
          first_name,
          last_name,
          email,
          password,
          phone,
          gender,
        });
        req.flash('success', 'Successfully registered! Please login.');
        res.redirect('/login');
      }
    });
  } catch (err) {
    req.flash('error', 'Please enter all the fields correctly.');
    res.redirect('/signup');
  }

}



module.exports.get_allproducts = async (req, res) => {
  
  try {
    // Use aggregate to group products by name and get the first values of other fields
    const products = await Product.aggregate([
      {
        $group: {
          _id: "$name",
          sizes: { $push: "$size" },
          price: { $first: "$price" },
          images: { $first: "$images" },
          category: { $first: "$category" },
          stock: { $first: "$stock" },
          description: { $first: "$description" }
        }
      }
    ]);

    // Get all categories
    const categories = await Category.find();

    // Check if user is authenticated
    if (req.session.authenticated) {
      const email = req.session.username;

      // Find the user
      const user = await User.findOne({ email: email });

      // Check if user is active
      if (user.status === 'active') {

        // Find the cart of the user and populate the product items
        const cart = await Cart.findOne({ owner: user._id }).populate("items.product");

        // Find the wishlist of the user if it exists and populate the products
        const wishlist = await Wishlist.findOne({ user: req.session.userId }).populate("products");

        // Render the userhome view with products, categories, user, cart, and wishlist
        res.render('user/allproducts', { products, categories, user, cart, wishlist });

      } else {
        req.flash('error', "Your account is blocked");
        res.redirect('/login');
      }

    } else {
      // Render the userhome view with products and categories, without user and cart information
      res.render('user/allproducts', { products, categories, user: null, cart: null, wishlist: null });
    }
  } catch (err) {
    console.log(err);
    res.redirect('/error') 

  }
}


module.exports.get_productbyfilterall = async (req,res) =>{

  const category = req.params.category;

  try {
    const products = await Product.aggregate([
      {
        $match: {
          category: category
        }
      },
      {
        $group: {
          _id: "$name",
          sizes: { $push: "$size" },
          price: { $first: "$price" },
          images: { $first: "$images" },
          stock: { $first: "$stock" },
          description: { $first: "$description" }
        }
      }
    ]);

    const categories = await Category.find();

    if (req.session.authenticated) {
      const email = req.session.username;
      const user = await User.findOne({ email: email });
      if (user.status === 'active') {
        const cart = await Cart.findOne({ owner: user._id }).populate("items.product");

        const wishlist = await Wishlist.findOne({ user: user._id }).populate("products");

       
        res.render('user/allproducts', { products, categories, user, cart, wishlist });

      } else {
        req.flash('error', "Your account is blocked.");
        res.redirect('/login');
      }
    } else {
      res.render('user/allproducts', { products, categories, user: null, cart: null, wishlist: null });
    }
  } catch (error) {
    console.log(error);
    res.redirect('/error') 
    res.status(500).send("An error occurred.");
 

  }

} 




module.exports.get_productbyfilter = async (req,res) =>{

  const category = req.params.category;

  try {
    const products = await Product.aggregate([
      {
        $match: {
          category: category
        }
      },
      {
        $group: {
          _id: "$name",
          sizes: { $push: "$size" },
          price: { $first: "$price" },
          images: { $first: "$images" },
          stock: { $first: "$stock" },
          description: { $first: "$description" }
        }
      }
    ]);

    const categories = await Category.find();
    const banners = await Banner.find();

    if (req.session.authenticated) {
      const email = req.session.username;
      const user = await User.findOne({ email: email });
      if (user.status === 'active') {
        const cart = await Cart.findOne({ owner: user._id }).populate("items.product");

        const wishlist = await Wishlist.findOne({ user: user._id }).populate("products");

       
        res.render('user/userhome', { products, categories, user, cart, wishlist ,banners });

      } else {
        req.flash('error', "Your account is blocked.");
        res.redirect('/login');
      }
    } else {
      res.render('user/userhome', { products, categories, user: null, cart: null, wishlist: null ,banners });
    }
  } catch (error) {
    console.log(error);
    res.redirect('/error') 
    res.status(500).send("An error occurred.");
  }

} 




module.exports.addto_wishlist = async (req, res) => {
  const productName = req.body.productId;
  const userId = req.session.userId;

  try {
    const product = await Product.findOne({ name: productName });

    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      // Create a new wishlist if one doesn't exist for the user
      wishlist = new Wishlist({
        user: userId,
        products: [{ product: product._id }],
      });
      await wishlist.save();
      return res.status(200).json({ added: true });
    }

    // Check if the product is already in the wishlist
    const productIndex = wishlist.products.findIndex(
      (p) => p.product.toString() === product._id.toString()
    );

    if (productIndex === -1) {
      // Add the product to the wishlist if it's not already there
      wishlist.products.push({ product: product._id });
      await wishlist.save();
      return res.status(200).json({ added: true });
    }

    // Remove the product from the wishlist if it's already there
    wishlist.products.splice(productIndex, 1);
    await wishlist.save();
    return res.status(200).json({ removed: true });
    
  } catch (err) {
    console.error(err);
    res.redirect('/error') 
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports.get_searchResult = async (req, res) => {
  try {
    const searchTerm = req.query.term;

    const matchingProducts = await Product.find({ name: { $regex: searchTerm, $options: 'i' } }).lean();

    const groupedProducts = {};
    matchingProducts.forEach(product => {
      if (groupedProducts[product.name]) {
        groupedProducts[product.name].sizes.push(product.size);
      } else {
        groupedProducts[product.name] = {
          ...product,
          sizes: [product.size]
        };
        delete groupedProducts[product.name].size;
      }
    });

    const matchedProducts = Object.values(groupedProducts);

    res.json({ products: matchedProducts });
  } catch (err) {
    console.log(err);
    res.redirect('/error') 
    return res.status(500).send();
  }
};





module.exports.get_wishlist = async (req, res) => {
  const userId = req.session.userId;
  try {
    const user = await User.findById(userId);
    const cart = await Cart.findOne({ owner: user._id }).populate("items.product");
    const wishlist = await Wishlist.findOne({ user: userId }).populate('products.product');
  
    if (!wishlist) {
      return res.render('user/allwishlist',{ wishlist: null, user, cart });
    }
    
    const products = [];
    
    for (const item of wishlist.products) {
      const product = await Product.aggregate([
        {
          $match: {
            name: item.product.name
          }
        },
        {
          $group: {
            _id: "$name",
            sizes: { $push: "$size" },
            price: { $first: "$price" },
            images: { $first: "$images" },
            stock: { $first: "$stock" },
            description: { $first: "$description" }
          }
        }
      ]);
      
      const sizes = product.length > 0 ? product[0].sizes : [];
      
      products.push({
        id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        stock : item.product.stock,
        image: item.product.images[0],
        sizes: sizes,
      });
    }

    res.render('user/allwishlist',{ wishlist: products, user, cart });

  } catch (err) {
    console.log(err);
    res.redirect('/error') 
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports.Delete_wishlist = async (req,res)=>{

  const itemName = req.params.itemName


  try {
    // Find the item in the wishlist by name
    const itemToDelete = await Wishlist.findOne({ name: itemName });

    if (!itemToDelete) {
      return res.status(404).send('Item not found in wishlist');
    }

    // Delete the item from the wishlist
    await itemToDelete.deleteOne();

    res.sendStatus(204); // No content
  } catch (error) {
    console.error(error);
    res.redirect('/error') 
    res.status(500).send('Error deleting item from wishlist');
  }


}



module.exports.post_cartview = async (req, res) => {
  const productId = req.body.productId;
  const size = req.body.size;
  const userId = req.session.userId;

  try {
    const product = await Product.findOne({ name: productId, size: size });
    const user = await Cart.findOne({ owner: userId });

    const proid = product._id


    if (!user) {
      // creating a new cart if user does not have one
      const newCart = await Cart.create({
        owner: userId,
        items: [{ product: proid, size: size, totalprice: product.price }],
        cartTotal: product.price,
      });
      await newCart.save();
    } else {
      const userProduct = await Cart.findOne({
        owner: userId,
        "items.product": proid
      });


      if (userProduct) {


        const singleProduct = userProduct.items.find(item => item.product.toString() === proid.toString());

        if (product.stock > singleProduct.quantity) {
          // incrementing the quantity and total price of existing product in cart

          await Cart.updateOne(
            { owner: userId, "items.product": proid },
            {
              $inc: {
                "items.$.quantity": 1,
                "items.$.totalprice": product.price,
                cartTotal: product.price,
              },
            }
          );
        } else {

          return res.json({ status: false, error: "Out of stock" });

        }

      } else {
        // adding a new product to cart
        await Cart.updateOne(
          { owner: userId },
          {
            $push: {
              items: {
                product: proid,
                totalprice: product.price,
                size: size,
              },
            },
            $inc: { cartTotal: product.price },
          }
        );
      }
    }
    res.json({ status: true });
  } catch (error) {
    console.log(error);
    res.redirect('/error') 
  }
};


module.exports.get_cartview = async (req, res) => {
  try {
    const userId = req.session.userId;

    const user = await User.findOne({ _id: userId });

    const cart = await Cart.findOne({ owner: userId }).populate("items.product")


    if (cart.items.length) {


      res.render("user/cartview", { cartitems: cart, user, cart: cart });

    } else {

      res.render("user/emptycart", { cart: null, user });

    }

  } catch (error) {
    console.log(error);
    res.redirect('/error') 
  }
};





module.exports.update_cart = async (req, res) => {

  const { cartItemId, productId, quantity, size } = req.body;

  const count = parseInt(quantity);
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ message: 'Product not found' });
    }
    const mycart = await Cart.findOne({ owner: req.session.userId })

    if (!mycart) {
      return res.status(400).json({ message: 'Cart not found' });
    }

    const productItems = mycart.items.filter(item => item.product.toString() === productId.toString());

    const singleProduct = productItems.find(item => item.size === size);

    const priceIncrease = product.price * count;

    const cart = await Cart.findOneAndUpdate(
      { owner: req.session.userId, "items.product": productId, "items.size": size },
      {
        $set: { "items.$.size": size },
        $inc: { "items.$.quantity": count, "items.$.totalprice": priceIncrease, "cartTotal": priceIncrease }
      },
      { new: true }
    );

    if (!cart) {
      return res.status(400).json({ message: 'Cart not found' });
    }
    const totalcount = productItems.reduce((acc, item) => acc + item.quantity, 0) + count;

    const subtotal = cart.items.find(item => item.product == productId && item.size === size).totalprice;
    const cartTotal = cart.cartTotal;



    if (product.stock < totalcount) {
      return res.status(400).json({
        message: 'OUT OF STOCK', subtotal: subtotal,
        cartTotal: cartTotal
      });
    }

   

    return res.status(200).json({
      success: true,
      subtotal: subtotal,
      cartTotal: cartTotal
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating cart' });

  }
};



module.exports.delete_fromthecart = async (req, res) => {
  try {
    const productId = req.body.productid;
    const size = req.body.size;
    const userid = req.session.userId;

    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(400).json({ message: 'Product not found' });
    }

    const cart = await Cart.findOne({ owner: userid, "items.product": productId, "items.size": size });
    if (!cart) {
      return res.status(400).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId && item.size === size);
    if (itemIndex < 0) {
      return res.status(400).json({ message: 'Product not found in cart' });
    }

    const singleItemPrice = cart.items[itemIndex].totalprice;

    const deletedProduct = await Cart.findOneAndUpdate(
      { owner: userid, "items.size": size },
      {
        $pull: {
          items: { product: productId, size: size },
        },
        $inc: { cartTotal: -singleItemPrice },
      },
      { new: true }
    );

    const newCart = await Cart.findOne({owner : userid})

    const cartTotal = newCart.cartTotal;
    
   
    return res.status(200).json({ message: 'Success' ,cartTotal :cartTotal});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error removing from cart' });
  }
};





module.exports.coupen_check = async (req, res) => {

  const userId = req.session.userId;
  const coupenCode = req.body.coupenCode;

  try {
    const cart = await Cart.findOne({ owner: userId });
    if (!cart) {
      return res.status(400).json({ error: 'Cart not found' });
    }

    const coupen = await Coupon.findOne({ code: coupenCode });
    if (!coupen) {
      return res.status(400).json({ error: 'Invalid coupon code' });
    }

    if (coupen.expiredAfter && coupen.expiredAfter < new Date()) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    if (coupen.mincartAmout && coupen.mincartAmout > cart.cartTotal) {
      return res.status(400).json({ error: `Minimum cart amount of ${coupen.mincartAmout} is required` });
    }

    const user = await User.findById(userId);
    if (coupen.userUsed.some(u => u.userId.toString() === userId)) {
      return res.status(400).json({ error: 'Coupon has already been used by this user' });
    }

    const discount = coupen.maxdiscountAmount

    res.json({ message: 'Coupon is applicable', discount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to use coupon' });
  }
};


module.exports.applyingcoupen = async (req, res) => {

  const userId = req.session.userId

  const coupenCode = req.body.validcoupen

  try {
    const coupen = await Coupon.findOne({ code: coupenCode });

    const user = await User.findById(userId);
    if (coupen.userUsed.some(u => u.userId.toString() === userId)) {
      return res.status(400).json({ error: 'Coupon has already been used by this user' });
    }

    coupen.userUsed.push({ userId });
    await Promise.all([coupen.save()]);

    const discount = coupen.maxdiscountAmount


    res.json({ message: 'Coupon Applied Successfully', discount });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to use coupon' });

  }
}


module.exports.get_checkoutpage = async (req, res) => {
 
  try {
    const userId = req.session.userId;

  const paypalid = process.env.PAYPAL_CLIENT_ID

    const user = await User.findOne({ _id: userId });
    const cart = await Cart.findOne({ owner: userId }).populate("items.product");
     // add this line to check the value of cart
     const addresses = await address.find({ user: userId });

    res.render("user/checkout", {
      cartitems: cart && cart.items.length ? cart : null,
      addresses,
      cart: cart && cart.items.length ? cart : null,
      user,paypalid,
    });




  } catch (error) {
    console.error(error);
    res
      .status(500)
      .render("error", { message: "Checkout failed, please try again." });
  }
};





module.exports.postaddress = async (req, res) => {
  const userId = req.session.userId;
  const addressData = req.body;

  try {
    const addressExist = await Address.findOne({ user: userId });

    if (addressExist) {
      await Address.findOneAndUpdate(
        { user: userId },
        { $push: { address: [addressData] } }
      );
    } else {
      const userAddress = new Address({
        user: userId,
        address: [addressData],
      });

      await userAddress.save();
    }
    // The response should be sent after the database operation has completed
    res.json({ message: "Address saved successfully" });
  } catch (error) {
    console.error('There was a problem with the database operation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports.EditAddress = async (req, res) => {
  try {
    const addId = req.params.id;

    const { name, email, phone, address, city, state, pin } = req.body;
    await Address.updateMany(
      { "address._id": addId },
      {
        $set: {
          "address.$.name": name,
          "address.$.email": email,
          "address.$.phone": phone,
          "address.$.city": city,
          "address.$.state": state,
          "address.$.pin": pin,
          "address.$.address": address,
        },
      }
    );
    res.redirect("back");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};




module.exports.deleteAddress = async (req, res) => {

  const id = req.params.id;

  userid = req.session.userId;

  await Address.updateOne(
    { user: userid },
    { $pull: { address: { _id: id } } }
  );
  res.redirect('back');
}


module.exports.postorder = async (req, res) => {

  const { coupon, totalamt, paymentType, index } = req.body;

  const addressid = index;

  const userId = req.session.userId;
  let coupenuse = "Not Used"

  try {

    if (coupon) {
      const coupen = await Coupon.findOne({ code: coupon });
      const user = await User.findById(userId);
      if (coupen.userUsed.some(u => u.userId.toString() === userId)) {
        return res.status(400).json({ error: 'Coupon has already been used by this user' });
      }
      coupen.userUsed.push({ userId });
      await coupen.save();

       coupenuse = coupon
    }

    // Find user's cart
    const cart = await Cart.findOne({ owner: userId });
    if (cart.items.length < 1) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    // Calculate the total after coupon discount
    let total = parseInt(totalamt);

    if (!index) {
      return res.status(400).json({ error: 'Please select an address' });
    }

    const detail = await Address.findOne({ user: userId });

    const DeliveryAddress = detail.address.find(
      (el) => el._id.toString() == addressid
    );

    // Check if cart quantity exceeds product stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Quantity of ${product.name} exceeds available stock` });
      }
    }
  
    if (paymentType == 'paypal') {
     
      const newOrder = new Order({
        user: mongoose.Types.ObjectId(userId),
        items: cart.items,
        payment: paymentType,
        address: DeliveryAddress._id,
        total: total,
        created: Date.now(),
        coupon: coupenuse,

      });
      await newOrder.save()
 // Update product stocks and clear user's cart
 for (const item of cart.items) {
  await Product.updateOne(
    { _id: item.product },
    { $inc: { stock: -item.quantity } },
    { upsert: true }
  );
}
await cart.updateOne({ items: [], cartTotal: 0 });

res.json({ Paypal: true  });
    } 
    else if (paymentType == 'cod') {
     
      const newOrder = new Order({
        user: mongoose.Types.ObjectId(userId),
        items: cart.items,
        payment: paymentType,
        address: DeliveryAddress._id,
        total: total,
        created: Date.now(),
        coupon: coupenuse,

      });
      await newOrder.save();

      // Update product stocks and clear user's cart
      for (const item of cart.items) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: -item.quantity } },
          { upsert: true }
        );
      }
      await cart.updateOne({ items: [], cartTotal: 0 });

      res.json({ cod: true });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};



module.exports.paypalpayment = async (req, res) => {
  try {
    const userId = req.session.userId;
    const coupencode = req.body.coupen;
    let discount = 0;
    const coupon = await Coupon.findOne({ code: coupencode });

    if (coupon) {
      if (coupon.userUsed.some(u => u.userId.toString() === userId)) {
        discount  = 0;
      }
  else{
    discount = coupon.maxdiscountAmount;
  }

    }

    const cart = await Cart.findOne({ owner: userId }).populate("items.product");

    const subtotal = cart.cartTotal;
    const gst = subtotal * 0.18;
    const total = subtotal + gst - discount;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: total.toFixed(0),
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: subtotal.toFixed(0),
              }, discount: {
                currency_code: "USD",
                value: discount.toFixed(0),
              },
              tax_total: {
                currency_code: "USD",
                value: gst.toFixed(0),
              },
            
            },
          },
          items: cart.items.map((item) => {
            return {
              name: item.product.name,
              unit_amount: {
                currency_code: "USD",
                value: item.product.price.toFixed(0),
              },
              quantity: item.quantity,
            };
          }),
        },
      ],
    });

    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};



module.exports.get_purchaseOrder= async(req,res)=>{


  try{

    const count = req.count;
    const userId = req.session.userId;
  
    const user = await User.findOne({ _id: userId });
    const cart = await Cart.findOne({ owner: userId }).populate("items.product");
     // Find all orders for the user and populate the "items.product" field
     const orders = await Order.find({ user: userId }).populate("items.product").sort({ created: -1 });

    res.render('user/order',{cart,user,orders})

  }catch(e){

console.log(e);

res.redirect('/error') 

  }

}





module.exports.get_singleOrder= async(req,res)=>{

  try {
  
    const userId = req.session.userId;
    const orderId = req.params.orderId;

    
    const order = await Order.findOne({ orderId: orderId, user: userId }).populate("items.product");

    res.render('user/orderview', { order });
  } catch (error) {

    console.log(error);
    res.redirect('/error') 
   
  }

}

module.exports.get_cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Get the cancelled order
    const cancelledOrder = await Order.findOne({ orderId: orderId }).populate('items.product');

    // Increment the product stock for each product in the cancelled order
    for (const item of cancelledOrder.items) {
      const product = item.product;
      const quantity = item.quantity;
      product.stock += quantity;
      await product.save();
    }

    // Delete the cancelled order
    await Order.deleteOne({ orderId: orderId });

    res.redirect('/orders');
  } catch (err) {
    console.log(err);
    res.redirect('/error') 
   
    res.status(500).send('Error cancelling order');
  }
}


module.exports.updateOrder = async (req,res)=>{
  try {
    const orderId = req.body.orderId;
    const updatedOrder = await Order.findOneAndUpdate({orderId:orderId}, { status: 'order returned' }, { new: true });
    res.status(200).json({ message: "Order updated successfully", data: updatedOrder });
  } catch (error) {
    console.log(error);
    res.redirect('/error') 
   
    res.status(500).json({ error: error });
  }
}


module.exports.get_invoice =async (req,res)=>{

  try {
  
    const userId = req.session.userId;
    const orderId = req.params.orderId;

    const user = await User.findOne({ _id: userId });
    const cart = await Cart.findOne({ owner: userId }).populate("items.product");
    
    const order = await Order.findOne({ _id: orderId, user: userId }).populate("items.product")


  const addressid = order.address

    let Coupen;
    if (order.coupon !== 'Not Used') {
      Coupen = await Coupon.findOne({ code: order.coupon });
    } else {
      Coupen = order.coupon;
    }
    
    const orderAddress = await address.findOne({ user: userId });
    const index = await orderAddress.address.findIndex(
      (obj) => obj._id == addressid
    );
    const finalAddress = orderAddress.address[index];
  

    res.render('user/invoice', {order,Coupen ,finalAddress });
  } catch (error) {

    res.redirect('/error') 

    console.log(error);
   
  }


}




module.exports.get_logout = (req, res) => {
  req.session.destroy()
  res.redirect('/')

}

module.exports.get_errorpage = async (req,res)=>{

  if (req.session.authenticated) {
    const email = req.session.username;

    // Find the user
    const user = await User.findOne({ email: email });

    // Check if user is active
    if (user.status === 'active') {

      // Find the cart of the user and populate the product items
      const cart = await Cart.findOne({ owner: user._id }).populate("items.product");

      // Find the wishlist of the user if it exists and populate the products
    
      // Render the userhome view with products, categories, user, cart, and wishlist
      res.render('user/errorpage', { user, cart, });

    } else {
      req.flash('error', "Your account is blocked");
      res.redirect('/login');
    }

  } else {
    // Render the userhome view with products and categories, without user and cart information
    res.render('user/errorpage', {  user: null, cart: null });
  }

}

