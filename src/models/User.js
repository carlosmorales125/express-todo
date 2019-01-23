import mongoose from 'mongoose';
import MongooseBcrypt from 'mongoose-bcrypt';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    email: String,
    token: String
});

UserSchema.plugin(MongooseBcrypt);

const User = mongoose.model('User', UserSchema);

export default User;
