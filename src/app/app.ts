import { NgIf } from '@angular/common';
import { Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { distinctUntilChanged } from 'rxjs';

import { Navbar } from './layout/navbar/navbar';
import { Footer } from './layout/footer/footer';
import { AuthService } from './core/services/auth.service';
import { LibraryService } from './core/services/library.service';
  
@Component({
  selector: 'app-root',
  imports: [NgIf, RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('GameVault');

  constructor(
    private readonly authService: AuthService,
    protected readonly libraryService: LibraryService
  ) {
    this.authService.currentUser$.pipe(
      distinctUntilChanged((previous, current) => previous?.id === current?.id),
      takeUntilDestroyed()
    ).subscribe((user) => {
      if (user) {
        this.libraryService.ensureLoaded(user.id);
      } else {
        this.libraryService.reset();
      }
    });

    this.authService.loadCurrentUser().subscribe();
  }

  protected retryLibrary(): void {
    const user = this.authService.currentUser;

    if (user) {
      this.libraryService.ensureLoaded(user.id);
    }
  }
}
