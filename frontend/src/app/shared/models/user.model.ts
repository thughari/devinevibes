export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImageUrl: string;
  provider: string;
  role: string;
  createdAt?: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
}
