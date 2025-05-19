const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
app.use(cors());

const config = {
  user: 'arivera',
  password: 'D354r5dc2mxXcp',
  server: '172.17.50.209', 
  database: 'INTEGRACION',
  options: {
    trustServerCertificate: true, 
    encrypt: false, // Cambia a true si usas Azure
  }
};

app.get('/api/databases', async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT name FROM sys.databases`;
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al consultar bases de datos:', err); // <-- Agrega esto
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Backend corriendo en http://localhost:3000');
});