const User = require("../models/User");

const Category = require("../models/catogary")

const Product = require('../models/Item');

const session = require("express-session");

const Coupen = require("../models/coupen");

const Cart = require("../models/Cart");

const Order = require('../models/order')

const Banner = require('../models/banner');
const Address = require('../models/address');

module.exports.get_adminlog = (req, res) => {
  res.render("admin/adminlogin", { error: req.flash('error') })
}

const adminemail =process.env.adminusername
const adminpassword = process.env.adminpassword

module.exports.post_adminlog = (req, res) => {

 
  let email = req.body.email
  let password = req.body.password

  let data = {
    'email': email,
    'password': password
  }
  if (adminemail == data.email && adminpassword == data.password) {
    req.session.adminauthenticated = true;
    req.session.username = req.body.email;
    res.redirect('adminhome');
  } else {
    req.flash('error', 'Invalid User name or password.');
    return res.redirect('/admin');
  }
}


module.exports.get_searchresult = async (req,res)=>{
  try {
    const searchTerm = req.query.searchTerm;
  
    // Perform a search operation based on the search term
    const products = await Product.find({ name: { $regex: searchTerm, $options: 'i' } });
    // Return the products as a JSON response
    res.json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
}


// Function to get category-wise sales data
const getCategorySales = async () => {
  try {
    const orders = await Order.find().populate("items.product");
    const salesData = {};
    let totalSales = 0;
    const categories = await Category.find(); // get all categories from the database
    const categoryColors = {};
    const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
    
    categories.forEach((category, index) => {
      categoryColors[category.name] = colors[index % colors.length];
    });
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const category = item.product.category;
        if (salesData[category]) {
          salesData[category].totalSales += item.totalprice;
          salesData[category].count += 1;
        } else {
          salesData[category] = { totalSales: item.totalprice, count: 1, color: categoryColors[category] };
        }
        totalSales += item.totalprice;
      });
    });
    Object.keys(salesData).forEach((category) => {
      salesData[category].ratio = ((salesData[category].totalSales / totalSales) * 100).toFixed(2);
    });
    return salesData;
  } catch (err) {
    console.log(err);
    return {};
  }
};


