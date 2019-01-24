import express from 'express';
import Joi from 'joi';
import passport from 'passport';
import TodoList from '../models/TodoList';
const router = express.Router();

router.get('/todolist/:userId', passport.authenticate('jwt', { session: false }), async function(req, res) {
    try {
        const schema = {
            userId: Joi.string().min(3).required()
        };

        await Joi.validate({userId: req.params.userId}, schema);

        const { userId } = req.params;

        const list = await TodoList.find({ userId: userId });

        res.json({ list });
    } catch(e) {
        res.status(400).send(e);
    }
});

router.put('/addtask', passport.authenticate('jwt', { session: false }), async function(req, res) {
    try {
        const schema = {
            userId: Joi.string().required(),
            description: Joi.string().min(3).required()
        };

        await Joi.validate(req.body, schema);

        const { userId, description } = req.body;

        const newTask = {
            description: description,
            done: false
        };

        await TodoList.updateOne({ userId: userId }, { $push: { todoList: newTask } });

        res.sendStatus(200);
    } catch(e) {
        res.status(400).send(e);
    }
});

router.put('/edittodo', passport.authenticate('jwt', { session: false }), async function(req, res) {
    try {
        const schema = {
            userId: Joi.string().required(),
            id: Joi.string().required(),
            description: Joi.string().min(3).required()
        };

        await Joi.validate(req.body, schema);

        const { userId, id, description } = req.body;

        await TodoList.updateOne({ userId: userId, 'todoList._id': id},
            { $set: { 'todoList.$.description': description } });

        res.sendStatus(200);

    } catch(e) {
        res.status(400).send(e);
    }
});

router.put('/completeorrestoretask', passport.authenticate('jwt', { session: false }), async function(req, res) {
    try {
        const schema = {
            userId: Joi.string().required(),
            id: Joi.string().required(),
            done: Joi.boolean().required()
        };

        await Joi.validate(req.body, schema);

        const { userId, id, done } = req.body;

        await TodoList.updateOne({ userId: userId, 'todoList._id': id },
            { $set: { 'todoList.$.done': done } });

        res.sendStatus(200);
    } catch(e) {
        res.status(400).send(e);
    }
});

router.delete('/deletetask/:id/:userId', passport.authenticate('jwt', { session: false }), async function(req, res) {
    try {
        const schema = {
            userId: Joi.string().required(),
            id: Joi.string().required()
        };

        await Joi.validate(req.params, schema);

        const { userId, id } = req.params;

        await TodoList.updateOne({ userId: userId }, { $pull: { todoList: { '_id': id } } });

        res.sendStatus(200);
    } catch(e) {
        res.status(400).send(e);
    }
});

export { router as todoRouter };
