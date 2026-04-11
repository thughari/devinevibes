import { Component, inject, signal, OnInit, OnDestroy, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { Banner } from '../../../shared/models/banner.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-announcement-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (activeBanner()) {
      <div class="relative bg-brand-green text-white px-4 py-2 sm:px-6 lg:px-8 overflow-hidden z-[1001]" 
           [class.bg-brand-red]="activeBanner()?.type === 'ALERT'"
           [class.bg-brand-gold]="activeBanner()?.type === 'SALE'">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex-1 flex items-center justify-center gap-4 text-xs sm:text-sm font-medium">
            <span class="flex items-center gap-2">
              <span class="animate-pulse">✨</span>
              {{ activeBanner()?.content }}
            </span>
            
            @if (countdownText()) {
              <span class="hidden sm:inline-flex bg-white/20 px-2 py-0.5 rounded font-mono text-xs">
                Ends in: {{ countdownText() }}
              </span>
            }

            @if (activeBanner()?.link) {
              <a [routerLink]="activeBanner()?.link" 
                 class="underline hover:text-white/80 transition-colors hidden sm:inline ml-2">
                Click here
              </a>
            }
          </div>

          @if (activeBanner()?.canDismiss) {
            <button (click)="dismiss()" class="p-1 hover:bg-white/10 rounded-full transition-colors ml-4">
              <span class="block w-4 h-4 text-white">✕</span>
            </button>
          }
        </div>
        
        <!-- Subtle progress bar for timer if any -->
        @if (countdownText()) {
          <div class="absolute bottom-0 left-0 h-0.5 bg-white/30 transition-all duration-1000"
               [style.width.%]="timerProgress()">
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .bg-brand-gold { background-color: #D4AF37; }
    .bg-brand-red { background-color: #C0392B; }
  `]
})
export class AnnouncementBannerComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  
  banners = signal<Banner[]>([]);
  currentIndex = signal(0);
  dismissedIds = signal<Set<string>>(new Set());
  
  activeBanner = computed(() => {
    const list = this.banners().filter(b => !this.dismissedIds().has(b.id));
    if (list.length === 0) return null;
    return list[this.currentIndex() % list.length];
  });

  countdownText = signal<string | null>(null);
  timerProgress = signal(100);
  private timerInterval?: any;
  private rotationInterval?: any;

  ngOnInit() {
    this.loadBanners();
    this.loadDismissed();
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.rotationInterval) clearInterval(this.rotationInterval);
  }

  private loadBanners() {
    this.api.get<Banner[]>('/banners').subscribe(data => {
      this.banners.set(data);
      if (data.length > 1) {
        this.startRotation();
      }
      this.startCountdown();
    });
  }

  private loadDismissed() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('dismissed_banners');
      if (saved) {
        this.dismissedIds.set(new Set(JSON.parse(saved)));
      }
    }
  }

  dismiss() {
    const banner = this.activeBanner();
    if (banner) {
      const current = new Set(this.dismissedIds());
      current.add(banner.id);
      this.dismissedIds.set(current);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('dismissed_banners', JSON.stringify(Array.from(current)));
      }
    }
  }

  private startCountdown() {
    this.timerInterval = setInterval(() => {
      const banner = this.activeBanner();
      if (!banner?.expiryDate) {
        this.countdownText.set(null);
        return;
      }

      const end = new Date(banner.expiryDate).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        this.countdownText.set(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      this.countdownText.set(`${hours}h ${mins}m ${secs}s`);
      
      // Calculate progress (optional, assuming 24h as max for display)
      this.timerProgress.set((diff / (24 * 60 * 60 * 1000)) * 100);
    }, 1000);
  }

  private startRotation() {
    this.rotationInterval = setInterval(() => {
      if (this.banners().length > 1) {
        this.currentIndex.update(i => i + 1);
      }
    }, 8000); // Rotate every 8 seconds
  }
}
