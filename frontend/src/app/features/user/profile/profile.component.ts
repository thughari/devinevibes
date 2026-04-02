import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <section class="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <h1 class="text-2xl sm:text-3xl font-bold text-brand-dark mb-6">My Profile</h1>
      <form [formGroup]="form" (ngSubmit)="save()" class="bg-white border border-gray-100 rounded-xl p-4 sm:p-6 space-y-4 shadow-sm">
        <label class="block">
          <span class="text-sm text-brand-text">Name</span>
          <input formControlName="name" class="mt-1 w-full border rounded-md px-3 py-2" />
        </label>
        <label class="block">
          <span class="text-sm text-brand-text">Email</span>
          <input formControlName="email" class="mt-1 w-full border rounded-md px-3 py-2" />
        </label>
        <label class="block">
          <span class="text-sm text-brand-text">Phone</span>
          <input formControlName="phone" class="mt-1 w-full border rounded-md px-3 py-2" />
        </label>
        <button type="submit" [disabled]="form.invalid" class="bg-brand-green text-white px-4 py-2 rounded-md">Save changes</button>
      </form>
    </section>
  `
})
export class ProfileComponent {
  auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private snackbar = inject(SnackbarService);

  form = this.fb.group({
    name: [this.auth.currentUser()?.name || '', Validators.required],
    email: [this.auth.currentUser()?.email || '', Validators.email],
    phone: [this.auth.currentUser()?.phone || '']
  });

  save() {
    if (this.form.invalid) return;
    this.auth.updateProfile(this.form.value).subscribe({
      next: () => this.snackbar.showSuccess('Profile updated successfully')
    });
  }
}
