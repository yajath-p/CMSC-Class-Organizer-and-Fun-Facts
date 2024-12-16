"use strict";
const express = require("express");
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "credentialsDontPost/.env"),
});
const app = express();
const PORT = 2;
const axios = require("axios"); 

const uri = process.env.MONGO_CONNECTION_STRING;
const db_name = process.env.MONGO_DB_NAME;
const db_collection = process.env.MONGO_COLLECTION;
const databaseAndCollection = { db_name, db_collection };

const { MongoClient, ServerApiVersion } = require("mongodb");

app.listen(PORT);
console.log(`To access server: http://localhost:${PORT}`);

app.set("views", path.resolve(__dirname, "template"));
app.set("view engine", "ejs");

process.stdin.setEncoding("utf8");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const prompt = "Enter stop to shutdown the server: ";
process.stdout.write(prompt);

process.stdin.on("readable", function () {
  const dataInput = process.stdin.read();
  if (dataInput !== null) {
    const command = dataInput.trim();

    if (command === "stop") {
      console.log("Shutting down the server");
      process.exit(0);
    } else {
      console.log(`Invalid command: ${command}`);
    }

    process.stdout.write(prompt);
    process.stdin.resume();
  }
});

app.post("/submit-class", async (request, response) => {
  const { name, code, credit, description } = request.body;

  const newApplication = {
    name: name,
    code: code,
    credit: parseInt(credit),
    description: description,
  };

  const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

  try {
    const apiResponse = await axios.get(`https://api.api-ninjas.com/v1/facts`, {
      headers: { "X-Api-Key": "RC/ACEZFHvkZfpIsq/vH3A==V2YsqExAEZ0izQwj" },
    });
    const facts = apiResponse.data.map((fact) => fact.fact).join(", "); 

    await client.connect();
    await insertApplication(client, databaseAndCollection, newApplication);

    response.render("processAdd", {
      name: name,
      code: code,
      credit: parseInt(credit),
      description: description,
      facts: facts, 
    });
  } catch (e) {
    console.error(e);
    response.status(500).send("An error occurred while processing the class.");
  } finally {
    await client.close();
  }
});

app.post("/search-class", async (request, response) => {
  const { code } = request.body;
  const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

  try {
    const apiResponse = await axios.get(`https://api.api-ninjas.com/v1/facts`, {
      headers: { "X-Api-Key": "RC/ACEZFHvkZfpIsq/vH3A==V2YsqExAEZ0izQwj" },
    });
    const facts = apiResponse.data.map((fact) => fact.fact).join(", "); 

    await client.connect();
    const result = await client
      .db(databaseAndCollection.db_name)
      .collection(databaseAndCollection.db_collection)
      .findOne({ code: code });

    if (result) {
      response.render("processAdd", {
        name: result.name,
        code: result.code,
        credit: result.credit,
        description: result.description,
        facts: facts, 
      });
    } else {
      response.render("processAdd", {
        name: "NONE",
        code: "NONE",
        credit: "NONE",
        description: "NONE",
        facts: facts,
      });
    }
  } catch (e) {
    console.log("No data found with code");
  } finally {
    await client.close();
  }
});

app.post("/remove-classes", async (request, response) => {
  const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

  try {
    const apiResponse = await axios.get(`https://api.api-ninjas.com/v1/facts`, {
      headers: { "X-Api-Key": "RC/ACEZFHvkZfpIsq/vH3A==V2YsqExAEZ0izQwj" },
    });
    const facts = apiResponse.data.map((fact) => fact.fact).join(", "); 

    await client.connect();
    const result = await client
      .db(databaseAndCollection.db_name)
      .collection(databaseAndCollection.db_collection)
      .deleteMany({});
    response.render("processRemove", {
      number: result.deletedCount,
      facts: facts,
    });
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
});

app.get("/", async (request, response) => {
  try {
    
    const apiResponse = await axios.get(
      `https://api.api-ninjas.com/v1/facts`,
      {
        headers: { "X-Api-Key": "RC/ACEZFHvkZfpIsq/vH3A==V2YsqExAEZ0izQwj" },
      }
    );
    const facts = apiResponse.data.map((fact) => fact.fact).join(", "); 

    response.render("index", { facts: facts }); 
  } catch (error) {
    console.error("Error fetching API data:", error);
    response.render("index", { facts: "Failed to load facts." });
  }
});

app.get("/add", async (request, response) => {
  try {
    const apiResponse = await axios.get(`https://api.api-ninjas.com/v1/facts`, {
      headers: { "X-Api-Key": "RC/ACEZFHvkZfpIsq/vH3A==V2YsqExAEZ0izQwj" },
    });
    const facts = apiResponse.data.map((fact) => fact.fact).join(", "); 

    response.render("add", { facts: facts }); 
  } catch (error) {
    console.error("Error fetching API data:", error);
    response.render("add", { facts: "Failed to load facts." }); 
  }
});

app.get("/search", async (request, response) => {
  try {
    const apiResponse = await axios.get(`https://api.api-ninjas.com/v1/facts`, {
      headers: { "X-Api-Key": "RC/ACEZFHvkZfpIsq/vH3A==V2YsqExAEZ0izQwj" },
    });
    const facts = apiResponse.data.map((fact) => fact.fact).join(", ");

    response.render("search", { facts: facts }); 
  } catch (error) {
    console.error("Error fetching API data:", error);
    response.render("search", { facts: "Failed to load facts." }); 
  }
});

app.get("/remove", async  (request, response) => {
  try {
    const apiResponse = await axios.get(`https://api.api-ninjas.com/v1/facts`, {
      headers: { "X-Api-Key": "RC/ACEZFHvkZfpIsq/vH3A==V2YsqExAEZ0izQwj" },
    });
    const facts = apiResponse.data.map((fact) => fact.fact).join(", "); 

    response.render("remove", { facts: facts }); 
  } catch (error) {
    console.error("Error fetching API data:", error);
    response.render("remove", { facts: "Failed to load facts." }); 
  }
});

app.get("/catalog", async (request, response) => {
  const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

  try {
    const apiResponse = await axios.get(`https://api.api-ninjas.com/v1/facts`, {
      headers: { "X-Api-Key": "RC/ACEZFHvkZfpIsq/vH3A==V2YsqExAEZ0izQwj" },
    });
    const facts = apiResponse.data.map((fact) => fact.fact).join(", "); 

   
    await client.connect();

    const courses = await client
      .db(databaseAndCollection.db_name)
      .collection(databaseAndCollection.db_collection)
      .find({})
      .toArray();

    
    response.render("catalog", { courses: courses, facts: facts });
  } catch (e) {
    console.error(e);
    response.status(500).send("An error occurred while loading the catalog.");
  } finally {
    await client.close();
  }
});

async function insertApplication(
  client,
  databaseAndCollection,
  newApplication
) {
  await client
    .db(databaseAndCollection.db_name)
    .collection(databaseAndCollection.db_collection)
    .insertOne(newApplication);
}
