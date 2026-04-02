import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';
import { AddressResponse } from '../../../shared/models/user.model';

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

      <div class="mt-8 bg-white border border-gray-100 rounded-xl p-4 sm:p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-brand-dark mb-4">Saved Addresses</h2>
        <form [formGroup]="addressForm" (ngSubmit)="addAddress()" class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <input formControlName="label" placeholder="Label (Home/Work)" class="border rounded-md px-3 py-2" />
          <input formControlName="line1" placeholder="Address line 1*" class="border rounded-md px-3 py-2" />
          <input formControlName="line2" placeholder="Address line 2" class="border rounded-md px-3 py-2" />
          <input formControlName="city" placeholder="City*" class="border rounded-md px-3 py-2" />
          <input formControlName="state" placeholder="State*" class="border rounded-md px-3 py-2" />
          <input formControlName="postalCode" placeholder="PIN / Postal code*" class="border rounded-md px-3 py-2" />
          <input formControlName="country" placeholder="Country*" class="border rounded-md px-3 py-2" />
          <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="isDefault" /> Set as default</label>
          <button type="submit" [disabled]="addressForm.invalid" class="sm:col-span-2 bg-brand-dark text-white px-4 py-2 rounded-md">
            {{ editingAddressId ? 'Update Address' : 'Add Address' }}
          </button>
        </form>

        <div class="space-y-3">
          @for (address of addresses; track address.id) {
            <div class="border border-gray-200 rounded-lg p-3 flex justify-between gap-4">
              <div>
                <p class="font-medium">{{ address.label || 'Address' }} @if (address.isDefault) { <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2">Default</span> }</p>
                <p class="text-sm text-brand-text">{{ address.line1 }}, {{ address.line2 }}</p>
                <p class="text-sm text-brand-text">{{ address.city }}, {{ address.state }} - {{ address.postalCode }}, {{ address.country }}</p>
              </div>
              <div class="flex flex-col gap-2">
                <button type="button" (click)="editAddress(address)" class="text-brand-green text-sm">Edit</button>
                <button type="button" (click)="deleteAddress(address.id)" class="text-red-600 text-sm">Delete</button>
              </div>
            </div>
          } @empty {
            <p class="text-sm text-brand-text">No saved addresses yet.</p>
          }
        </div>
      </div>
    </section>
  `
})
export class ProfileComponent {
  auth = inject(AuthService);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private snackbar = inject(SnackbarService);
  addresses: AddressResponse[] = [];
  editingAddressId: string | null = null;

  form = this.fb.group({
    name: [this.auth.currentUser()?.name || '', Validators.required],
    email: [this.auth.currentUser()?.email || '', Validators.email],
    phone: [this.auth.currentUser()?.phone || '']
  });

  addressForm = this.fb.group({
    label: ['Home'],
    line1: ['', Validators.required],
    line2: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: ['India', Validators.required],
    isDefault: [false]
  });

  constructor() {
    this.loadAddresses();
  }

  save() {
    if (this.form.invalid) return;
    this.auth.updateProfile(this.form.value).subscribe({
      next: () => this.snackbar.showSuccess('Profile updated successfully')
    });
  }

  loadAddresses() {
    this.api.get<AddressResponse[]>('/user/addresses').subscribe({
      next: (addresses) => this.addresses = addresses,
      error: () => this.snackbar.showError('Unable to load saved addresses')
    });
  }

  addAddress() {
    if (this.addressForm.invalid) return;
    const request = this.addressForm.value;
    const call = this.editingAddressId
      ? this.api.put<AddressResponse>(`/user/addresses/${this.editingAddressId}`, request)
      : this.api.post<AddressResponse>('/user/addresses', request);

    call.subscribe({
      next: () => {
        this.snackbar.showSuccess(this.editingAddressId ? 'Address updated' : 'Address added');
        this.editingAddressId = null;
        this.addressForm.patchValue({ label: 'Home', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false });
        this.loadAddresses();
      },
      error: () => this.snackbar.showError('Unable to save address')
    });
  }

  deleteAddress(id: string) {
    this.api.delete<void>(`/user/addresses/${id}`).subscribe({
      next: () => {
        this.snackbar.showInfo('Address removed');
        this.loadAddresses();
      },
      error: () => this.snackbar.showError('Unable to delete address')
    });
  }

  editAddress(address: AddressResponse) {
    this.editingAddressId = address.id;
    this.addressForm.patchValue({
      label: address.label || 'Home',
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: !!address.isDefault
    });
  }
}