module.exports.get_Linegraph = async(req,res)=>{
  try {
    const orders = await Order.find().select('payment created').exec();
    const data = {
      cod: Array(7).fill(0),
      paypal: Array(7).fill(0)
    };
    orders.forEach(order => {
      const day = order.created.getDay();
      if (order.payment === 'cod') {
        data.cod[day]++;
      } else if (order.payment === 'paypal') {
        data.paypal[day]++;
      }
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}


// Route to display category-wise sales report
module.exports.getCategorySales = async (req, res) => {
  const salesData = await getCategorySales();
  res.json(salesData);
};


// Route to display category-wise sales report
module.exports.get_adminhome = async (req, res) => {

  const categories = Category.find();
  res.render("admin/adminhome", { categories });
};


module.exports.get_addproduct = (req, res) => {

  Category.find({}, (err, categories) => {
    if (err) {
      console.log(err);
    } else {
      res.render("admin/addproduct", { categories: categories });
    }
  })
}

module.exports.post_addproduct = async (req, res) => {

  const images = req.files.map(file => file.originalname)
  const product = await new Product({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    stock: req.body.stock,
    images: images,
    size: req.body.size
  });


  await product.save((err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      res.redirect('allproduct');
    }
  });
}



module.exports.get_catogary = (req, res) => {

  Category.find()
    .then(categories => {
      res.render('admin/allcatogary', { categories: categories });
    })
    .catch(err => {
      console.log(err);
    });

}


module.exports.get_addcatogory = (req, res) => {

  res.render('admin/addcatogry');
}




module.exports.Post_addcatogary = async (req, res) => {
  const image = req.file.originalname;

  const category = new Category({
    name: req.body.name,
    image: image,
  });
  try {
    await category.save();
     res.status(200).json()
  } catch (err) {
    console.log(err);
    res.status(500).json({error: "Error saving category"})
  }
};


module.exports.get_allproduct = async (req, res) => {
  const page = req.query.page || 1;
  const limit = 5;
  try {
    const count = await Product.countDocuments();
    const totalPages = Math.ceil(count / limit);
    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(limit);

    if (req.query.page) {
      res.status(200).json({
        products: products,
        totalPages: totalPages,
        currentPage: page,
      });
    } else {
      res.render('admin/allproduct', {
        products: products,
        totalPages: totalPages,
        currentPage: page,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Server error' });
  }
};




module.exports.get_banner = (req, res) => {

  Banner.find().then(Banners => {
    res.render('admin/banner', { Banner: Banners })
  }).catch(err => {
    console.log(err)
  })

}

module.exports.get_addbanner = (req, res) => {

  res.render("admin/addbanner",{error : req.flash('error')} )

}


module.exports.post_addbanner = async (req, res) => {

  const image = req.file.originalname;

  const banner = new Banner({
    title: req.body.name,
    image: image,
    description: req.body.description
  });
  try {
    await banner.save();
    res.redirect('banner');
  } catch (err) {
    req.flash('error', 'Invalid Data Please fill all the field');
    res.redirect('/addbanner')
  }

}




module.exports.get_userdetails = (req, res) => {

  User.find().then(users => {
    res.render("admin/adminuserview", { users: users })

  }).catch(err => {
    console.log(err)
  })
}

module.exports.post_updateuser = (req, res) => {

  User.findOneAndUpdate(
    { _id: req.body.userId },
    { $set: { status: req.body.status } },
    { new: true }
  )
    .then(user => {
      res.status(200).json({ message: "User status updated successfully" });
    })
    .catch(error => {
      res.status(500).json({ error: error });
    });
}

module.exports.get_addcoupen = (req, res) => {

  res.render("admin/addcoupen")

}


module.exports.post_addcoupen = (req, res) => {

  const coupon = new Coupen(req.body);
  coupon.save().then(() => {
    res.redirect("/admin/coupon");
  });
}


module.exports.get_coupenlist = async (req, res) => {

  const coupen = await Coupen.find()

  res.render("admin/coupenpage", { coupen })

}



module.exports.delete_coupon = async (req, res) => {
  const id = req.params.id;
  await Coupen.findByIdAndDelete({ _id: id });
  res.redirect("/admin/coupon");
};


module.exports.Edit_coupon = async (req, res) => {
  const id = req.params.id;

  try {
    const {
      code,
      available,
      status,
      maxdiscountAmount,
      mincartAmout,
      expiredAfter,
    } = req.body;

    const updatedCoupon = await Coupen.findOneAndUpdate(
      { _id: id },
      {
        code,
        available,
        status,
        maxdiscountAmount,
        mincartAmout,
        expiredAfter,
      },
      { new: true }
    );

    res.redirect("back");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


module.exports.get_productview = async (req, res) => {
  const id = req.params.id;

  try {
    const product = await Product.findById(id).populate("images");
    res.render("admin/viewproduct", { product });
  } catch (err) {
    console.log(err);
  }
}



module.exports.deleteProduct = (req, res) => {
  const id = req.params.id;

  Product
    .findByIdAndDelete({ _id: id })
    .then((doc) => {

      res.redirect("/admin/allproduct");
    })
    .catch((err) => {
      console.log(err);
    });
};


module.exports.editproduct = async (req, res) => {

  const productid = req.params.id;

  const categories = await Category.find();

  Product.findOne({ _id: productid }).populate("images").then((product) => {

    res.render("admin/editproduct", { categories, product });

  }).catch((err) => {
    console.log(err);
  })

}

module.exports.Post_editproduct = async (req, res) => {



  const { productid, name, category, size, stock, price, description } = req.body;

  

  try {
    const updatedProduct = await Product.findByIdAndUpdate(productid, {
      name,
      category,
      size,
      stock,
      price,
      description
    });
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

module.exports.deleteCatogary = (req, res) => {


  const catogaryId = req.params.id;

  Category.findByIdAndDelete({ _id: catogaryId })
    .then((doc) => {
      res.redirect("/admin/allcatogary");
    }).catch((err) => {
      console.log(err);
    })

}

module.exports.userorders = (req, res) => {
  Order.find({})
    .populate('user', 'name email')
    .populate('items.product')
    .exec((err, orders) => {
      if (err) {
        console.log(err);
      } else {
        res.render('admin/order', { orders });
      }
    });

};

module.exports.post_updateOrder = (req, res) => {

  Order.findOneAndUpdate({
    _id: req.body.OrderId
  },
    { $set: { status: req.body.status } },
    { new: true })
    .then(order => {

      res.status(200).json({ message: "Order status updated successfully" });

    }).catch(error => {
      res.status(500).json({ error: error });
    })
}

module.exports.bannerDelete = async (req, res) => {
  const id = req.params.id;
  await Banner
    .findByIdAndDelete({ _id: id })
    .then((doc) => {
     
      res.redirect("/admin/banner");
    })
    .catch((err) => console.log(err));
};


module.exports.get_orderdetail = async (req,res)=>{

  try {
  
    const orderId = req.params.orderId;

    
    const order = await Order.findOne({ _id: orderId }).populate("items.product")


  const addressid = order.address

    let coupen;

    if (order.coupon !== 'Not Used') {
      coupen = await Coupen.findOne({ code: order.coupon });
    } else {
      coupen = order.coupon;
    }
    
    const orderAddress = await Address.findOne({ user: order.user });

    const index = await orderAddress.address.findIndex(
      (obj) => obj._id == addressid
    );
    const finalAddress = orderAddress.address[index];
  

    res.render('admin/singleorder', {order,Coupen ,finalAddress });
  } catch (error) {

    console.log(error);
   
  }

}


module.exports.delete_order = async (req,res)=>{

  try {
    const orderId = req.params.orderId;

    // Get the cancelled order
    const cancelledOrder = await Order.findOne({ _id: orderId }).populate('items.product');


    // Increment the product stock for each product in the cancelled order
    for (const item of cancelledOrder.items) {
      const product = item.product;
      const quantity = item.quantity;
      product.stock += quantity;
      await product.save();
    }

    // Delete the cancelled order
    await Order.deleteOne({  _id: orderId  });

    res.redirect('/admin/adminorder');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error cancelling order');
  }
}



module.exports.get_logout = (req, res) => {

  req.session.destroy()
  res.redirect('/admin')

}