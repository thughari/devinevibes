import { Injectable, signal } from '@angular/core';

export interface SnackbarMessage {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  messages = signal<SnackbarMessage[]>([]);
  private nextId = 0;

  showSuccess(message: string) {
    this.addMessage(message, 'success');
  }

  showError(message: string) {
    this.addMessage(message, 'error');
  }

  showInfo(message: string) {
    this.addMessage(message, 'info');
  }

  private addMessage(message: string, type: 'success' | 'error' | 'info') {
    const id = this.nextId++;
    this.messages.update(msgs => [...msgs, { message, type, id }]);
    
    setTimeout(() => {
      this.removeMessage(id);
    }, 4000);
  }

  removeMessage(id: number) {
    this.messages.update(msgs => msgs.filter(m => m.id !== id));
  }
}
