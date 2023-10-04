const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    postPicture: {
        type: String,

    },
    caption: {
        type: String,
        trim: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    uploader: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

PostSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'postId'
});

PostSchema.virtual('like', {
    ref: 'Like',
    localField: '_id',
    foreignField: 'postId'
});


PostSchema.set('toObject', { virtuals: true });
PostSchema.set('toJSON', { virtuals: true });

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
