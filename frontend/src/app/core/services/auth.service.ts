import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuthResponse, GoogleLoginRequest, OtpRequest, OtpVerifyRequest } from '../../shared/models/auth.model';
import { UpdateUserProfileRequest, UserProfileResponse } from '../../shared/models/user.model';
import { tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'dv_access_token';
  private readonly REFRESH_TOKEN_KEY = 'dv_refresh_token';

  currentUser = signal<UserProfileResponse | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = this.getAccessToken();
      if (token) {
        this.isAuthenticated.set(true);
        this.fetchProfile().subscribe({
          error: (err: HttpErrorResponse) => {
            if (err.status !== 401) {
              return;
            }
            this.refreshToken().subscribe({
              next: () => {
                this.fetchProfile().subscribe({
                  error: () => this.logout()
                });
              },
              error: () => this.logout()
            });
          }
        });
      }
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const rawToken = localStorage.getItem(this.TOKEN_KEY) || localStorage.getItem('token');
      if (!rawToken || rawToken === 'null' || rawToken === 'undefined') {
        return null;
      }
      return rawToken;
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (!refreshToken || refreshToken === 'null' || refreshToken === 'undefined') {
        return null;
      }
      return refreshToken;
    }
    return null;
  }

  setTokens(auth: AuthResponse) {
    if (typeof window !== 'undefined' && window.localStorage) {
      const accessToken = auth.accessToken || '';
      const refreshToken = auth.refreshToken || '';
      localStorage.setItem(this.TOKEN_KEY, accessToken);
      localStorage.setItem('token', accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
    this.isAuthenticated.set(true);
  }

  clearTokens() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem('token');
    }
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  loginWithGoogle(data: GoogleLoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/google', data).pipe(
      tap(res => {
        this.setTokens(res);
        this.fetchProfile().subscribe();
      })
    );
  }

  register(data: OtpRequest): Observable<unknown> {
    return this.requestOtp(data);
  }

  requestOtp(data: OtpRequest): Observable<unknown> {
    return this.api.post('/auth/send-otp', data);
  }

  verifyOtp(data: OtpVerifyRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/verify-otp', data).pipe(
      tap(res => {
        this.setTokens(res);
        this.fetchProfile().subscribe();
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    return this.api.post<AuthResponse>('/auth/refresh', { refreshToken }).pipe(
      tap(res => this.setTokens(res))
    );
  }

  fetchProfile(): Observable<UserProfileResponse> {
    return this.api.get<UserProfileResponse>('/user/me').pipe(
      tap(profile => this.currentUser.set(profile))
    );
  }

  updateProfile(data: UpdateUserProfileRequest): Observable<UserProfileResponse> {
    return this.api.put<UserProfileResponse>('/user/me', data).pipe(
      tap(profile => this.currentUser.set(profile))
    );
  }

  logout() {
    this.clearTokens();
    this.router.navigate(['/auth/login']);
  }
}
