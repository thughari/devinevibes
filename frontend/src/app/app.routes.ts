import {Routes} from '@angular/router';
import { adminGuard, authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./features/product/product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/product/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'shipping',
    loadComponent: () => import('./features/static/shipping.component').then(m => m.ShippingComponent)
  },
  {
    path: 'returns',
    loadComponent: () => import('./features/static/returns.component').then(m => m.ReturnsComponent)
  },
  {
    path: 'faq',
    loadComponent: () => import('./features/static/faq.component').then(m => m.FaqComponent)
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () => import('./features/order/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'order/history',
    canActivate: [authGuard],
    loadComponent: () => import('./features/order/order-history/order-history.component').then(m => m.OrderHistoryComponent)
  },
  {
    path: 'order/tracking/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/order/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'user/profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/user/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
