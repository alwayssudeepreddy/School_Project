import express from 'express';
import dotenv from "dotenv";
import bodyParser from 'body-parser'; // Body Parser for API calling
import { Client } from 'pg'; // Using PostgreSQL

const app = express();
dotenv.config();

app.use(bodyParser.json());

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Database connection error:', err.stack));
app.get('/', (req, res) => {
  res.send('Hello from School Project Backend!');
});

app.post("/addSchool", async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  try {
    const result = await db.query(
      "INSERT INTO Data (name, address, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING id",
      [name, address, latitude, longitude]
    );
    res.status(201).json({ message: "School added", schoolId: result.rows[0].id });
  } catch (error) { 
    console.error(error);
    res.status(500).json({ message: "Error adding school. Please try again." });
  }
});

app.get("/listSchools",async(req,res)=>
{
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
    }
    try {
        const result = await db.query("SELECT * FROM Data");
        const schools = result.rows;
    
        function toRadians(degrees) {
            return degrees * (Math.PI / 180);
        }
    
        function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371;
            const dLat = toRadians(lat2 - lat1);
            const dLon = toRadians(lon2 - lon1);
            const a = 
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        }
    
        const userLat = parseFloat(latitude);
        const userLon = parseFloat(longitude);
    
        const schoolsWithDistance = schools.map((school) => {
            return {
                ...school,
                distance: calculateDistance(userLat, userLon, school.latitude, school.longitude)
            };
        });
    
        schoolsWithDistance.sort((a, b) => a.distance - b.distance);
    
        res.json(schoolsWithDistance);
    }
    
catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching schools" });
}
});

app.listen(9000, () => {
  console.log("Server is running");
});
