var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var todoRouter = require('./routes/todo');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Enable CORS
app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true
}));

// Connect to MongoDB hosted on mlab using Mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://todolistdbuser:7LPeQGik5F7JueN@ds149613.mlab.com:49613/express-todo-list');

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/todo', todoRouter);

module.exports = app;
