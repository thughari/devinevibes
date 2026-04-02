export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface OtpRequest {
  phone?: string;
  email?: string;
  name?: string;
}

export interface OtpVerifyRequest {
  phone?: string;
  email?: string;
  otp: string;
  name?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
