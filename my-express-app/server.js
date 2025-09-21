// server.js

// 1. Load environment variables from .env file
require('dotenv').config();

// 2. Import modules
const express = require('express');
const cors = require('cors'); // <--- ADD THIS
const sql = require('mssql'); // Import the mssql driver

const app = express();
const port = 3000;

// ADD CORS configuration here
// Allows requests from the React development server (typically port 3000, 3001 or whatever create-react-app uses)
// Read allowed origins from environment (comma-separated) so Docker/compose can configure it.
// Fallback defaults include typical dev values and the compose service name mapping.
const allowedFromEnv = process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://localhost:8080,http://frontend:80';
const whitelist = allowedFromEnv.split(',').map(s => s.trim()).filter(Boolean);

const allowAll = process.env.ALLOW_ALL_ORIGINS === 'true'; // Set this in .env for quick dev testing

app.use((req, res, next) => {
  // Helpful logging to debug CORS issues inside Docker
  const incomingOrigin = req.headers.origin;
  console.log('[CORS] Incoming Origin:', incomingOrigin);
  console.log('[CORS] Whitelist:', whitelist);
  next();
});

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like curl/Postman) or when allowAll is enabled
    if (!origin || allowAll) return callback(null, true);
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('[CORS] Rejected origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ... (rest of your existing code, including config and routes)

// 3. Define the SQL Server Configuration
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT), // Ensure port is an integer
  options: {
    // This is often required for modern SQL Server versions
    encrypt: true, // For Azure SQL or if encryption is enabled
    trustServerCertificate: true, // If using a self-signed cert in development
  }
};

// --- EXISTING HOMEPAGE ROUTE ---
app.get('/', (req, res) => {
  res.send('Hello World! This is my basic Express app.');
});
// ------------------------------

// 4. NEW API ENDPOINT: Call Stored Procedure
app.get('/api/customers', async (req, res) => {
  try {
    // Establish a connection to the database
    await sql.connect(config);
    
    // Create a new Request object
    const request = new sql.Request();

    // Call the stored procedure
    // .execute() is used for stored procedures, and the result contains the rowset.
    const result = await request.execute('GetSampleData');

    // Send the resulting rows back as JSON
    res.json(result.recordset);

  } catch (err) {
    // Log the error and send a 500 status code
    console.error('SQL Error:', err);
    res.status(500).send('Error fetching data from the database.');

  } finally {
    // Always close the connection pool when done
    sql.close();
  }
});

// 5. Start the server
app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});
