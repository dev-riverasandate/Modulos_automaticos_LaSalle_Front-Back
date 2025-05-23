const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json()); // Para recibir JSON en POST

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

// --- ENDPOINTS DE BASE DE DATOS (NO MODIFICAR) ---

app.get('/api/databases', async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT name FROM sys.databases`;
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al consultar bases de datos:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/databases/:dbName/tables', async (req, res) => {
  const dbName = req.params.dbName;
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

app.get('/api/databases/:dbName/tables/:tableName/primary-key', async (req, res) => {
  const dbName = req.params.dbName;
  const tableName = req.params.tableName;
  const dbConfig = { ...config, database: dbName };
  try {
    await sql.connect(dbConfig);
    const result = await sql.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + QUOTENAME(CONSTRAINT_NAME)), 'IsPrimaryKey') = 1
        AND TABLE_NAME = '${tableName}'
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// --- CLONADOR DE MODULOS ---

function pascalCase(str) {
  return str.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

async function cloneAndRenameModule(baseDir, destDir, nuevoModulo, COLUMNS, DATABASE, TABLE_SCHEMA, TABLE_NAME, ID_COLUMN, INSERT_COLUMNS, INSERT_VALUES, UPDATE_SET, INPUTS) {
  const nuevoModuloPascal = pascalCase(nuevoModulo);
  async function copyDir(src, dest) {
    await fsp.mkdir(dest, { recursive: true });
    const entries = await fsp.readdir(src, { withFileTypes: true });
    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      let destName = entry.name
        .replace(/api_base/g, nuevoModulo)
        .replace(/ApiBase/g, nuevoModuloPascal);
      const destPath = path.join(dest, destName);
      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        let content = await fsp.readFile(srcPath, 'utf8');
        content = content
          .replace(/api_base/g, nuevoModulo)
          .replace(/ApiBase/g, nuevoModuloPascal)
          .replace(/\[nom_proy\]/g, nuevoModulo)
          .replace(/\[COLUMNS\]/g, COLUMNS)
          .replace(/\[\[DATABASE\]\]/g, `[${DATABASE}]`)
          .replace(/\[\[TABLE_SCHEMA\]\]/g, `[${TABLE_SCHEMA}]`)
          .replace(/\[\[TABLE_NAME\]\]/g, `[${TABLE_NAME}]`)
          .replace(/\[ID_COLUMN\]/g, ID_COLUMN) // Ahora sí existe
          .replace(/\[INSERT_COLUMNS\]/g, INSERT_COLUMNS)
          .replace(/\[INSERT_VALUES\]/g, INSERT_VALUES)
          .replace(/\[UPDATE_SET\]/g, UPDATE_SET)
          .replace(/\[INPUTS\]/g, INPUTS);
        await fsp.writeFile(destPath, content, 'utf8');
      }
    }
  }
  await copyDir(baseDir, destDir);
}

app.post('/api/clonar-modulo', async (req, res) => {
  const { nombreModulo, COLUMNS, DATABASE, TABLE_SCHEMA, TABLE_NAME, ID_COLUMN, INSERT_COLUMNS, INSERT_VALUES, UPDATE_SET, INPUTS } = req.body;
  if (!nombreModulo) {
    return res.status(400).json({ error: 'Falta el nombre del módulo' });
  }
  const baseDir = path.join(__dirname, 'public', 'api_base', 'api_base');
  const destDir = path.join(__dirname, 'public', 'api_destino', nombreModulo);

  try {
    await cloneAndRenameModule(
      baseDir,
      destDir,
      nombreModulo,
      COLUMNS,
      DATABASE,
      TABLE_SCHEMA,
      TABLE_NAME,
      ID_COLUMN,
      INSERT_COLUMNS, 
      INSERT_VALUES, 
      UPDATE_SET,      // <-- AGREGA ESTE PARÁMETRO
      INPUTS
    );
    res.json({ success: true, message: `Módulo ${nombreModulo} creado en api_destino.` });
  } catch (err) {
    console.error('Error al clonar módulo:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Backend corriendo en http://localhost:3000');
});