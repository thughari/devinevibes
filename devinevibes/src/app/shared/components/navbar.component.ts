import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  template: `
    <header class="nav-wrap">
      <div class="nav">
        <a routerLink="/" class="brand">
          <span class="brand-mark">✦</span>
          <span>Devine Vibes</span>
        </a>

        <nav>
          <a routerLink="/" class="active">Home</a>
          <a routerLink="/">Store</a>
          <a routerLink="/orders">Orders</a>
          <a routerLink="/profile">My Account</a>
          <a routerLink="/cart" class="cart-link">Cart</a>
          @if (authService.isAuthenticated()) {
            <button class="btn" (click)="logout()">Logout</button>
          } @else {
            <a routerLink="/auth" class="btn">Login</a>
          }
        </nav>
      </div>
    </header>
  `,
  styles: [
    `.nav-wrap{padding:1rem 1.25rem;position:sticky;top:0;z-index:10;background:rgba(15,15,15,.95);backdrop-filter:blur(8px)}`,
    `.nav{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;background:#f2f2f2;border-radius:16px;padding:.9rem 1.25rem}`,
    `.brand{display:flex;align-items:center;gap:.55rem;font-size:1.5rem;color:#1f2330;font-weight:700}`,
    `.brand-mark{display:inline-flex;height:28px;width:28px;border-radius:8px;background:#d4af37;color:#161616;align-items:center;justify-content:center;font-size:14px}`,
    `nav{display:flex;align-items:center;gap:1.1rem} nav a{color:#1f2330;font-weight:500}.active{color:#b28918}.cart-link{font-weight:700}`
  ]
})
export class NavbarComponent {
  protected readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
