import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/AuthService.service';
import { CommonModule } from '@angular/common';
import { Credentials } from '../interfaces/Credentials';
import { LoadingService } from '../../shared/loading.service';
import { AlertService } from '../../shared/alert.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../shared/storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [AuthService],
})
export default class LoginComponent implements OnInit{
  credentials: Credentials = {
    email: '',
    password: '',
  };

  isLanguageMenuOpen = false;

  languageUserSelect = 'es';

  constructor(
    private alertService: AlertService,
    private loadingService: LoadingService,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private el: ElementRef,
    private renderer: Renderer2,
    private storageService: StorageService,
  ) {
    //this.translate.setDefaultLang(this.languageUserSelect)
    //this.translate.setDefaultLang(this.languageUserSelect);
    // const language = this.getLanguageUserStorage();
    // this.translate.setDefaultLang(language); // Configura el idioma predeterminado de inmediato
    // this.languageUserSelect = language; // Asegúrate de sincronizar esta variable con el idioma
  }

  ngOnInit(): void {
    const language = this.storageService.getItem() || 'es';
    this.languageUserSelect = language;
    this.translate.setDefaultLang(language);
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const clickedInside = this.el.nativeElement.contains(event.target);
    const clickedElement = event.target as HTMLElement;
    const clickedElementId = clickedElement.id;
    if (
      clickedElementId !== 'language-menu-svg' &&
      clickedElementId !== 'language-menu-button' &&
      clickedElementId !== 'language-menu-path'
    ) {
      this.closeToggleLanguageMenu();
    }
  }

  onSubmit(): void {
    this.loadingService.showLoading();
    this.authService.login(this.credentials, this.storageService.getItem() || 'es').subscribe({
      next: () => {
        this.loadingService.hideLoading();
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.loadingService.hideLoading();
        this.alertService.showAlert(error.message, true);
      },
    });
  }

  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // changeLanguage(event: Event): void {
  //   const target = event.target as HTMLSelectElement | null;
  //   if (target) {
  //     this.translate.use(target.value);
  //   }
  // }

  toggleLanguageMenu(): void {
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  closeToggleLanguageMenu(): void {
    this.isLanguageMenuOpen = false;
  }



  navigationToPage(route: string): void {
    this.router.navigate([route]);
  }
}
