const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const Schema = mongoose.Schema
const SALT_ROUNDS = 12

const User = new Schema(
    {
        email: { type: String, required: true },
        password: { type: String, required: true },
    },
    { timestamps: true },
)

User.pre('save', function(next) {
    if (this.isModified('password')) {
        const salt = bcrypt.genSaltSync(SALT_ROUNDS)
        this.password = bcrypt.hashSync(this.password, salt)
    }
    next()
})

User.methods.validatePassword = function(candidate) {
    return bcrypt.compareSync(candidate, this.password)
}

module.exports = mongoose.model('user', User, 'users')