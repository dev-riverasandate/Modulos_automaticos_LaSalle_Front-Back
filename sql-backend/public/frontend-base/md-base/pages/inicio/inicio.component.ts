import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // <-- AGREGA ESTO
import { [Modulocamel]Service } from '../../services/[nom-backend].service';
import { [Modulocamel]Item } from '../../interfaces/[nom-backend].interface';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css', '../../base-styles.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule] // <-- AGREGA RouterModule AQUÍ
})
export class InicioComponent implements OnInit {
  items: [Modulocamel]Item[] = [];
  columnas: string[] = [];
  primaryKey: string = '[PRIMARY_KEY]'; // Este marcador será reemplazado por la PK real
  cargando = false;
  modalAbierto = false;
  editando: [Modulocamel]Item | null = null;
  form: Partial<[Modulocamel]Item> = {};

  constructor(private service: [Modulocamel]Service) {}

  ngOnInit() {
    this.cargarItems();
  }

  cargarItems() {
    this.cargando = true;
    this.service.getAll().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data); 
        this.items = data;
        if (data && data.length > 0) {
          this.columnas = Object.keys(data[0]);
        }
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  abrirNuevo() {
    this.editando = null;
    this.form = {};
    this.modalAbierto = true;
  }

  abrirEditar(item: [Modulocamel]Item) {
    console.log('Editando item:', item, 'PK:', this.primaryKey, 'Valor PK:', item[this.primaryKey]);
    this.editando = item;
    this.form = { ...item };
    //this.form[this.primaryKey] = item[this.primaryKey];
    this.modalAbierto = true;
  }

guardar() {
  if (this.editando) {
    const pkValue = this.form[this.primaryKey];
    if (!pkValue) {
      alert('No se encontró el valor de la clave primaria para editar.');
      return;
    }
    // ENVÍA el id en el body
    this.service.update(pkValue as number, this.form)
      .subscribe(() => {
        this.cargarItems();
        this.cerrarModal();
      });
  } else {
    this.service.create(this.form as Omit<[Modulocamel]Item, '[PRIMARY_KEY]'>).subscribe(() => {
      this.cargarItems();
      this.cerrarModal();
    });
  }
}

  eliminar(id: any) {
    if (confirm('¿Seguro que deseas eliminar este registro?')) {
      this.service.delete(id).subscribe(() => this.cargarItems());
    }
  }

  cerrarModal() {
    this.modalAbierto = false;
  }
}