import { Component, inject } from '@angular/core';
import { SnackbarService } from '../../services/snackbar.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-snackbar-container',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      @for (msg of snackbarService.messages(); track msg.id) {
        <div 
          class="px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] pointer-events-auto transition-all duration-300 animate-in slide-in-from-bottom-5"
          [class.bg-green-50]="msg.type === 'success'"
          [class.text-green-800]="msg.type === 'success'"
          [class.border]="true"
          [class.border-green-200]="msg.type === 'success'"
          
          [class.bg-red-50]="msg.type === 'error'"
          [class.text-red-800]="msg.type === 'error'"
          [class.border-red-200]="msg.type === 'error'"
          
          [class.bg-blue-50]="msg.type === 'info'"
          [class.text-blue-800]="msg.type === 'info'"
          [class.border-blue-200]="msg.type === 'info'"
        >
          <mat-icon class="text-[20px]">
            {{ msg.type === 'success' ? 'check_circle' : msg.type === 'error' ? 'error' : 'info' }}
          </mat-icon>
          <span class="flex-1 text-sm font-medium">{{ msg.message }}</span>
          <button (click)="snackbarService.removeMessage(msg.id)" class="opacity-50 hover:opacity-100 transition-opacity flex items-center">
            <mat-icon class="text-[20px]">close</mat-icon>
          </button>
        </div>
      }
    </div>
  `
})
export class SnackbarContainerComponent {
  snackbarService = inject(SnackbarService);
}
