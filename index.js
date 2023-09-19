const express = require('express');
const app = express();


const port = 8088;

app.use(express.json());

require('./database').connectDb();
const Customer = require('./models/customer.model');

async function pushDatainDb() {
    try {

        const fs = require('fs');

        let customerJSONData = fs.readFile('./MOCK_DATA.json', { encoding: 'utf-8' }, async (err, data) => {

            if (err) {
                console.log('err--->', err);
                return
            }

            console.log('data--->', data.length);
            let insertedIds = await Customer.insertMany(JSON.parse(data));
            console.log('insertedIds--->', insertedIds);
        });

    } catch (err) {
        console.log('Error(pushDatainDb):', err);
        console.error(err);
    }

}

// pushDatainDb();

// 2. List API with search by first_name, last_name, and city with pagination
app.get('/api/customers', async (req, res) => {
    try {
        let { search, page, limit } = req.query;

        page = +page ?? 1;
        limit = +limit ?? 10;
        search = search ?? '';

        let customerData = await Customer.find({
            $or: [
                { first_name: new RegExp(search, 'i') },
                { last_name: new RegExp(search, 'i') },
                { city: new RegExp(search, 'i') },
            ]
        }, 'first_name last_name city')
            .skip((page - 1) * limit)
            .limit(limit);


        res.status(200).send({ data: customerData, message: 'Customer list fetched successfully' });

    } catch (err) {
        res.status(500).send({ message: 'Server is not responding', error: err });
    }
});

// 3. API to get single customer data by its id
app.get('/api/customers/:id', async (req, res) => {
    try {
        const customerId = req.params.id;

        let customer = await Customer.findOne({ _id: customerId });

        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
        } else {
            res.status(200).json({ message: 'Custoemer data fetched successfully', data: customer });
        }
    } catch (err) {
        res.status(500).send({ message: 'Server is not responding', error: err });
    }
});

// 4. API to list all unique cities with the number of customers
app.get('/api/cities', async (req, res) => {
    try {
        let cityCounts = await Customer.aggregate([{ $group: { _id: '$city', total: { $sum: 1 } } }])

        res.status(200).json({ message: 'Get citywise customer count', data: cityCounts });
    } catch (err) {
        res.status(500).send({ message: 'Server is not responding', error: err });
    }
});

// 5. API to add a customer with validations
app.post('/api/customers', async (req, res) => {
    try {
        const newCustomer = req.body;

        // Validate that all fields are present
        if (!newCustomer.first_name || !newCustomer.last_name || !newCustomer.city || !newCustomer.company) {
            res.status(400).json({ error: 'All fields are required' });
        } else {
            // Check if the city and company already exist for an existing customer
            const existingCustomer = await Customer.findOne({ city: newCustomer.city, company: newCustomer.company });

            if (existingCustomer) {
                res.status(400).json({ message: 'City and company already exist for an existing customer' });
            } else {

                let customerCreated = new Customer(newCustomer);
                await customerCreated.save();
                res.status(201).json({ message: 'Customer created successfully', data: newCustomer });
            }
        }
    } catch (err) {
        res.status(500).send({ message: 'Server is not responding', error: err });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
