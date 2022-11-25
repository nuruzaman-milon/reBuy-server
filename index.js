const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
require ('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aoukuaq.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try {
        const categoryCollection = client.db('ReBuy').collection('categories');
        const productCollection = client.db('ReBuy').collection('products');

        //get all category data
        app.get('/category',async(req,res) =>{
          const query = {}
          const categories = await categoryCollection.find(query).toArray();
          res.send(categories);
        });

        //get Category wise product
        app.get('/category/:id',async(req,res) =>{
          const id= req.params.id;
          const query = {category_id:id}
          const products = await productCollection.find(query).toArray();
          res.send(products);
        });

    } 
    finally {
        
    }
}
run().catch(err=>console.error(err));


app.get('/', (req, res) => {
  res.send('resale server running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})