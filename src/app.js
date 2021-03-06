import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import config from './config';

import { usersRouter } from './routes/users';
import { todoRouter } from './routes/todo';

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Passport JS Strategies
import './passport';

// Enable CORS
app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true
}));

// Connect to MongoDB hosted on mlab using Mongoose
const mongoose = require('mongoose');
mongoose.connect(config.db);

app.use('/api/users', usersRouter);
app.use('/api/todo', todoRouter);

export default app;
