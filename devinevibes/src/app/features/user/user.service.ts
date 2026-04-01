import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { UserProfileResponse } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private readonly api: ApiService) {}

  me(): Observable<UserProfileResponse> {
    return this.api.get<UserProfileResponse>('/user/me');
  }
}
