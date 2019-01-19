var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TodoSchema = new Schema({
    description: String,
    done: Boolean
});

module.exports = TodoSchema;
