const express = require("express");
const app = express();
var cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.5prtsfh.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const menuCollection = client.db("Bistro_Boss").collection("menu");
    const cartsCollection = client.db("Bistro_Boss").collection("carts");
    const reviewsCollection = client.db("Bistro_Boss").collection("reviews");
    const usersInfoCollection = client
      .db("Bistro_Boss")
      .collection("usersInfo");

    // user related api

    // store user data
    app.post("/api/v1/user/userInfo", async (req, res) => {
      const info = req.body;
      // check user isExist
      const query = { email: req.body.email };
      const isExist = await usersInfoCollection.findOne(query);
      if (isExist) {
        return res.send({ message: "user already exist", insertedId: null });
      }
      const result = await usersInfoCollection.insertOne(info);
      res.send(result);
    });

    // get user data
    app.get("/api/v1/user/userInfo", async (req, res) => {
      const result = await usersInfoCollection.find().toArray();
      res.send(result);
    });

    // delete user by admin
    app.delete("/api/v1/admin/removeUser/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersInfoCollection.deleteOne(query);
      res.send(result);
    });

    // make admin
    app.patch("/api/v1/makeAdmin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateRole = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersInfoCollection.updateOne(filter, updateRole);
      res.send(result);
    });

    // menu related api

    // all menu item
    app.get("/api/v1/menu_item", async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    });

    // add to cart
    app.post("/api/v1/user/addToCart", async (req, res) => {
      const items = req.body;
      const result = await cartsCollection.insertOne(items);
      res.send(result);
    });

    // get user specific addToCart data
    app.get("/api/v1/user/get_carts_data", async (req, res) => {
      let query = {}; //when admin use
      if (req.query.email) {
        query.user = req.query.email;
      }
      // const query = { user: req.query.email }; //only user use
      const result = await cartsCollection.find(query).toArray();
      res.send(result);
    });

    // delete cart
    app.delete("/api/v1/user/deleteCart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartsCollection.deleteOne(query);
      res.send(result);
    });

    // client review
    app.get("/api/v1/client_review", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Bistro Boss is running!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
