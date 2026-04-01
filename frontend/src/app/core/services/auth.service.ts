import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuthResponse, GoogleLoginRequest, OtpRequest, OtpVerifyRequest } from '../../shared/models/auth.model';
import { UserProfileResponse } from '../../shared/models/user.model';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

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
          error: () => this.logout()
        });
      }
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  setTokens(auth: AuthResponse) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.TOKEN_KEY, auth.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, auth.refreshToken);
    }
    this.isAuthenticated.set(true);
  }

  clearTokens() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
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

  register(email: string, password: string, name: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', { email, password, name }).pipe(
      tap(res => {
        this.setTokens(res);
        this.fetchProfile().subscribe();
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', { email, password }).pipe(
      tap(res => {
        this.setTokens(res);
        this.fetchProfile().subscribe();
      })
    );
  }

  requestOtp(data: OtpRequest): Observable<unknown> {
    return this.api.post('/auth/send-otp', data);
  }

  verifyOtp(data: OtpVerifyRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/otp/verify', data).pipe(
      tap(res => {
        this.setTokens(res);
        this.fetchProfile().subscribe();
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }
    return this.api.post<AuthResponse>('/auth/refresh', { refreshToken }).pipe(
      tap(res => this.setTokens(res)),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  fetchProfile(): Observable<UserProfileResponse> {
    return this.api.get<UserProfileResponse>('/users/me').pipe(
      tap(profile => this.currentUser.set(profile))
    );
  }

  logout() {
    this.clearTokens();
    this.router.navigate(['/auth/login']);
  }
}
