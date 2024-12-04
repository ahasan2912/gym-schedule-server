const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri =`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.jqnby.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const gymSchedule = client.db("gym-scheduleDB").collection("schedule");
    // const userCollection = client.db("gym-scheduleDB").collection("users");

    app.get('/schedule', async(req, res) => {
      //for search
      const {searchParams} = req.query;
      let option = {};
      if(searchParams){
        option = {title:{$regex:searchParams, $options: "i"}}
      }
      //title=== filed, that means mongodb leftside field

      const cursor = gymSchedule.find(option);
      const result = await cursor.toArray();
      res.send(result);
    });



    app.post('/schedule', async(req, res) => {
      const data = req.body;
      const result = await gymSchedule.insertOne(data);
      res.send(result);
    });

    app.delete('/schedule/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await gymSchedule.deleteOne(query);
      res.send(result);
    });

    app.get('/schedule/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await gymSchedule.findOne(query);
      res.send(result);
    });

    app.patch('/schedule/:id', async(req, res) => {
      const id = req.params.id;
      const data = req.body;
      //if want to you destructure
      const query = {_id: new ObjectId(id)};
      const update ={
        $set:{
          title: data.title, 
          date: data.date,
          day: data.day,
          hour: data.hour
        }
      };
      const result = await gymSchedule.updateOne(query,update)
      res.send(result);

    });

    app.patch('/status/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const update ={
        $set:{
          isCompleted: true,
        }
      };
      const result = await gymSchedule.updateOne(query,update)
      res.send(result);
    });

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", async (req, res) => {
  res.send(`server running`);
});
app.listen(port, () => {
  console.log(`Server running on Port ${port}`);
});


