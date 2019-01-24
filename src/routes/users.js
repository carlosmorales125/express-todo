import express from 'express';
import Joi from 'joi';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import TodoList from '../models/TodoList';
import config from '../config';

const router = express.Router();

router.post('/createuser', (req, res) => {
    const schema = {
        name: Joi.string().min(2).required(),
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    };

    Joi.validate(req.body, schema)
        .then(() => {
            // Grab variables from request body
            const { name, email, password } = req.body;

            // Make sure no other users have entered this email;
            User.findOne({email: email})
                .then(user => {
                if (user) {
                    res.status(409).send('Email already exists');
                } else {
                    // init new user
                    let newUser = new User({
                        name: name,
                        email: email,
                        password: password,
                        token: 'fakefornow'
                    });
                    newUser
                        .save()
                        .then(user => {
                            //create the user's first todo list
                            let newTodoList = new TodoList({
                                userId: user._id
                            });
                            newTodoList
                                .save()
                                .then(() => {
                                    res.sendStatus(200);
                                })
                                .catch(err => {
                                    res.status(500).send(err);
                                });
                        })
                        .catch(err => {
                            res.status(500).send(err);
                        });
                }
            });
        })
        .catch(err => {
            res.status(400).send(err);
        });
});

router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (err, user) => {
        if (err || !user) {
            return res.status(400).send(err);
        }
        req.login(user, {session: false}, err => {
            if (err) {
                res.status(500).send(err);
            }

            const token = jwt.sign(user.toJSON(), config.secret, {
                expiresIn: 86400
            });

            const _id = user.get('_id');

            User.updateOne({_id: _id}, { $set: { token: token } })
                .then(() => {
                    // everything but the password
                    let userObject = {
                        _id: _id,
                        name: user.get('name'),
                        email: user.get('email'),
                        token: token
                    };

                    return res.json(userObject);
                })
                .catch(err => {
                    res.status(500).send(err);
                });
        });
    })(req, res);
});

router.post('/changename', passport.authenticate('jwt', { session: false }), (req, res) => {
    const schema = {
        description: Joi.string().min(2).required(),
        id: Joi.string().min(6).required()
    };

    Joi.validate(req.body, schema)
        .then(() => {
            const { name, id } = req.body;

            User.updateOne({
                _id: id
                },
                {
                    $set: { name: name }
                })
                .then(() => {
                    User.findOne({ _id: id })
                        .then(user => {
                            // everything but the password
                            let userObject = {
                                _id: user.get('_id'),
                                name: user.get('name'),
                                email: user.get('email'),
                                token: user.get('token')
                            };
                            res.status(200).json(userObject);
                        })
                        .catch(err => {
                            res.status(500).send(err);
                        });
                })
                .catch(err => {
                    res.status(500).send(err);
                });
        })
        .catch(err => {
            res.status(400).send(err);
        });
});

export { router as usersRouter };
