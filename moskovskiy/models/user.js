const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const SALT_ROUNDS = 12;


const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    surname: {type: String, required: true},
    password: {type: String}
});

userSchema.pre('save', function(next) {
    if (this.isModified('password')) {
        this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(SALT_ROUNDS));
    }
    next();
})

userSchema.methods.validatePassword = function (candidate) {
    return bcrypt.compareSync(candidate, this.password)
}

module.exports = mongoose.model('User', userSchema, 'users');
