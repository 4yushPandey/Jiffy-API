const express = require('express');
const app = express();

require('dotenv').config();
require('./db/database');

const cors = require('cors');
const port = process.env.PORT;

const userRoutes = require('./router/user');
const PostRoutes = require('./router/post');


app.use(express.json( ));
app.use(require('body-parser').urlencoded({ extended: false }));

app.use(cors());
app.use(userRoutes);
app.use(PostRoutes);
app.use('/images', express.static('./images/UserProfiles'));
app.use('/postimage', express.static('./images/postPictures'));
app.listen(port, () => {
    console.log('Server is up on ' + port);
});
