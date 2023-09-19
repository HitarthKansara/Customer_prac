const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    first_name: { type: String },
    last_name: { type: String },
    email: {
        type: String
    },
    company: { type: String },
    city: {
        type: String
    },
});

const Customer = mongoose.model('customer', customerSchema);
module.exports = Customer;