import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';
import { AddressResponse, UserProfileResponse } from '../../../shared/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <section class="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-brand-dark">My Profile</h1>
        @if (!isEditingProfile()) {
          <button (click)="isEditingProfile.set(true)" class="flex items-center gap-1 text-sm font-medium text-brand-green hover:text-brand-gold transition-colors">
            <mat-icon class="text-[18px]">edit</mat-icon> Edit Profile
          </button>
        }
      </div>

      <div class="bg-white border border-gray-100 rounded-xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <!-- Decoration -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-bl-full -z-10"></div>
        
        @if (isEditingProfile()) {
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-5">
            <label class="block">
              <span class="text-sm font-medium text-brand-text mb-1 block">Full Name</span>
              <input formControlName="name" class="w-full border border-gray-300 focus:border-brand-green focus:ring focus:ring-brand-green/20 rounded-lg px-4 py-2.5 outline-none transition-all" />
            </label>
            <label class="block">
              <span class="text-sm font-medium text-brand-text mb-1 block">Email Address</span>
              <input formControlName="email" class="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-4 py-2.5 outline-none" readonly title="Email cannot be changed directly" />
            </label>
            <label class="block">
              <span class="text-sm font-medium text-brand-text mb-1 block">Phone Number</span>
              <input formControlName="phone" class="w-full border border-gray-300 focus:border-brand-green focus:ring focus:ring-brand-green/20 rounded-lg px-4 py-2.5 outline-none transition-all" />
            </label>
            <div class="flex gap-3 pt-2">
              <button type="submit" [disabled]="form.invalid" class="bg-brand-green text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-green-dark transition-colors disabled:opacity-50 shadow-sm">Save Changes</button>
              <button type="button" (click)="cancelEditProfile()" class="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </form>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p class="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Full Name</p>
              <p class="text-brand-dark font-serif text-xl sm:text-2xl">{{ auth.currentUser()?.name || '-' }}</p>
            </div>
            <div>
              <p class="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Email Address</p>
              <p class="text-brand-dark font-medium text-base">{{ auth.currentUser()?.email || '-' }}</p>
            </div>
            <div>
              <p class="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Phone Number</p>
              <p class="text-brand-dark font-medium text-base">{{ auth.currentUser()?.phone || '-' }}</p>
            </div>
          </div>
        }
      </div>

      <div class="mt-8 bg-white border border-gray-100 rounded-xl p-4 sm:p-6 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h2 class="text-xl font-semibold text-brand-dark">Saved Addresses</h2>
          <button type="button" (click)="startAddingNewAddress()" class="px-3 py-2 rounded-md border border-brand-green text-brand-green hover:bg-brand-green/10 transition-colors">
            Add New Address
          </button>
        </div>

        @if (isAddressLoading()) {
          <p class="text-sm text-brand-text mb-4">Loading saved addresses...</p>
        } @else if (!addresses.length) {
          <p class="text-sm text-brand-text mb-4">No saved addresses yet. Add your first address below.</p>
        }

        @if (showAddressForm()) {
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
          <button type="button" (click)="cancelAddress()" class="sm:col-span-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-md">Cancel</button>
        </form>
        }

        @if (!isAddressLoading() && addresses.length) {
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
        }
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
  showAddressForm = signal(false);
  isAddressLoading = signal(true);
  isEditingProfile = signal(false);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', Validators.email],
    phone: ['']
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
    // Populate form when currentUser data becomes available.
    const initialUser = this.auth.currentUser();
    if (initialUser) {
      this.applyUserToForm(initialUser);
    } else {
      this.auth.fetchProfile().subscribe({
        next: (profile) => this.applyUserToForm(profile),
        error: () => this.snackbar.showError('Unable to load profile.')
      });
    }

    effect(() => {
      const user = this.auth.currentUser();
      if (user && this.form.pristine) {
        this.applyUserToForm(user);
      }
    });

    this.loadAddresses();
  }

  private applyUserToForm(user: UserProfileResponse) {
    this.form.patchValue({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    });
  }

  cancelEditProfile() {
    this.isEditingProfile.set(false);
    const user = this.auth.currentUser();
    if (user) {
      this.applyUserToForm(user);
    }
  }

  save() {
    if (this.form.invalid) return;

    const { name, email, phone } = this.form.value;
    const payload = {
      ...(name != null ? { name } : {}),
      ...(email != null ? { email } : {}),
      ...(phone != null ? { phone } : {})
    };

    this.auth.updateProfile(payload).subscribe({
      next: () => {
        this.snackbar.showSuccess('Profile updated successfully');
        this.isEditingProfile.set(false);
      }
    });
  }

  loadAddresses() {
    this.isAddressLoading.set(true);
    this.api.get<AddressResponse[]>('/user/addresses').subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        this.showAddressForm.set(addresses.length === 0);
        this.isAddressLoading.set(false);
      },
      error: () => {
        this.snackbar.showError('Unable to load saved addresses');
        this.isAddressLoading.set(false);
      }
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
        this.showAddressForm.set(false);
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

  startAddingNewAddress() {
    this.editingAddressId = null;
    this.showAddressForm.set(true);
    this.addressForm.reset({
      label: 'Home',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: false
    });
  }

  editAddress(address: AddressResponse) {
    this.editingAddressId = address.id;
    this.showAddressForm.set(true);
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
    const ele = document.querySelector('form');
    if (ele) ele.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  cancelAddress() {
    this.editingAddressId = null;
    this.showAddressForm.set(false);
    this.addressForm.reset({ label: 'Home', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false });
  }
}

