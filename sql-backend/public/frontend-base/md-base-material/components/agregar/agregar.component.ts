import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { [Modulocamel]Service } from '../../services/[nom-backend].service';
import { [Modulocamel]Item } from '../../interfaces/[nom-backend].interface';

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.component.html',
  styleUrls: ['./agregar.component.css']
})
export class AgregarComponent implements OnInit {
  form: Partial<[Modulocamel]Item> = {};
  columnas: string[] = [];

  constructor(private service: [Modulocamel]Service, private router: Router) {}

  ngOnInit() {
    // Obtener columnas dinámicamente (sin la PK)
    this.service.getAll().subscribe(items => {
      if (items && items.length > 0) {
        this.columnas = Object.keys(items[0]).filter(col => col !== '[PRIMARY_KEY]');
      }
    });
  }

  guardar() {
    this.service.create(this.form as Omit<[Modulocamel]Item, '[PRIMARY_KEY]'>).subscribe(() => {
      this.router.navigate(['/[nom-backend]']);
    });
  }

  cancelar() {
    this.router.navigate(['/[nom-backend]']);
  }
}