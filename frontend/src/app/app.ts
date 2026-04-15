import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SnackbarContainerComponent } from './shared/components/snackbar-container/snackbar-container.component';
import { AnnouncementBannerComponent } from './shared/components/announcement-banner/announcement-banner.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, SnackbarContainerComponent, AnnouncementBannerComponent],
  template: `
    <app-announcement-banner />
    <app-navbar />
    <main class="flex-1">
      <router-outlet />
    </main>
    <app-footer />

    <a
      href="https://wa.me/919949944726?text=Hi%20Devine%20Vibes%2C%20I%20need%20help%20with%20my%20order."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Devine Vibes on WhatsApp"
      class="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.45)] hover:scale-110 hover:shadow-[0_12px_36px_rgba(37,211,102,0.6)] transition-all duration-300 flex items-center justify-center"
    >
      <svg class="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.52 3.48A11.9 11.9 0 0 0 12.06 0C5.57 0 .29 5.28.29 11.77c0 2.07.54 4.09 1.56 5.87L0 24l6.53-1.71a11.74 11.74 0 0 0 5.53 1.4h.01c6.49 0 11.77-5.28 11.77-11.77 0-3.14-1.22-6.09-3.32-8.44ZM12.07 21.5h-.01a9.67 9.67 0 0 1-4.93-1.35l-.35-.21-3.87 1.01 1.03-3.77-.23-.39a9.66 9.66 0 0 1-1.48-5.03c0-5.39 4.39-9.78 9.79-9.78 2.61 0 5.05 1.02 6.89 2.88a9.69 9.69 0 0 1 2.86 6.9c0 5.39-4.39 9.78-9.78 9.78Zm5.36-7.35c-.29-.15-1.73-.85-1.99-.95-.27-.1-.46-.15-.66.15-.2.29-.76.95-.93 1.14-.17.2-.34.22-.63.08-.29-.15-1.24-.46-2.36-1.48-.87-.77-1.45-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.52-.08-.15-.66-1.59-.9-2.17-.24-.58-.49-.5-.66-.5h-.56c-.2 0-.52.08-.8.37-.27.29-1.04 1.01-1.04 2.45s1.07 2.84 1.22 3.04c.15.2 2.09 3.19 5.06 4.47.71.31 1.26.5 1.69.64.71.22 1.35.19 1.86.11.57-.08 1.73-.71 1.98-1.39.24-.68.24-1.26.17-1.39-.07-.12-.27-.2-.56-.34Z" />
      </svg>
    </a>

    <app-snackbar-container />
  `,
  styles: []
})
export class App {}
