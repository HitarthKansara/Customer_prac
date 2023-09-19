const mongoose = require('mongoose');

function connectDb() {
    mongoose.connect('mongodb://127.0.0.1:27017/sublime-prac')
        .then(() => console.log('Connected to database'))   
        .catch(err => console.error('Error(database)', err));
}

module.exports = { connectDb };