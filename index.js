const express = require('express')
const app = express()
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;
const cors = require('cors');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s5rla.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    console.log('Databse connected successfully');
    const database = client.db('timeDB');
    const productsCollection = database.collection('products');
    const orderCollection = database.collection('orders');
    const reviewCollection = database.collection('reviews');
    const usersCollection = database.collection('user');

    // GET API
    app.get('/products', async(req,res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
  })
    // GET Limited API
    app.get('/products/6', async(req,res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.limit(6).toArray();
      res.send(products);
  })

    // GET Single Product
    app.get('/products/:id',async(req,res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const product = await productsCollection.findOne(query);
      res.json(product);
    })

    // POST API
    app.post('/products',async(req,res) => {
      const products = req.body
      console.log('hit the post api',products);
      const result = await productsCollection.insertOne(products);
      console.log(result); 
      res.json(result);
  })
/* ------------------ */
  // ADD ORDERS API
  app.post('/orders',async(req,res) => {
    const order = req.body;
    const result = await orderCollection.insertOne(order);
    res.json(result);
})

 // GET ORDERS API
 app.get('/orders', async(req,res) => {
    const cursor = orderCollection.find({});
    const orders = await cursor.toArray();
    res.send(orders);
})

// GET Single Order
app.get('/orders/:id', async (req, res) => {
  const id = req.params.id;
  console.log('getting specific order', id);
  const query = { _id: ObjectId(id) };
  const order = await orderCollection.findOne(query);
  res.json(order);
})

// DELETE ORDER API
app.delete('/orders/:id',async(req,res) => {
  const id = req.params.id;
  console.log(id);
  const query = {_id: ObjectId(id)};
  const result = await orderCollection.deleteOne(query);
  console.log('Deleted',result);
  res.json({result,id});
});
/* --------------------------- */
   // GET REVIEWS
   app.get('/reviews', async(req,res) => {
    const cursor = reviewCollection.find({});
    const reviews = await cursor.toArray();
    res.send(reviews);
})

    // POST REVIEWS
     app.post('/reviews',async(req,res) => {
      const review = req.body
      console.log('hit the post api',review);
      const result = await reviewCollection.insertOne(review);
      console.log(result); 
      res.json(result);
  });

    // User
    app.post('/users',async(req,res) => {
      const user = req.body
      const result = await usersCollection.insertOne(user);
      console.log(result); 
      res.json(result);
  })

    app.put('/users',async(req,res) => {
      const user = req.body;
      const filter = {email: user.email};
      const options = {upsert: true};
      const updateDoc = { $set: user};
      const result = await usersCollection.updateOne(filter,updateDoc,options);
      res.json(result);

    })

    app.get('/users/:email', async(req,res) => {
      const email = req.params.email;
      const query = {email: email};
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if(user?.role === 'admin'){
        isAdmin = true;
      }
      res.json({admin: isAdmin})
    })

    // Admin
    app.put('/users/admin',async(req,res) => {
      const user = req.body;
      console.log('put', user);
      const filter = {email: user.email};
      const updateDoc = {$set: {role: 'admin'}};
      const result = await usersCollection.updateOne(filter,updateDoc);
      res.json(result);
    })

    // Query for a movie that has the title 'Back to the Future'
    /* const query = { title: 'Back to the Future' };
    const movie = await movies.findOne(query);
    console.log(movie); */
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello Time Keeper!')
})

app.listen(port, () => {
  console.log(`listening at ${port}`)
})