const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const prostorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/productupload/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const bannerstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/banner/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});






module.exports.uploadmulti = multer({ storage: prostorage })


module.exports.upload = multer({ storage: storage });

module.exports.bannerupload = multer({storage : bannerstorage})