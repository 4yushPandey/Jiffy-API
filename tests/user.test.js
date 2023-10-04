const User        = require('../src/models/user');
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


describe("Users' Tests", () => {
    //add new user test
    it('Testing if creating new user works', () => {
        const user = {
            'name': 'Test',
            'email': 'testing123@gmail.com',
            'profilePicture': 'profilePicture-150123123.png',
            'description': 'This is user create testing',
            'password': '12345678'
        };

        return User.create(user).then((user_test) => {
            expect(user_test.name).toEqual('Test')
        });
    })

    //testing user update
    it('To test updating users information', async() => {
        return User.findOneAndUpdate({_id: Object('5e47d595067c42471ff42593')}, {$set: {name: 'Updated Name'}})
            .then((userDoc) => {
                expect(userDoc.name).toEqual('Updated Name')
            })
    })

    //delete users
    it('Delete user testing', async () => {
        const status = await User.deleteMany();
        expect(status.ok).toBe(1);
    });

})
