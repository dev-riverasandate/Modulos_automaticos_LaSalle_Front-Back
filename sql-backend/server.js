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

// Inicoo para obtener tablas de una base de datos específica
app.get('/api/databases/:dbName/tables', async (req, res) => {
  const dbName = req.params.dbName;
  // Clona la configuración y cambia la base de datos
  const dbConfig = { ...config, database: dbName };
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `;
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al consultar tablas:', err);
    res.status(500).json({ error: err.message });
  }
});
// Fin para obtener tablas de una base de datos específica

//Inicio para obtener columnas de una tabla específica
app.get('/api/databases/:dbName/tables/:tableName/columns', async (req, res) => {
  const dbName = req.params.dbName;
  const tableName = req.params.tableName;
  const dbConfig = { ...config, database: dbName };
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`
      SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = ${tableName}
  ORDER BY ORDINAL_POSITION
    `;
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al consultar columnas:', err);
    res.status(500).json({ error: err.message });
  }
});
//Fin para obtener columnas de una tabla específica

//Inicio para obtener claves foráneas de una base de datos
app.get('/api/databases/:dbName/foreign-keys', async (req, res) => {
  const dbName = req.params.dbName;
  const dbConfig = { ...config, database: dbName };
  try {
    await sql.connect(dbConfig);
    const result = await sql.query(`
      SELECT
        fk.name AS FK_NAME,
        tp.name AS PARENT_TABLE,
        cp.name AS PARENT_COLUMN,
        tr.name AS REF_TABLE,
        cr.name AS REF_COLUMN
      FROM sys.foreign_keys fk
      INNER JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
      INNER JOIN sys.tables tp ON fkc.parent_object_id = tp.object_id
      INNER JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
      INNER JOIN sys.tables tr ON fkc.referenced_object_id = tr.object_id
      INNER JOIN sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
      ORDER BY fk.name
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al consultar claves foráneas:', err);
    res.status(500).json({ error: err.message });
  }
});
//Fin para obtener claves foráneas de una base de datos

app.listen(3000, () => {
  console.log('Backend corriendo en http://localhost:3000');
});