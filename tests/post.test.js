const Post        = require('../src/models/post');

const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:Coolayush1@cluster0-exkjk.mongodb.net/jiffy_test?retryWrites=true&w=majority'

beforeAll(async () => {
    await mongoose.connect(url, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,

    })
})

afterAll(async () => {
    await mongoose.connection.close();
})


describe("Post Schema Tests", () => {
    //add new post test
    it('Testing if creating new post works', () => {
        const post = {
            'caption': 'Test Caption',
            'postPicture': 'profilePicture-150123123.png',
            'uploader': 'Post Test',
            'author': '5e47d595067c42471ff42593'
        };
        return Post.create(post).then((post_test) => {
            expect(post_test.caption).toEqual('Test Caption')
        });
    })

    //testing post caption update
    it('To test updating posts caption', async() => {
        return Post.findOneAndUpdate({_id: Object('5e47d8fea7e86f4c1ca6d04c')}, {$set: {caption: 'Updated Caption'}})
            .then((postDoc) => {
                expect(postDoc.caption).toEqual('Updated Caption')
            })
    })

    //delete post
    it('Delete post testing', async () => {
        const status = await Post.deleteMany();
        expect(status.ok).toBe(1);
    });

})
