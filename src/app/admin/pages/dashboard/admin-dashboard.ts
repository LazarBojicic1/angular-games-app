import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminDashboardStats } from '../../models/admin.model';
import { AdminService } from '../../services/admin.service';
import { requestErrorMessage } from '../../shared/admin-validation';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['../../admin-shared.css', './admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {
  stats: AdminDashboardStats | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getDashboard().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        this.errorMessage = requestErrorMessage(error, 'Dashboard statistics could not be loaded.');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
