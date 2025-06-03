import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { AgregarComponent } from './components/agregar/agregar.component';
import { EditarComponent } from './components/editar/editar.component';
import { EliminarComponent } from './components/eliminar/eliminar.component';

export const ROUTES_[MODULO_MAYUS]: Routes = [
  { path: '', component: InicioComponent },
  { path: 'agregar', component: AgregarComponent },
  { path: 'editar/:id', component: EditarComponent },
  { path: 'eliminar/:id', component: EliminarComponent },
];