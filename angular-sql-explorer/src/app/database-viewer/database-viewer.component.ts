import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { DatabaseService } from '../services/database.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, transferArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { QueryResultDialogComponent } from '../component/query-result-dialog.component';
import { MatToolbarModule } from '@angular/material/toolbar';


@Component({
  selector: 'app-database-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatIconModule,
    MatCheckboxModule,
    DragDropModule,
    MatToolbarModule
  ],
  templateUrl: './database-viewer.component.html',
  styleUrls: ['./database-viewer.component.scss'],
})
export class DatabaseViewerComponent implements OnInit {
  databases: any[] = [];
  tables: any[] = [];
  selectedDatabase: string | null = null;
  loading = false;
  error: string | null = null;
  selectedTables: any[] = [];
  tableColumns: { [table: string]: any[] } = {};
  selectedFields: any[] = [];
  foreignKeys: any[] = [];

  editingSql = false;
  manualSql = '';

  queryResult: any[] = [];
  queryColumns: string[] = [];

  tableFilter: string = '';

  constructor(
    private databaseService: DatabaseService,
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

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
      },
    });
  }

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
      },
    });
    this.databaseService.getForeignKeys(db.name).subscribe({
      next: (data) => {
        this.foreignKeys = data;
      },
      error: () => {
        this.foreignKeys = [];
      },
    });
  }

  onToggleTableSelection(table: any) {
    const idx = this.selectedTables.findIndex(t => t.TABLE_NAME === table.TABLE_NAME);

    if (idx === -1) {
      this.selectedTables.push(table);
      this.databaseService.getColumns(this.selectedDatabase!, table.TABLE_NAME).subscribe({
        next: (cols) => {
          this.tableColumns[table.TABLE_NAME] = cols;
        },
        error: () => {
          this.tableColumns[table.TABLE_NAME] = [];
        }
      });
    } else {
      this.selectedTables.splice(idx, 1);
      delete this.tableColumns[table.TABLE_NAME];
      this.selectedFields = this.selectedFields.filter(f => f.TABLE_NAME !== table.TABLE_NAME);
    }
  }

  isTableSelected(table: any): boolean {
    return this.selectedTables.some(t => t.TABLE_NAME === table.TABLE_NAME);
  }

  // drop(event: CdkDragDrop<any[]>) {
  //   if (event.previousContainer !== event.container) {
  //     transferArrayItem(
  //       event.previousContainer.data,
  //       event.container.data,
  //       event.previousIndex,
  //       event.currentIndex
  //     );
  //   }
  // }
  drop(event: CdkDragDrop<any[]>) {
  if (event.previousContainer === event.container) {
    // Reordenamiento manual dentro de la lista de seleccionados
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  } else {
    // Arrastrando desde otra lista: agrega al final (abajo)
    const [moved] = event.previousContainer.data.splice(event.previousIndex, 1);
    event.container.data.push(moved);
  }
}

  get connectedDropLists(): string[] {
    return this.selectedTables.map((t) => 'fieldsList_' + t.TABLE_NAME);
  }

  get generatedQuery(): string {
    if (this.manualSql && !this.editingSql) {
      return this.manualSql;
    }

    const fieldsByTable: { [key: string]: any[] } = {};
    this.selectedFields.forEach((field) => {
      const schema = field.TABLE_SCHEMA || '';
      const table = field.TABLE_NAME || '';
      const key = `${schema}.${table}`;
      if (!fieldsByTable[key]) fieldsByTable[key] = [];
      fieldsByTable[key].push(field);
    });

    const columnCount: { [col: string]: number } = {};
    this.selectedFields.forEach(f => {
      columnCount[f.COLUMN_NAME] = (columnCount[f.COLUMN_NAME] || 0) + 1;
    });

    const selectFields = this.selectedFields.map(field => {
      const schema = field.TABLE_SCHEMA || '';
      const table = field.TABLE_NAME || '';
      const col = field.COLUMN_NAME;
      if (columnCount[col] > 1) {
        return `[${schema}].[${table}].[${col}] AS [${table}_${col}]`;
      }
      return `[${schema}].[${table}].[${col}]`;
    }).join(',\n    ');

    const tables = Object.keys(fieldsByTable);
    if (tables.length === 0) {
      return '-- Selecciona campos para generar la consulta --';
    }
    if (tables.length === 1) {
      const [schema, table] = tables[0].split('.');
      return `SELECT\n    ${selectFields}\nFROM [${this.selectedDatabase}].[${schema}].[${table}];`;
    }

    let fromClause = '';
    let joins: string[] = [];
    let usedTables = [tables[0]];
    fromClause = `[${this.selectedDatabase}].${tables[0].split('.').map(x => `[${x}]`).join('.')}`;

    for (let i = 1; i < tables.length; i++) {
      const [schema, table] = tables[i].split('.');
      let found = false;
      for (const used of usedTables) {
        const [usedSchema, usedTable] = used.split('.');
        const rel = this.foreignKeys.find(fk =>
          (fk.PARENT_TABLE === usedTable && fk.REF_TABLE === table) ||
          (fk.PARENT_TABLE === table && fk.REF_TABLE === usedTable)
        );
        if (rel) {
          if (rel.PARENT_TABLE === usedTable) {
            joins.push(`INNER JOIN [${this.selectedDatabase}].[${schema}].[${table}] ON [${usedTable}].[${rel.PARENT_COLUMN}] = [${table}].[${rel.REF_COLUMN}]`);
          } else {
            joins.push(`INNER JOIN [${this.selectedDatabase}].[${usedSchema}].[${usedTable}] ON [${table}].[${rel.PARENT_COLUMN}] = [${usedTable}].[${rel.REF_COLUMN}]`);
          }
          found = true;
          break;
        }
      }
      if (!found) {
        joins.push(`CROSS JOIN [${this.selectedDatabase}].[${schema}].[${table}]`);
      }
      usedTables.push(tables[i]);
    }

    return `SELECT\n    ${selectFields}\nFROM ${fromClause}\n    ${joins.join('\n    ')};`;
  }

  startEditingSql() {
    this.manualSql = this.generatedQuery;
    this.editingSql = true;
  }

  saveManualSql() {
    this.editingSql = false;
  }

  cancelEditingSql() {
    this.editingSql = false;
    this.manualSql = '';
  }

  onMenuAction1() {
    const nombreModulo = prompt('Nombre del nuevo módulo (ej: md_escolar):');
    if (!nombreModulo) return;
    const sqlScript = this.manualSql || this.generatedQuery;
    const { COLUMNS, DATABASE, TABLE_SCHEMA, TABLE_NAME, ID_COLUMN } =
      this.extractSqlParts(sqlScript);

    if (!ID_COLUMN) {
      alert(
        'No se pudo determinar la columna ID (PK). Selecciona al menos una columna o revisa la tabla.'
      );
      return;
    }

    // Genera los valores para INSERT
const { INSERT_COLUMNS, INSERT_VALUES, INPUTS } = this.generateInsertParts(
  this.selectedFields,
  ID_COLUMN
);
const UPDATE_SET = this.generateUpdateSet(this.selectedFields, ID_COLUMN);

    // Genera los campos de la interfaz
    const INTERFACE_FIELDS = this.generateInterfaceFields(this.selectedFields);

    // Validación: debe haber al menos un campo distinto de la PK
    const camposSinPK = this.selectedFields.filter(f => f.COLUMN_NAME !== ID_COLUMN);
    if (!INSERT_COLUMNS || !INSERT_VALUES || !UPDATE_SET || camposSinPK.length === 0) {
      alert('Selecciona al menos un campo (que no sea la PK) para poder generar el módulo correctamente.');
      return;
    }

    this.http
      .post('http://localhost:3000/api/clonar-modulo', {
        nombreModulo,
        COLUMNS,
        DATABASE,
        TABLE_SCHEMA,
        TABLE_NAME,
        ID_COLUMN,
        INSERT_COLUMNS,
        INSERT_VALUES,
        UPDATE_SET,
        INPUTS,
        INTERFACE_FIELDS,
      })
      .subscribe({
        next: (resp: any) => alert(resp.message),
        error: (err) => alert('Error: ' + (err.error?.error || err.message)),
      });
  }

  extractSqlParts(sqlScript: string) {
    // Extrae columnas
    const selectMatch = sqlScript.match(/SELECT\s+([\s\S]+?)\s+FROM/i);
    const COLUMNS = selectMatch
      ? selectMatch[1].replace(/\s+/g, ' ').replace(/,$/, '').trim()
      : '';

    // Extrae FROM
    const fromMatch = sqlScript.match(
      /FROM\s+\[([^\]]+)\]\.\[([^\]]+)\]\.\[([^\]]+)\]/i
    );
    const DATABASE = fromMatch ? fromMatch[1] : '';
    const TABLE_SCHEMA = fromMatch ? fromMatch[2] : '';
    const TABLE_NAME = fromMatch ? fromMatch[3] : '';

    // Busca la PK real
    let ID_COLUMN = this.getPrimaryKey(TABLE_NAME);
    // Si no hay PK, usa la primera columna seleccionada como fallback
    if (!ID_COLUMN && COLUMNS) {
      ID_COLUMN = COLUMNS.split(',')[0].trim();
    }

    return { COLUMNS, DATABASE, TABLE_SCHEMA, TABLE_NAME, ID_COLUMN };
  }

  getPrimaryKey(table: string): string | null {
    // Busca en foreignKeys si hay una PK para la tabla seleccionada
    // Suponiendo que tu backend te da la PK en foreignKeys o puedes agregar un endpoint para PKs
    const pk = this.foreignKeys.find(
      (fk) => fk.PARENT_TABLE === table && fk.FK_NAME && fk.PARENT_COLUMN
    );
    return pk ? pk.PARENT_COLUMN : null;
  }

  generateInsertParts(selectedFields: any[], idColumn: string): {
    INSERT_COLUMNS: string;
    INSERT_VALUES: string;
    INPUTS: string;
  } {
    if (!selectedFields || selectedFields.length === 0) {
      return { INSERT_COLUMNS: '', INSERT_VALUES: '', INPUTS: '' };
    }
    // Normaliza el nombre de la PK
    const pkSimple = idColumn.split('.').pop()?.replace(/[\[\]]/g, '') ?? idColumn;
    const camposSinPK = selectedFields.filter(f => f.COLUMN_NAME !== pkSimple);
    const columns = camposSinPK.map((f) => f.COLUMN_NAME);
    const INSERT_COLUMNS = columns.join(', ');
    const INSERT_VALUES = columns.map((col) => `@${col}`).join(', ');
    const INPUTS = camposSinPK
      .map((f) => `.input('${f.COLUMN_NAME}', mssql.VarChar, data.${f.COLUMN_NAME})`)
      .join('\n        ');
    return { INSERT_COLUMNS, INSERT_VALUES, INPUTS };
  }

  generateUpdateSet(selectedFields: any[], idColumn: string): string {
    const pkSimple = idColumn.split('.').pop()?.replace(/[\[\]]/g, '') ?? idColumn;
    return selectedFields
      .filter((f) => f.COLUMN_NAME !== pkSimple)
      .map((f) => `${f.COLUMN_NAME} = @${f.COLUMN_NAME}`)
      .join(',\n              ');
  }

  mapSqlTypeToTs(type: string): string {
    switch (type.toLowerCase()) {
      case 'int':
      case 'smallint':
      case 'tinyint':
      case 'bigint':
      case 'decimal':
      case 'numeric':
      case 'float':
      case 'real':
        return 'number';
      case 'bit':
        return 'boolean';
      case 'date':
      case 'datetime':
      case 'datetime2':
      case 'smalldatetime':
      case 'time':
        return 'string'; // o 'Date' si prefieres
      default:
        return 'string';
    }
  }

  generateInterfaceFields(selectedFields: any[]): string {
    return selectedFields
      .map(f => `${f.COLUMN_NAME}: ${this.mapSqlTypeToTs(f.DATA_TYPE)};`)
      .join('\n  ');
  }

  runQuery() {
  const duplicates = this.checkDuplicateColumns();
  if (duplicates.length > 0) {
    alert(
      'Advertencia: Hay columnas duplicadas seleccionadas (' +
      duplicates.join(', ') +
      '). Considera usar alias para evitar errores en el SQL.'
    );
    // Si quieres bloquear la ejecución, agrega: return;
  }

  const sql = this.manualSql || this.generatedQuery;
  this.http.post<any[]>('http://localhost:3000/api/ejecutar-sql', { sql }).subscribe({
    next: (data) => {
      const columns = data.length ? Object.keys(data[0]) : [];
      this.dialog.open(QueryResultDialogComponent, {
        width: '90vw',
        maxWidth: '100vw',
        data: { columns, rows: data }
      });
    },
    error: (err) => {
      alert('SQL inválido o error en la consulta:\n' + (err.error?.error || err.message));
    }
  });
}

