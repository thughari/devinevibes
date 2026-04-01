import { Component, OnInit, inject, signal } from '@angular/core';
import { UserService } from './user.service';
import { UserProfileResponse } from '../../shared/models/user.model';

@Component({
  selector: 'app-profile-page',
  template: `
    @if (profile(); as user) {
      <section class="card">
        <h2>{{ user.name }}</h2>
        <p>{{ user.email }}</p>
        <p>{{ user.phone }}</p>
        <p>Role: {{ user.role }}</p>
      </section>
    }
  `
})
export class ProfilePageComponent implements OnInit {
  private readonly userService = inject(UserService);
  protected readonly profile = signal<UserProfileResponse | null>(null);

  ngOnInit(): void {
    this.userService.me().subscribe((data) => this.profile.set(data));
  }
}
