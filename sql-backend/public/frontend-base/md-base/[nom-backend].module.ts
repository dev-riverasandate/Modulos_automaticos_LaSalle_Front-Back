import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ROUTES_[MODULO_MAYUS] } from './[nom-backend].routes';
import { InicioComponent } from './pages/inicio/inicio.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTES_[MODULO_MAYUS]),
    InicioComponent // <-- Importa el componente standalone aquí
  ],
})
export class MdBaseModule {}

 