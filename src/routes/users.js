import express from 'express';
import Joi from 'joi';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import TodoList from '../models/TodoList';
import config from '../config';
import { confirmEmail }from '../helpers';

const router = express.Router();

router.post('/createuser', async function(req, res) {
    try {
        const schema = {
            name: Joi.string().min(2).required(),
            email: Joi.string().email({ minDomainAtoms: 2 }).required(),
            password: Joi.string().min(6).required(),
            confirmPassword: Joi.string().valid(Joi.ref('password')).required()
        };

        await Joi.validate(req.body, schema);

        const { name, email, password } = req.body;

        const currentUser = await User.findOne({email: email});

        if (currentUser) return res.status(409).send('Email already exists');

        // Init new user
        let newUser = new User({
            name: name,
            email: email,
            password: password,
            confirmed: false,
            token: 'fakefornow'
        });

        const newlyCreatedUser = await newUser.save();

        // Send confirm email to user's new email address
        const token = jwt.sign(newlyCreatedUser.toJSON(), config.emailSecret, {
            expiresIn: 86400
        });
        confirmEmail(email, token);

        // Create the user's first todo list
        let newTodoList = new TodoList({
            userId: newlyCreatedUser._id
        });

        await newTodoList.save();

        res.sendStatus(200);
    } catch(e) {
        res.status(400).send(e);
    }
});

router.get('/confirmemail/:token', async function(req, res) {
    try {
        const schema = {
            token: Joi.string().required(),
        };

        await Joi.validate(req.params, schema);

        // confirm token
        const { token } = req.params;

        const { _id } = jwt.verify(token, config.emailSecret);
        console.log('id is: ', _id);

        const result = await User.updateOne({_id: _id}, { $set: { confirmed: true } });

        if (result.nModified !== 1) return res.status(400).send('Unable to confirm token');

        res.redirect('http://localhost:8080/login');
    } catch(e) {
        res.status(400).send(e);
    }
});

router.post('/login', async function(req, res) {
    try {
        passport.authenticate('local', { session: false }, (e, user) => {
            if (e || !user) return res.status(400).send(e);

            if (!user.confirmed) return res.status(400).send('Please confirm your email address.');

            req.login(user, {session: false}, async function(e) {
                if (e) return res.status(500).send(e);

                const token = jwt.sign(user.toJSON(), config.secret, {
                    expiresIn: 86400
                });

                const _id = user.get('_id');

                await User.updateOne({_id: _id}, { $set: { token: token } });

                let userObject = {
                    _id: _id,
                    name: user.get('name'),
                    email: user.get('email'),
                    token: token
                };

                return res.json(userObject);
            });
        })(req, res);
    } catch(e) {
        res.status(400).send(e);
    }
});

router.post('/changename', passport.authenticate('jwt', { session: false }), async function(req, res) {
    try {
        const schema = {
            description: Joi.string().min(2).required(),
            id: Joi.string().min(6).required()
        };

        await Joi.validate(req.body, schema);

        const { description, id } = req.body;

        const updatedUserResult = await User.updateOne({ _id: id }, { $set: { name: description } });

        if (updatedUserResult.nModified !== 1) return res.status(500).send('Unable to modify user.');

        const updatedUser = await User.findOne({ _id: id });

        let userObject = {
            _id: updatedUser.get('_id'),
            name: updatedUser.get('name'),
            email: updatedUser.get('email'),
            token: updatedUser.get('token')
        };

        res.status(200).json(userObject);
    } catch(e) {
        res.status(400).send(e);
    }
});

export { router as usersRouter };
