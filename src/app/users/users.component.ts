import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '../shared/alert.service';
import { LoadingService } from '../shared/loading.service';
import { AuthService } from '../auth/services/AuthService.service';

export interface UserInterface {
  id:        number;
  name:      string;
  last_name: string;
  username:  string;
  email:     string;
  id_rol:    number;
  name_rol:  string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})

export default class UsersComponent {
  users: UserInterface[] = [];
  paginatedData: UserInterface[] = [];
  currentPage = 1;
  itemsPerPage = 10;

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.getGameHistory();
  }

  getGameHistory() {
    this.loadingService.showLoading();
    this.authService.getUsers().subscribe({
      next: (response) => {
        this.loadingService.hideLoading();
        this.users = response.data;
        this.updatePagination();
      },
      error: (error) => {
        this.loadingService.hideLoading();
        this.alertService.showAlert(error.message, true);
      },
    });
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedData = this.users.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.users.length) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.users.length / this.itemsPerPage);
  }
}
