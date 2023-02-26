const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.DB_PORT;

// middle Ware
app.use(cors());
app.use(express.json());
// middle Ware
// jwt verification Function
const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
    if (error) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};
// jwt verification Function
// mongodb Collection
const userName = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const uri = `mongodb+srv://${userName}:${password}@cluster0.4slfm2g.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function dbConnect() {
  try {
    await client.connect();
    console.log("dbconnect");
  } catch (error) {
    console.log(error);
  }
}
dbConnect().catch((error) => {
  console.log(error);
});

// mongodb Collection
app.get("/", (req, res) => {
  res.send({
    success: true,
    message: "server is Ready ",
  });
});

// Database Collection Name
const postCollection = client.db("postInfo").collection("postData");
// Database Collection Name
// post api create

app.post("/post", verifyJwt, async (req, res) => {
  try {
    const postInfo = req.body;
    const result = await postCollection.insertOne(postInfo);
    if (result.acknowledged) {
      res.send({
        success: true,
        message: `Data Successfully Inserted Id ${result.insertedId}`,
      });
    }
  } catch (error) {
    res.send({
      success: false,
      error: "postInfo Not Found",
    });
  }
});
// post api create
// AllPost Api Create
app.get("/posts", async (req, res) => {
  try {
    const result = await postCollection.find({}).toArray();
    if (result) {
      res.send({ success: true, data: result });
    }
  } catch (error) {
    res.send({ success: false, error: "Data not found" });
  }
});
// AllPost Api Create
// single post get api
app.get("/post/:id", verifyJwt, async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const query = { _id: new ObjectId(id) };
      const result = await postCollection.findOne(query);
      res.send({ success: true, data: result });
    }
  } catch (error) {
    res.send({ success: false, error: `not found ${error}` });
  }
});
// single post get api
// Delete Api Create
app.delete("/posts/:id", verifyJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: new ObjectId(id) };
    const result = await postCollection.deleteOne(query);
    if (result.deletedCount > 0) {
      res.send({
        success: true,
        message: `Delete Post ID ${result.deletedCount}`,
      });
    }
  } catch (error) {
    res.send({
      success: false,
      error: "Data not found",
    });
  }
});
// Delete Api Create
// delete api Create
app.patch("/post/:id", verifyJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: new ObjectId(id) };
    const updateDoc = { $set: req.body };
    const result = await postCollection.updateOne(query, updateDoc);
    if (result.matchedCount) {
      res.send({
        success: true,
        message: `updated success id ${result.matchedCount}`,
      });
    }
  } catch (error) {
    res.send({ success: false, error: `not found ${error}` });
  }
});
// delete api Create
// user query api create
app.get("/user", verifyJwt, async (req, res) => {
  try {
    const decoded = req.decoded;
    const { email } = req.query;
    if (decoded.email !== email) {
      res.status(403).send({ message: "unauthorized access" });
    }
    const query = { email: email };
    const result = await postCollection.find(query).toArray();
    if (result) {
      res.send({ success: true, data: result });
    }
  } catch (error) {
    res.send({ success: false, error: `not found ${error}` });
  }
});
// user query api create
// jwt access api
app.post("/jwt", (req, res) => {
  try {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: "1h" });
    res.send({ success: true, data: token });
  } catch (error) {
    res.send({ success: false, error: "Not Found" });
  }
});
// jwt access api
// app listen
app.listen(port, () => {
  console.log(`server is running port ${port}`);
});
