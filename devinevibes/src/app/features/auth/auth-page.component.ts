import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormErrorService } from '../../core/services/form-error.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-auth-page',
  imports: [ReactiveFormsModule],
  template: `
    <section class="card auth">
      <h2>Welcome to Devine Vibes</h2>
      <p>Login with OTP or Google token.</p>

      <form [formGroup]="otpForm" (ngSubmit)="sendOtp()">
        <input formControlName="phone" placeholder="Phone number" />
        <small class="error">{{ formErrors.errors()['phone'] }}</small>
        <button class="btn" type="submit">Send OTP</button>
      </form>

      <form [formGroup]="verifyForm" (ngSubmit)="verifyOtp()">
        <input formControlName="phone" placeholder="Phone number" />
        <input formControlName="otp" placeholder="OTP" />
        <small class="error">{{ formErrors.errors()['otp'] }}</small>
        <button class="btn primary" type="submit">Verify OTP</button>
      </form>

      <form [formGroup]="googleForm" (ngSubmit)="googleLogin()">
        <textarea formControlName="idToken" rows="3" placeholder="Paste Google idToken"></textarea>
        <button class="btn" type="submit">Google Login</button>
      </form>
    </section>
  `,
  styles: [`.auth{max-width:560px;margin:2rem auto;display:grid;gap:1rem}.error{color:var(--danger)} form{display:grid;gap:.5rem}`]
})
export class AuthPageComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly formErrors = inject(FormErrorService);
  private readonly notification = inject(NotificationService);

  protected readonly otpForm = this.fb.group({ phone: ['', Validators.required] });
  protected readonly verifyForm = this.fb.group({ phone: ['', Validators.required], otp: ['', Validators.required] });
  protected readonly googleForm = this.fb.group({ idToken: ['', Validators.required] });

  sendOtp(): void {
    if (this.otpForm.invalid) return;
    this.authService.sendOtp(this.otpForm.getRawValue() as { phone: string }).subscribe(() => {
      this.notification.show('OTP sent', 'success');
    });
  }

  verifyOtp(): void {
    if (this.verifyForm.invalid) return;
    this.authService.verifyOtp(this.verifyForm.getRawValue() as { phone: string; otp: string }).subscribe(() => {
      void this.router.navigate(['/']);
    });
  }

  googleLogin(): void {
    if (this.googleForm.invalid) return;
    this.authService.loginWithGoogle(this.googleForm.getRawValue() as { idToken: string }).subscribe(() => {
      void this.router.navigate(['/']);
    });
  }
}
