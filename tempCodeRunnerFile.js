import express from 'express';
import dotenv from "dotenv";
import bodyParser from'body-parser';// Body Parser for API calling
import {Client} from 'pg';// Using PostgreSQL

const app=express();
dotenv.config();

app.use(bodyParser.json());

const db = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
  });


 db.connect();

app.post("/add",async(req,res)=>
{
    const { name, address, latitude, longitude } = req.body;

    if (!name || !address || !latitude || !longitude) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    try 
    {
        const result = await db.query(
            "Insert into schools (name, address, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING id",
            [name, address, latitude, longitude]
          );
          res.status(201).json({message:"School added",schoolId: result.rows[0].id });
    }
    catch
    {console.error(error);
        res.status(500).json({message:"Error adding school try again"});

    }

})
app.listen("9000",()=>
{
    console.log("Server is running in port 9000");
})

