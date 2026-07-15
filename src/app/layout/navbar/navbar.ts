import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { User, getUserRoleName } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isMenuOpen = false;
  readonly currentUser$ = this.authService.currentUser$;

  isAdmin(user: User): boolean {
    return getUserRoleName(user) === 'admin';
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.closeMenu();
        void this.router.navigateByUrl('/');
      },
      error: () => {
        this.closeMenu();
        void this.router.navigateByUrl('/');
      }
    });
  }
}
