const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
const passport = require('passport');
const { loginCheck } = require('./auth/passport');
const { SloginCheck }= require('./auth/Spassport');
const { SadminloginCheck }= require('./auth/Sadmin_passport');
loginCheck(passport);
SloginCheck(passport);
SadminloginCheck(passport);
const session = require('express-session');
const methodOverride = require('method-override');
const flash = require('express-flash');
app.use(session({
    secret: 'oneboy',
    saveUninitialized: true,
    resave: true
}));
app.use(flash());

//mongoDB connection
const database = process.env.MONGOLAB_URI;
mongoose.set("strictQuery", true);
mongoose.connect(database, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('Database Connected...'))
    .catch(err => console.log(err));

//bodyparsing
app.use(express.urlencoded({ extended: false }));

//session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(methodOverride('_method'));

//engine
app.set('view engine', 'ejs');

//public folder
app.use(express.static(__dirname + '/public'));

//views
app.set('views', path.join(__dirname, 'views'));

app.use(passport.initialize());
app.use(passport.session());

//routes
app.use('/', require('./routes/router'));

//port connection
const PORT = process.env.PORT || 1618;
app.listen(PORT, console.log(`Listening to port ${PORT}...`));