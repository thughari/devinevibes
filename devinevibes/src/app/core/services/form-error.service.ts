import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FormErrorService {
  readonly errors = signal<Record<string, string>>({});

  setErrors(errors: Record<string, string>): void {
    this.errors.set(errors);
  }

  clear(): void {
    this.errors.set({});
  }
}
