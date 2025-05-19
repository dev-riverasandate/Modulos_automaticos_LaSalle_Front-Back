import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-database-viewer',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule],
  templateUrl: './database-viewer.component.html',
  styleUrls: ['./database-viewer.component.scss']
})
export class DatabaseViewerComponent implements OnInit {
  databases: any[] = [];
  loading = false;
  error: string | null = null;

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
}