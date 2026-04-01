import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AuthPageComponent } from './features/auth/auth-page.component';
import { ProductListPageComponent } from './features/product/product-list-page.component';
import { ProductDetailsPageComponent } from './features/product/product-details-page.component';
import { CartPageComponent } from './features/cart/cart-page.component';
import { OrdersPageComponent } from './features/order/orders-page.component';
import { ProfilePageComponent } from './features/user/profile-page.component';
import { AdminDashboardPageComponent } from './features/admin/admin-dashboard-page.component';

export const routes: Routes = [
  { path: '', component: ProductListPageComponent },
  { path: 'auth', component: AuthPageComponent },
  { path: 'products/:id', component: ProductDetailsPageComponent },
  { path: 'cart', component: CartPageComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrdersPageComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfilePageComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardPageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
