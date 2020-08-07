const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;


const userSchema = new Schema({
  username: {type: String, required: true},
  email: {type: String, required: true},
  firstName: {type: String},
  lastName: {type: String},
  password: {type: String, required: true}
});

userSchema.pre('save', function(next){
  if ( this.isModified('password') ) {
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    this.password = bcrypt.hashSync(this.password, salt);
  }
  next();
});

userSchema.methods.validatePassword = function (candidate) {
  return bcrypt.compareSync(candidate, this.password);
};

module.exports = model('User', userSchema, 'users');