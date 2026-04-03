import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { StoreConfigResponse } from '../../shared/models/config.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private api = inject(ApiService);
  
  config = signal<StoreConfigResponse | null>(null);

  constructor() {
    this.refreshConfig();
  }

  refreshConfig() {
    this.api.get<StoreConfigResponse>('/config').subscribe({
      next: (config) => this.config.set(config),
      error: (e) => console.error('Failed to load store config', e)
    });
  }

  updateConfig(config: StoreConfigResponse) {
    return this.api.put<StoreConfigResponse>('/admin/config', config);
  }
}
