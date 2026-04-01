import { Component, inject } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  template: `
    @if (notification.toast(); as toast) {
      <div class="toast" [class.error]="toast.type === 'error'">{{ toast.message }}</div>
    }
  `,
  styles: [
    `.toast{position:fixed;right:1rem;bottom:1rem;background:#202020;color:#fff;border-left:4px solid var(--gold);padding:.8rem 1rem;border-radius:.5rem;z-index:10}`,
    `.toast.error{border-left-color:var(--danger)}`
  ]
})
export class ToastComponent {
  protected readonly notification = inject(NotificationService);
}
