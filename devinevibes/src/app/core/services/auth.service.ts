import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthResponse, GoogleLoginRequest, OtpRequest, OtpVerifyRequest } from '../../shared/models/auth.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accessTokenKey = 'dv_access_token';
  private readonly refreshTokenKey = 'dv_refresh_token';
  readonly isAuthenticated = signal<boolean>(!!this.getAccessToken());

  constructor(private readonly api: ApiService) {}

  loginWithGoogle(payload: GoogleLoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/google', payload).pipe(tap((res) => this.setSession(res)));
  }

  sendOtp(payload: OtpRequest): Observable<void> {
    return this.api.post<void>('/auth/send-otp', payload);
  }

  verifyOtp(payload: OtpVerifyRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/verify-otp', payload).pipe(tap((res) => this.setSession(res)));
  }

  refreshToken(): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/refresh', { refreshToken: this.getRefreshToken() }).pipe(
      tap((res) => this.setSession(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.isAuthenticated.set(false);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  private setSession(authResponse: AuthResponse): void {
    localStorage.setItem(this.accessTokenKey, authResponse.accessToken);
    localStorage.setItem(this.refreshTokenKey, authResponse.refreshToken);
    this.isAuthenticated.set(true);
  }
}
