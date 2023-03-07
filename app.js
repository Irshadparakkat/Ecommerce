const express = require("express");
const userRouter = require("./router/user");
const adminRouter = require("./router/admin");
const bodyParser = require("body-parser");
const session = require('express-session');
const flash = require('connect-flash');
const nocache = require('nocache');
const path = require("path");

require('./db/mongoose');

const app = express();

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Cache control middleware for user and admin
const cacheControl = (req, res, next) => {
  res.setHeader('Cache-Control', 'private, max-age=1'); // Cache for one hour
  next();
};

app.use('/', cacheControl, userRouter);
app.use('/admin', cacheControl, adminRouter);

app.use(nocache());

// View engine 
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
