import { provideHttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { RouterOutlet,RouterLink } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  
})

export class AppComponent {
  
  protected readonly title = signal('frontend');
}
