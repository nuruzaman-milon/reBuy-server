const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
require ('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aoukuaq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
  // console.log(req.headers.authorization);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('unauthorized access');
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
    if (err) {
      return res.status(403).send({message:'forbidden access'})
    }
    req.decoded = decoded;
    next();
  })
}

async function run(){
    try {
        const categoryCollection = client.db('ReBuy').collection('categories');
        const productCollection = client.db('ReBuy').collection('products');
        const userCollection = client.db('ReBuy').collection('users');
        const bookCollection = client.db('ReBuy').collection('books');


        //JWT server
        app.get('/jwt',async(req,res) =>{
          const email = req.query.email;
          const query = {email:email};
          const user = await userCollection.findOne(query);
          if (user) {
            const token = jwt.sign({email}, process.env.ACCESS_TOKEN,{expiresIn:'1h'})
            return res.send({accessToken:token});
          }
          res.status(403).send({accessToken:''})
        })

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

         //post products to database
         app.post('/products',async(req,res) =>{
          const product = req.body;
          const result = await productCollection.insertOne(product);
          res.send(result);
        });

        // get seller product using auth email
        app.get('/products',async(req,res) =>{
          const email = req.query.email;
          const query = {sellerEmail:email}
          const product = await productCollection.find(query).toArray();
          res.send(product);
        });

        //post user data to database
        app.post('/users',async(req,res) =>{
          const user = req.body;
          const result = await userCollection.insertOne(user);
          res.send(result);
        });

        

        //check isAdmin
        app.get('/users/admin/:email',async(req,res) =>{
          const email = req.params.email;
          const query = {email};
          const user = await userCollection.findOne(query);
          res.send({isAdmin:user?.role === 'admin'});
        });

        //check isSeller
        app.get('/users/seller/:email',async(req,res) =>{
          const email = req.params.email;
          const query = {email};
          const user = await userCollection.findOne(query);
          res.send({isSeller:user?.role === 'seller'});
        });

        //check isBuyer
        app.get('/users/buyer/:email',async(req,res) =>{
          const email = req.params.email;
          const query = {email};
          const user = await userCollection.findOne(query);
          res.send({isBuyer:user?.role === 'buyer'});
        });


         //post book data to database
         app.post('/bookings',async(req,res) =>{
          const book = req.body;
          const result = await bookCollection.insertOne(book);
          res.send(result);
        });

        //get bookings using specific email address
        app.get('/bookings', verifyJWT, async(req,res) =>{
          const email= req.query.email;
          const decodedEmail = req.decoded.email;
          if (email !== decodedEmail) {
            return res.status(403).send({message:'forbidden access'})
          }
          const query = {email:email}
          const bookings = await bookCollection.find(query).toArray();
          res.send(bookings);
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