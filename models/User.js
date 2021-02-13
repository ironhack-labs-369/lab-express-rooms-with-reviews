const { Schema, model } = require('mongoose');

const userSchema = new Schema(
    {
        email: String,
        password: String,
        username: String,

        // google login - optional
        googleID: String,
        picture: String,
    },
    {
        timestamps: true,
    }
);
const User = model('User', userSchema);

module.exports = User;
