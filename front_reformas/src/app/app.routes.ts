import { Routes } from '@angular/router';
import { Solicitudesadmin } from './components/solicitudesadmin/solicitudesadmin';
import { Detallessolicitudes } from './components/detallessolicitudes/detallessolicitudes';

export const routes: Routes = [
  {
    path: '',
    component: Solicitudesadmin
  },
  {
    path: 'solicitudes/:id',
    component: Detallessolicitudes
  }
];
