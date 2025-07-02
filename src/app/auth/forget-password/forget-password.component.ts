import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PasswordReset, SendCode } from '../interfaces/Credentials';
import { LoadingService } from '../../shared/loading.service';
import { AlertService } from '../../shared/alert.service';
import { AuthService } from '../services/AuthService.service';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../shared/storage.service';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export default class ForgetPasswordComponent implements OnInit{

  constructor(private translate: TranslateService, 
    private alertService: AlertService, 
    private loadingService: LoadingService, 
    private authService: AuthService, 
    private router: Router,
    private storageService: StorageService,
  ){
     //this.translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    const language = this.storageService.getItem();
    if (language) {
      this.translate.use(language);
    }
  }

  sendCode : SendCode = {
    email: ''
  }

  passwordReset : PasswordReset = {
    email : '',
    otp: null,
    password: '',
    password_confirmation: '',
  }

  isCodeSent: boolean = false;
  showPassword: boolean = false;
  showPasswordConfirmation: boolean = false;

  onSubmitSendCode() : void {
    this.loadingService.showLoading();
    this.authService.passwordSendCode(this.sendCode, this.storageService.getItem() || 'es').subscribe({
      next: (response) =>{
        this.loadingService.hideLoading();
        this.alertService.showAlert(response.message, false);
        this.isCodeSent = true;
        this.passwordReset.email = this.sendCode.email;
      },
      error: (error) => {
        this.loadingService.hideLoading();
        this.alertService.showAlert(error.message, true);
      },
    });
  }

  onSubmitResetPassword(): void {
    this.loadingService.showLoading();
    this.authService.passwordReset(this.passwordReset, this.storageService.getItem() || 'es').subscribe({
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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  togglePasswordConfirmationVisibility(): void {
    this.showPasswordConfirmation = !this.showPasswordConfirmation;
  }

  navigationToPage(route: string): void {
    this.router.navigate([route]);
  }
}
