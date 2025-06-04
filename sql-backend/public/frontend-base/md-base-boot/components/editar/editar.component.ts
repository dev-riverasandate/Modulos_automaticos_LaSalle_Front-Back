import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { [Modulocamel]Service } from '../../services/[nom-backend].service';
import { [Modulocamel]Item } from '../../interfaces/[nom-backend].interface';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.css']
})
export class EditarComponent implements OnInit {
  form: Partial<[Modulocamel]Item> = {};
  columnas: string[] = [];
  id: number | null = null;

  constructor(
    private service: [Modulocamel]Service,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getAll().subscribe(items => {
      const item = items.find(i => i['[PRIMARY_KEY]'] === this.id);
      if (item) {
        this.form = { ...item };
        this.columnas = Object.keys(item).filter(col => col !== '[PRIMARY_KEY]');
      }
    });
  }

  guardar() {
    if (this.id) {
      this.service.update(this.id, this.form).subscribe(() => {
        this.router.navigate(['/[nom-backend]']);
      });
    }
  }

  cancelar() {
    this.router.navigate(['/[nom-backend]']);
  }
}