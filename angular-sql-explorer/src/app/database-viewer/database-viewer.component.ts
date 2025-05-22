import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { DatabaseService } from '../services/database.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-database-viewer',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatCheckboxModule, DragDropModule],
  templateUrl: './database-viewer.component.html',
  styleUrls: ['./database-viewer.component.scss']
})
export class DatabaseViewerComponent implements OnInit {
  databases: any[] = [];
  tables: any[] = [];
  selectedDatabase: string | null = null;
  loading = false;
  error: string | null = null;
  selectedTables: string[] = [];
  tableColumns: { [table: string]: any[] } = {};
  selectedFields: any[] = [];
  foreignKeys: any[] = [];

  constructor(private databaseService: DatabaseService,private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchDatabases();
  }

  fetchDatabases(): void {
    this.loading = true;
    this.error = null;
    this.databaseService.getDatabases().subscribe({
      next: (data) => {
        this.databases = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al obtener las bases de datos';
        this.loading = false;
      }
    });
  }
//Inicio del componente para manejar la seleccion y mostrar tablas
  onSelectDatabase(db: any): void {
  this.selectedDatabase = db.name;
  this.tables = [];
  this.selectedTables = [];
  this.tableColumns = {};
  this.selectedFields = [];
  this.loading = true;
  this.error = null;
  this.databaseService.getTables(db.name).subscribe({
    next: (data) => {
      this.tables = data;
      this.loading = false;
    },
    error: (err) => {
      this.error = 'Error al obtener las tablas';
      this.loading = false;
    }
  });
  this.databaseService.getForeignKeys(db.name).subscribe({
    next: (data) => { this.foreignKeys = data; },
    error: () => { this.foreignKeys = []; }
  });
}
  //Fin del componente para manejar la seleccion y mostrar tablas

  //Inicio del componente para manejar la seleccion y mostrar columnas
  onToggleTableSelection(table: any): void {
  const idx = this.selectedTables.indexOf(table.TABLE_NAME || table.name);
  if (idx > -1) {
    this.selectedTables.splice(idx, 1);
    delete this.tableColumns[table.TABLE_NAME || table.name];
  } else {
    this.selectedTables.push(table.TABLE_NAME || table.name);
    this.loadColumns(this.selectedDatabase!, table.TABLE_NAME || table.name);
  }
}

loadColumns(database: string, table: string): void {
  this.databaseService.getColumns(database, table).subscribe({
    next: (columns) => {
      // Si columns ya trae TABLE_SCHEMA y TABLE_NAME, no necesitas esto:
      // Si no, asígnalos aquí (ejemplo con esquema 'dbo'):
      this.tableColumns[table] = columns.map(col => ({
        ...col,
        TABLE_NAME: table,
        TABLE_SCHEMA: col.TABLE_SCHEMA || 'dbo'
      }));
    },
    error: () => {
      this.tableColumns[table] = [];
    }
  });
}

// Drag and drop handler
drop(event: CdkDragDrop<any[]>) {
  if (event.previousContainer !== event.container) {
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }
}
  //Fin del componente para manejar la seleccion y mostrar columnas

  get connectedDropLists(): string[] {
  return this.selectedTables.map(t => 'fieldsList_' + t);
}

get generatedQuery(): string {
  if (!this.selectedFields.length) return '-- Selecciona campos para generar la consulta --';

  // Agrupa campos por tabla
  const fieldsByTable: { [key: string]: any[] } = {};
  this.selectedFields.forEach(field => {
    const schema = field.TABLE_SCHEMA || '';
    const table = field.TABLE_NAME || '';
    const key = `${schema}.${table}`;
    if (!fieldsByTable[key]) fieldsByTable[key] = [];
    fieldsByTable[key].push(field);
  });

  // SELECT parte: solo los nombres de columna con esquema
  // const selectFields = this.selectedFields
  // .map(field => `${field.TABLE_SCHEMA}.[${field.COLUMN_NAME}]`)
  // .join(',\n    ');
  
  // SELECT parte: solo los nombres de columna sin esquema
  const selectFields = this.selectedFields
  .map(field => `${field.COLUMN_NAME}`)
  .join(',\n    ');

  // FROM parte: si hay una tabla, solo esa; si hay varias, CROSS JOIN
  const tables = Object.keys(fieldsByTable);
  let fromClause = '';
  if (tables.length === 1) {
    const [schema, table] = tables[0].split('.');
    fromClause = `[${this.selectedDatabase}].[${schema}].[${table}]`;
  } else if (tables.length > 1) {
    fromClause = tables.map(tbl => {
      const [schema, table] = tbl.split('.');
      return `[${this.selectedDatabase}].[${schema}].[${table}]`;
    }).join(',\n    ');
  }

  // ORDER BY por la primera columna seleccionada
  // let orderByClause = '';
  // if (this.selectedFields.length > 0) {
  //   orderByClause = `\nORDER BY [${this.selectedFields[0].COLUMN_NAME}]`;
  // }

  // Script final
  return `SELECT
    ${selectFields}
FROM
    ${fromClause}
;`;
}

onMenuAction1() {
  const nombreModulo = prompt('Nombre del nuevo módulo (ej: md_escolar):');
  if (!nombreModulo) return;
  const sqlScript = this.generatedQuery; 
  const { COLUMNS, DATABASE, TABLE_SCHEMA, TABLE_NAME } = this.extractSqlParts(sqlScript);

  this.http.post('http://localhost:3000/api/clonar-modulo', {
    nombreModulo,
    COLUMNS,
    DATABASE,
    TABLE_SCHEMA,
    TABLE_NAME
  }).subscribe({
    next: (resp: any) => alert(resp.message),
    error: (err) => alert('Error: ' + (err.error?.error || err.message))
  });
}

extractSqlParts(sqlScript: string) {
  // Extrae columnas
  const selectMatch = sqlScript.match(/SELECT\s+([\s\S]+?)\s+FROM/i);
  const COLUMNS = selectMatch ? selectMatch[1].replace(/\s+/g, ' ').replace(/,$/, '').trim() : '';

  // Extrae FROM
  const fromMatch = sqlScript.match(/FROM\s+\[([^\]]+)\]\.\[([^\]]+)\]\.\[([^\]]+)\]/i);
  const DATABASE = fromMatch ? fromMatch[1] : '';
  const TABLE_SCHEMA = fromMatch ? fromMatch[2] : '';
  const TABLE_NAME = fromMatch ? fromMatch[3] : '';

  return { COLUMNS, DATABASE, TABLE_SCHEMA, TABLE_NAME };
}

}