import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  template: `
    <header class="nav">
      <a routerLink="/" class="brand">
        <img src="assets/devine-vibes-logo.jpeg" alt="Devine Vibes logo" />
        <span>Devine Vibes</span>
      </a>
      <nav>
        <a routerLink="/">Products</a>
        <a routerLink="/cart">Cart</a>
        <a routerLink="/orders">Orders</a>
        <a routerLink="/admin">Admin</a>
        @if (authService.isAuthenticated()) {
          <button class="btn" (click)="logout()">Logout</button>
        } @else {
          <a routerLink="/auth" class="btn">Login</a>
        }
      </nav>
    </header>
  `,
  styles: [
    `.nav{position:sticky;top:0;background:#0b0b0be6;backdrop-filter:blur(8px);display:flex;justify-content:space-between;align-items:center;padding:0.75rem 1.25rem;border-bottom:1px solid #222;z-index:5}`,
    `.brand{display:flex;align-items:center;gap:.6rem;font-weight:600;color:var(--gold)} img{height:34px;width:34px;border-radius:50%;object-fit:cover}`,
    `nav{display:flex;gap:1rem;align-items:center} nav a{color:#f4e8be}`
  ]
})
export class NavbarComponent {
  protected readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
