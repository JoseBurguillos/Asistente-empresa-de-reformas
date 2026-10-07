import { Routes } from '@angular/router';
import { Solicitudesadmin } from './components/solicitudesadmin/solicitudesadmin';
import { Detallessolicitudes } from './components/detallessolicitudes/detallessolicitudes';
import { Login } from './components/login/login';
import { Agenda } from './components/agenda/agenda';
import { Clientes } from './components/clientes/clientes';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: '',
    component: Solicitudesadmin,
    canActivate: [authGuard]
  },
  {
    path: 'agenda',
    component: Agenda,
    canActivate: [authGuard]
  },
  {
    path: 'clientes',
    component: Clientes,
    canActivate: [authGuard]
  },
  {
    path: 'solicitudes/:id',
    component: Detallessolicitudes,
    canActivate: [authGuard]
  }
];