checkDuplicateColumns(): string[] {
  const colCount: { [key: string]: number } = {};
  this.selectedFields.forEach(f => {
    colCount[f.COLUMN_NAME] = (colCount[f.COLUMN_NAME] || 0) + 1;
  });
  return Object.keys(colCount).filter(col => colCount[col] > 1);
}

filteredTables() {
  if (!this.tableFilter) return this.tables;
  const filter = this.tableFilter.toLowerCase();
  return this.tables.filter(
    t => t.TABLE_SCHEMA && t.TABLE_SCHEMA.toLowerCase().includes(filter)
  );
}

generateSqlFragments(selectedFields: any[], primaryKey: string) {
  // Excluye la PK para INSERT y UPDATE SET
  const fieldsWithoutPK = selectedFields.filter(f => f.COLUMN_NAME !== primaryKey);

  // .input() para create y update (sin PK)
  const INPUTS = fieldsWithoutPK.map(f =>
    `.input('${f.COLUMN_NAME}', mssql.VarChar, data.${f.COLUMN_NAME})`
  ).join('\n        ');

  // Columnas y valores para INSERT (sin PK)
  const INSERT_COLUMNS = fieldsWithoutPK.map(f => f.COLUMN_NAME).join(', ');
  const INSERT_VALUES = fieldsWithoutPK.map(f => `@${f.COLUMN_NAME}`).join(', ');

  // SET para UPDATE (sin PK)
  const UPDATE_SET = fieldsWithoutPK.map(f => `${f.COLUMN_NAME} = @${f.COLUMN_NAME}`).join(',\n              ');

  // .input() para el WHERE del update (solo PK)
  const INPUT_ID = `.input('ID', mssql.Int, id)`;

  // WHERE para update
  const WHERE = `${primaryKey} = @ID`;

  return {
    INPUTS,
    INSERT_COLUMNS,
    INSERT_VALUES,
    UPDATE_SET,
    INPUT_ID,
    WHERE
  };
}
}