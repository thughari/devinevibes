export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  provider: string;
  role: string;
  createdAt?: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface AddressRequest {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  label?: string;
  isDefault: boolean;
}

export interface AddressResponse extends AddressRequest {
  id: string;
  createdAt: string;
}
