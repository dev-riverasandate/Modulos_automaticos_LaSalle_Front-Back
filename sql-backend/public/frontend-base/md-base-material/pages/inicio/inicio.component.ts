import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { [Modulocamel]Service } from '../../services/[nom-backend].service';
import { [Modulocamel]Item } from '../../interfaces/[nom-backend].interface';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressBarModule
  ]
})
export class InicioComponent implements OnInit {
  items: [Modulocamel]Item[] = [];
  columnas: string[] = [];
  primaryKey: string = '[PRIMARY_KEY]'; // Este marcador será reemplazado por la PK real
  cargando = false;

  constructor(private service: [Modulocamel]Service) {}

  ngOnInit() {
    this.cargarItems();
  }

  cargarItems() {
    this.cargando = true;
    this.service.getAll().subscribe({
      next: (data) => {
        this.items = data;
        if (data && data.length > 0) {
          this.columnas = Object.keys(data[0]);
        }
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }
}