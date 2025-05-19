import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { DatabaseService } from '../services/database.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCheckboxModule } from '@angular/material/checkbox';


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

  constructor(private databaseService: DatabaseService) {}

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
      this.tableColumns[table] = columns;
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
}