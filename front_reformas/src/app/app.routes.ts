import { Routes } from '@angular/router';
import { Solicitudesadmin } from './components/solicitudesadmin/solicitudesadmin';
import { Detallessolicitudes } from './components/detallessolicitudes/detallessolicitudes';
import { Login } from './components/login/login';
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
    path: 'solicitudes/:id',
    component: Detallessolicitudes,
    canActivate: [authGuard]
  }
];
