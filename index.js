const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors");
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// set middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5a8lj4m.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const toysCollection = client.db('toysDb').collection('toys');
    const clientCollection = client.db('toysDb').collection('client');

    app.get('/toys', async (req, res ) => {
      console.log(req.query)
      let query = {}
      if(req.query?.category){
        query = {category: req.query.category}
      }
      const curson = toysCollection.find(query);
      const result = await curson.toArray();
      res.send(result);
  })
// single toys
  app.get('/toys/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await toysCollection.findOne(query);
    res.send(result);
})

// get toys which user added
  app.get('/userToys', async (req, res) => {
    let query = {}
      if(req.query?.email){
        query = {email: req.query.email}
      }
    const result = await toysCollection.find(query).toArray()
    res.send(result);
  })

// Add toys 
  app.put('/toys', async (req, res) => {
    const addingToys = req.body;
    const result = await toysCollection.insertOne(addingToys);
    res.send(result);
})


  //delete a toys
  app.delete('/toys/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await toysCollection.deleteOne(query);
    res.send(result);
  })


  //update toys
  app.patch('/update/:id', async(req, res) => {
    const id = req.params.id;
    const updatedToy = req.body;
    const filter = {_id: new ObjectId(id)}
    const updatedDoc = {
      $set: {
        toy_name: updatedToy.toy_name,
        toy_pic: updatedToy.toy_pic,
        price: updatedToy.price,
        rating: updatedToy.rating,
        quantity: updatedToy.quantity,
        category: updatedToy.category,
        details: updatedToy.details
      },
    }
    const result = await toysCollection.updateOne(filter, updatedDoc);
    res.send(result);
  })

  //client section in home
  app.get('/client', async (req, res ) => {
    const curson = clientCollection.find();
    const result = await curson.toArray();
    res.send(result);
})


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('The toy marketPlace are running');
});

app.listen(port, () => {
    console.log(`The toy marketPlace are running on ${port}`);
})