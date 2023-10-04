const express     = require('express');
const router      = new express.Router();
const User        = require('../models/user');
const {ObjectID}  = require('mongodb');
const path = require('path');
const multer  = require('multer');

const authenticate  = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: "./images/UserProfiles",
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
    storage: storage,
    fileFilter: imageFileFilter
});

router.post('/users',upload.single('profilePicture'), async (req,res) => {
    const user = new User({
        ...req.body,
        profilePicture: req.file.filename});

    try{
        const token = await user.newAuthToken();
        res.status(201).send({user, token})
    }catch(e){
        res.status(400).send(e)
    }
});

router.get('/users/me', authenticate ,async (req,res)=> {
    res.send(req.user)
});

//follow other users
router.post('/users/:id/follow', authenticate, async (req, res) => {
    const _id = req.params.id;
    const userid = req.user._id;

    if (!ObjectID.isValid(_id)) {
        return res.status(404).send();
    }

    if (!ObjectID.isValid(userid)) {
        return res.status(404).send();
    }

    try {
        User.findByIdAndUpdate(userid,
            {$push: {following: _id}},
            {safe: true, upsert: true},
            function(err, doc) {
                if(err){
                    console.log(err);
                }else{
                    User.findByIdAndUpdate(_id,
                        {$push: {followers: userid}},
                        {safe: true, upsert: true},
                        function(err, doc) {
                            if(err){
                                console.log(err);
                            }});
                    return res.status(200).send("User Followed")
                }
            })
       }
    catch (error) {
        res.status(400).send(error)
    }
});

router.patch('/users/me',authenticate ,async (req,res) => {
    const updates  = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "description"];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    const _id =  req.user._id;

    if(!isValidOperation){
        res.status(400).send({error:'Invalid request'})
    }

    if (!ObjectID.isValid(_id)) {
        return res.status(404).send();
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch (error) {
        res.status(400).send()
    }

});
router.delete('/users/me', authenticate, async (req,res) => {
    console.log(req.user);
    if (!ObjectID.isValid(req.user._id)) {
        return res.status(404).send();
    }
    try {
        await req.user.remove();
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
});

router.get('/search/:user', async (req, res) => {
    const searchName = req.params.user;
    console.log(searchName);
    console.log(searchName);
    try {
    const search = await User.find({$text: {$search: searchName}});
    res.send(search);
    } catch (error) {
        res.status(400).send(error)
    }
});


router.post('/users/login', async (req, res) => {
    console.log(req.body.email);
    try {
        const user  = await User.checkValidCredentials(req.body.email, req.body.password);
        const token = await user.newAuthToken();
        res.send({ user, token})
    } catch (error) {
        res.status(400).send(error)
    }
});


router.post('/users/logout', authenticate, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) =>{
            return token.token !== req.token
        });
        await req.user.save();
        res.send()
    } catch (error) {
        res.status(500).send()
    }
});


router.post('/users/logoutall', authenticate, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send()
    } catch (error) {
        res.status(500).send()
    }
});

module.exports = router;
