const { Schema, model } = require('mongoose');

const roomSchema = new Schema({
    name: String,
    description: String,
    imageUrl: String,
    // owner: { type: Schema.Types.ObjectId, ref: 'User' },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    publicId: String,
});
const Room = model('Room', roomSchema);

module.exports = Room;
