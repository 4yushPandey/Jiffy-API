const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    liker: {
        type: String
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Post'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Like = mongoose.model('Like', LikeSchema);

module.exports = Like;
