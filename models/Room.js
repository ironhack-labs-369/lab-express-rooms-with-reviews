const { Schema, model } = require('mongoose');

const roomSchema = new Schema({
    name: String,
    description: String,
    imageUrl: String,
    // owner: { type: Schema.Types.ObjectId, ref: 'User' },
    reviews: [
        {
            user: String,
            comments: String,
        },
    ],
    publicId: String,
});
const Room = model('Room', roomSchema);

module.exports = Room;
