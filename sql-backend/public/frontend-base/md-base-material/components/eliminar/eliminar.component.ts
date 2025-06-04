import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { [Modulocamel]Service } from '../../services/[nom-backend].service';
import { [Modulocamel]Item } from '../../interfaces/[nom-backend].interface';

@Component({
  selector: 'app-eliminar',
  templateUrl: './eliminar.component.html',
  styleUrls: ['./eliminar.component.css']
})
export class EliminarComponent implements OnInit {
  item: [Modulocamel]Item | null = null;
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
      this.item = items.find(i => i['[PRIMARY_KEY]'] === this.id) || null;
      if (this.item) {
        this.columnas = Object.keys(this.item);
      }
    });
  }

  eliminar() {
    if (this.id) {
      this.service.delete(this.id).subscribe(() => {
        this.router.navigate(['/[nom-backend]']);
      });
    }
  }

  cancelar() {
    this.router.navigate(['/[nom-backend]']);
  }
}