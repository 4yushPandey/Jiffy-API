const express = require('express');
const router = new express.Router();
const Post = require('../models/post');
const Like = require('../models/like');
const Comment = require('../models/comment');
const {ObjectID} = require('mongodb');
const authenticate = require('../middleware/auth');
const path = require('path');
const multer  = require('multer');

const diskstorage = multer.diskStorage({
    destination: "./images/postPictures",
    filename: (req, file, callback) => {
        const ext = path.extname(file.originalname);
        callback(null, file.fieldname + "-" + Date.now() + ext);
    }
});

const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error("You can upload only image files!"), false);
    } else {
        cb(null, true);
    }
};

const upload = multer({
    storage: diskstorage,
    fileFilter: imageFileFilter
});


router.post('/posts',upload.single('postPicture'),authenticate, async (req, res) => {
    const post = new Post({
        ...req.body,
        postPicture: req.file.filename,
        author: req.user._id,
        uploader: req.user.name,
    });
    try {
        await post.save();
        res.status(201).send(post)
    } catch (error) {
        res.status(400).send(error)
    }
});

//get all posts
router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find({}).sort({ createdAt: -1 });
        res.send(posts)
    } catch (error) {
        res.status(500).send()
    }
});

//get logged in users posts
router.get('/myposts',authenticate ,async(req, res) => {
    try {
        const post = await Post.find({author: req.user._id});
        res.send(post);
    }
    catch (e) {
        res.status(e).send()
    }
});

//get post by id
router.get('/posts/:id', async (req, res) => {
    const _id = req.params.id;
    if (!ObjectID.isValid(_id)) {
        return res.status(404).send();
    }
    try {
        const post = await Post.findOne({_id});
        if (!post) {
            return res.status(404).send()
        }
        res.send(post);
    } catch (error) {
        res.status(500).send()
    }
});

//comment on a post
router.post('/posts/:id/comment', authenticate, async (req, res) => {
    const _id = req.params.id;
    const userid = req.user._id;

    if (!ObjectID.isValid(_id)) {
        return res.status(404).send();
    }

    if (!ObjectID.isValid(userid)) {
        return res.status(404).send();
    }

    const comment = new Comment({
        ...req.body,
        commentor: req.user.name,
        author: userid,
        postId: _id
    });
    try {
        await comment.save();
        res.status(201).send(comment)
    } catch (error) {
        res.status(400).send(error)
    }
});

//like on a post
router.post('/posts/:id/like', authenticate, async (req, res) => {
    const _id = req.params.id;
    const userid = req.user._id;

    if (!ObjectID.isValid(_id)) {
        return res.status(404).send();
    }

    if (!ObjectID.isValid(userid)) {
        return res.status(404).send();
    }

    const like = new Like({
        author: userid,
        liker: req.user.name,
        postId: _id
    });
    try {
        await like.save();
        res.status(201).send(like)
    } catch (error) {
        res.status(400).send(error)
    }
});


//get all the comments related to the post
router.get('/posts/:id/comment', async (req, res) => {
    try {
        const post = await Post.findOne({_id: req.params.id});
        await post.populate('comments').execPopulate();
        res.send(post.comments)
    } catch (error) {
        res.status(500).send()
    }
});


//get all the likes related to the post
router.get('/posts/:id/like', async (req, res) => {
    try {
        const post = await Post.findOne({_id: req.params.id});
        await post.populate('like').execPopulate();
        res.send(post.like)
    } catch (error) {
        res.status(500).send()
    }
});

router.patch('/posts/:id', authenticate, async (req, res) => {
    const _id = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = ["caption"];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        res.status(400).send({error: 'Invalid updates'})
    }
    if (!ObjectID.isValid(_id)) {
        res.status(404).send();
    }
    try {
        const post = await Post.findOne({_id: req.params.id, author: req.user._id});

        if (!post) {
            res.status(404).send();
        }

        updates.forEach((update) => post[update] = req.body[update]);
        await post.save();

        res.send(post);
    } catch (error) {
        res.status(400).send();
    }
});

router.delete('/posts/:id', authenticate, async (req, res) => {
    const _id = req.params.id;
    if (!ObjectID.isValid(_id)) {
        return res.status(404).send();
    }
    try {
        const deletepost = await Post.findOneAndDelete({_id: _id, author: req.user._id});
        if (!deletepost) {
            return res.status(404).send();
        }
        res.send(deletepost)
    } catch (error) {
        res.status(500).send()
    }
});

module.exports = router;

