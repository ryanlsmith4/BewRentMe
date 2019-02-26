require('dotenv').config()

const methodOverride = require('method-override');
var cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const express = require('express');
const app = express();
var exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true}));
const Rental = require('./models/rental');
const User = require('./models/landlord')
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI ||'mongodb://localhost/rent-me', {
    useNewUrlParser: true });
var router = express.Router();
app.locals.PUBLIC_STRIPE_API_KEY = process.env.PUBLIC_STRIPE_API_KEY

app.use(cookieParser());

app.use(methodOverride('_method'));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

module.exports = app;

const auth = require('./controllers/auth');
const listings = require('./controllers/routes');

app.use('/user', auth);
// app.use('/listings', listings);
app.use('/', listings);


app.listen(port, () => {
    console.log('App Listening on port 3000');
});
