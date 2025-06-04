import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- AGREGA ESTO
import { RouterModule } from '@angular/router';
import { ROUTES_[MODULO_MAYUS] } from './[nom-backend].routes';
import { InicioComponent } from './pages/inicio/inicio.component';
import { AgregarComponent } from './components/agregar/agregar.component';
import { EditarComponent } from './components/editar/editar.component';
import { EliminarComponent } from './components/eliminar/eliminar.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, // <-- AGREGA ESTO
    RouterModule.forChild(ROUTES_[MODULO_MAYUS]),
    InicioComponent // <-- SOLO aquí si es standalone
  ],
  declarations: [
    AgregarComponent,
    EditarComponent,
    EliminarComponent
  ]
})
export class MdBaseModule {}

