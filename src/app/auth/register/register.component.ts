import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/AuthService.service';
import { LoadingService } from '../../shared/loading.service';
import { AlertService } from '../../shared/alert.service';
import { RegisterUser, Role } from '../interfaces/Credentials';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../shared/storage.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  providers: [AuthService],
})
export default class RegisterComponent implements OnInit {
  constructor(private translate: TranslateService, 
    private alertService: AlertService, 
    private loadingService: LoadingService, 
    private authService: AuthService, 
    private router: Router,
    private storageService: StorageService
  ) {
    
  }
  
  showPassword = false;

  registerUser: RegisterUser = {
    name: '',
    last_name: '',
    username: '',
    email: '',
    birth_date: '',
    password: '',
    role: '',
  };

  roles: Array<Role> = [];


  ngOnInit(): void {
    const language = this.storageService.getItem();
    if (language) {
      this.translate.setDefaultLang(language);
    }

    this.loadingService.showLoading();
    this.authService.getRoles().subscribe({
      next: (response) => {
        this.loadingService.hideLoading();
        this.roles = response.data;
      },
      error: (error) => {
        this.loadingService.hideLoading();
        this.alertService.showAlert(error.message, true);
      },
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.loadingService.showLoading();
    this.authService.register(this.registerUser, this.storageService.getItem() || 'es').subscribe({
      next: (response) =>{
        this.loadingService.hideLoading();
        this.alertService.showAlert(response.message, false);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loadingService.hideLoading();
        this.alertService.showAlert(error.message, true);
      },
    });
  }

  navigationToPage(route: string): void {
    this.router.navigate([route]);
  }
}
