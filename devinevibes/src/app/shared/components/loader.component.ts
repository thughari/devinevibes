import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: `<p class="loader">{{ label }}</p>`,
  styles: [`.loader{color:var(--gold);text-align:center;padding:1rem}`]
})
export class LoaderComponent {
  @Input() label = 'Loading...';
}
