import express from 'express';
import Joi from 'joi';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import TodoList from '../models/TodoList';
import config from '../config';

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
            token: 'fakefornow'
        });

        const newlyCreatedUser = await newUser.save();

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

router.post('/login', async function(req, res) {
    try {
        passport.authenticate('local', { session: false }, (e, user) => {
            if (e || !user) return res.status(400).send(e);

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
