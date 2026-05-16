import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { AdminLayout } from './layout/admin-layout/admin-layout';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'mesas',
        loadComponent: () =>
          import('./features/mesas/mesas').then(m => m.Mesas)
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/categorias/categorias').then(m => m.Categorias)
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/productos/productos').then(m => m.Productos)
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./features/inventario/inventario').then(m => m.InventarioComponent)
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('./features/ventas/ventas').then(m => m.Ventas)
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./features/pedidos/pedidos').then(m => m.Pedidos)
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./features/roles/roles').then(m => m.Roles)
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/usuarios').then(m => m.Usuarios)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
