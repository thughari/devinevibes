import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  warning?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="p-8 sm:p-10 max-w-sm mx-auto animate-in fade-in zoom-in duration-300">
      <div class="text-center">
        <div 
          class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 transition-all duration-700 hover:rotate-12 hover:scale-110 shadow-inner"
          [class.bg-red-50]="data.isDestructive"
          [class.text-red-500]="data.isDestructive"
          [class.bg-brand-gold/10]="!data.isDestructive"
          [class.text-brand-gold]="!data.isDestructive"
        >
          <mat-icon class="text-[36px] w-[36px] h-[36px]">{{ data.isDestructive ? 'delete_outline' : 'help_outline' }}</mat-icon>
        </div>

        <h2 class="text-3xl font-serif font-bold text-brand-dark mb-4 tracking-tight">
          {{ data.title }}
        </h2>
        
        <p class="text-lg text-brand-text font-sans font-medium leading-relaxed mb-6 tracking-tight">
          {{ data.message }}
        </p>

        @if (data.warning) {
          <div class="bg-red-50 border border-red-100 rounded-2xl p-5 mb-8 text-left flex gap-4 items-start shadow-sm">
            <mat-icon class="text-red-500 shrink-0 mt-0.5">warning_amber</mat-icon>
            <p class="text-sm text-red-700 font-semibold leading-snug">
              {{ data.warning }}
            </p>
          </div>
        } @else {
          <p class="text-sm text-brand-text/60 font-light mb-10 italic">This action cannot be undone.</p>
        }

        <div class="flex flex-col sm:flex-row gap-4">
          <button 
            (click)="dialogRef.close(false)"
            class="flex-1 px-8 py-4 border border-gray-100 text-brand-text rounded-2xl font-bold hover:bg-gray-50 transition-all duration-300 order-2 sm:order-1 active:scale-95 shadow-sm"
          >
            {{ data.cancelText || 'Cancel' }}
          </button>
          <button 
            (click)="dialogRef.close(true)"
            class="flex-1 px-8 py-4 text-white rounded-2xl font-bold transition-all duration-300 shadow-xl order-1 sm:order-2 active:scale-95"
            [class.bg-red-600]="data.isDestructive"
            [class.hover:bg-red-500]="data.isDestructive"
            [class.shadow-red-500/30]="data.isDestructive"
            [class.bg-brand-green]="!data.isDestructive"
            [class.hover:bg-brand-green-dark]="!data.isDestructive"
            [class.shadow-brand-green/30]="!data.isDestructive"
          >
            {{ data.confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; border-radius: 24px; overflow: hidden; background: white; }
  `]
})
export class ConfirmDialogComponent {
  data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
}
