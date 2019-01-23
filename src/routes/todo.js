import express from 'express';
import Joi from 'joi';
import passport from 'passport';
import TodoList from '../models/TodoList';

const router = express.Router();


router.get('/todolist/:userId', passport.authenticate('jwt', { session: false }), (req, res) => {
    const schema = {
        userId: Joi.string().min(3).required()
    };

    Joi.validate({userId: req.params.userId}, schema)
        .then(() => {
            const { userId } = req.params;

            TodoList.find({ userId: userId })
                .then(list => {
                    res.json({
                        list: list
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

router.put('/addtask', passport.authenticate('jwt', { session: false }), (req, res) => {
    const schema = {
        userId: Joi.string().required(),
        description: Joi.string().min(3).required()
    };

    Joi.validate(req.body, schema)
        .then(() => {
            const userId = req.body.userId;
            const description = req.body.description;

            const newTask = {
                description: description,
                done: false
            };

            TodoList.updateOne({ userId: userId }, { $push: { todoList: newTask } })
                .then(() => {
                    res.sendStatus(200);
                })
                .catch(err => {
                    res.status(500).send(err);
                });
        })
        .catch(err => {
            res.status(400).send(err);
        });
});

router.put('/edittodo', passport.authenticate('jwt', { session: false }), (req, res) => {
    const schema = {
        userId: Joi.string().required(),
        id: Joi.string().required(),
        description: Joi.string().min(3).required()
    };

    Joi.validate(req.body, schema)
        .then(() => {
            const userId = req.body.userId;
            const id = req.body.id;
            const description = req.body.description;

            TodoList.updateOne({
                    userId: userId,
                    'todoList._id': id
                },
                {
                    $set: { 'todoList.$.description': description }
                })
                .then(() => {
                    res.sendStatus(200);
                })
                .catch(err => {
                    res.status(500).send(err);
                });
        })
        .catch(err => {
            res.status(400).send(err);
        });
});

router.put('/completeorrestoretask', passport.authenticate('jwt', { session: false }), (req, res) => {
    const schema = {
        userId: Joi.string().required(),
        id: Joi.string().required(),
        done: Joi.boolean().required()
    };

    Joi.validate(req.body, schema)
        .then(() => {
            const userId = req.body.userId;
            const id = req.body.id;
            const done = req.body.done;

            TodoList.updateOne({
                    userId: userId,
                    'todoList._id': id
                },
                {
                    $set: { 'todoList.$.done': done }
                })
                .then(() => {
                    res.sendStatus(200);
                })
                .catch(err => {
                    res.status(500).send(err);
                });
        })
        .catch(err => {
            res.status(400).send(err);
        });
});

router.delete('/deletetask/:id/:userId', passport.authenticate('jwt', { session: false }), (req, res) => {
    const schema = {
        userId: Joi.string().required(),
        id: Joi.string().required()
    };

    Joi.validate(req.params, schema)
        .then(() => {
            const { userId, id } = req.body;

            TodoList.updateOne({
                    userId: userId
                },
                {
                    $pull: { todoList: { '_id': id } }
                })
                .then(() => {
                    res.sendStatus(200);
                })
                .catch(err => {
                    res.status(500).send(err);
                });
        })
        .catch(err => {
            res.status(400).send(err);
        });
});

export { router as todoRouter };
