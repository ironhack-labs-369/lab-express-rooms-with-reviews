const { Schema, model } = require('mongoose');

const userSchema = new Schema(
    {
        email: String,
        password: String,
        username: String,
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },

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
