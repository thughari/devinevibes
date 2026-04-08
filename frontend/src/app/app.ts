import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NavbarComponent} from './shared/components/navbar/navbar.component';
import {FooterComponent} from './shared/components/footer/footer.component';
import {SnackbarContainerComponent} from './shared/components/snackbar-container/snackbar-container.component';
import {AnnouncementBannerComponent} from './shared/components/announcement-banner/announcement-banner.component';

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
    <app-snackbar-container />
  `,
  styles: []
})
export class App {}
