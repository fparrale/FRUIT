import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { QuestionsService } from '../../questions/services/questions.service';
import { HttpClientModule } from '@angular/common/http';
import { filter } from 'rxjs';
import { ROUTE_NAMES_EN, ROUTE_NAMES_ES } from '../../../helpers/routes_names';
import { AuthService } from '../../auth/services/AuthService.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StorageService } from '../storage.service';
import { CommonModule } from '@angular/common';
import { GameDataParamsService } from '../../game/params/game-data-params.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    HttpClientModule,
    TranslateModule,
    CommonModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  isMobile: boolean = false;
  currentRouteName: string = '';
  fullName: string = '';
  rolName: string = '';

  name: string = '';
  lastName: string = '';

  showMenu = false;
  isLanguageMenuOpen = false;
  selectedLanguage: string = 'es'; // Idioma por defecto

  CERRAR_SESION: string = 'Cerrar sesión';

  @Output() toggleSidenav = new EventEmitter<void>();

  constructor(
    private translate: TranslateService,
    private authService: AuthService,
    private questionService: QuestionsService,
    private router: Router,
    private storageService: StorageService,
    private gameDataParamsService: GameDataParamsService
  ) {}
  toggleMenuOpciones() {
    this.showMenu = !this.showMenu;
    if (!this.showMenu) {
      this.isLanguageMenuOpen = false;
    }
  }

  toggleLanguageMenu() {
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    this.selectedLanguage = lang;
    this.storageService.setItem(lang);
    this.isLanguageMenuOpen = false;
    this.showMenu = false;
  }

  toggleMenu() {
    this.toggleSidenav.emit();
  }

  againQuestionClear() {
    this.questionService.againQuestions({ refresh: true });
  }

  ngOnInit(): void {
    this.selectedLanguage = this.storageService.getItem() || 'es'; // o el idioma por defecto

    const language = this.storageService.getItem();
    if (language) {
      this.translate.setDefaultLang(language);
    }
    //this.translate.setDefaultLang('en');
    this.getUserAuthenticaded();
    // Detectar el cambio de rutas
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Obtener la ruta actual después de la navegación
        const currentRoute = this.router.url.split('?')[0];
        if (this.storageService.getItem() === 'es') {
          this.currentRouteName =
            ROUTE_NAMES_ES[currentRoute as keyof typeof ROUTE_NAMES_ES] ||
            'ruta';
        } else {
          this.currentRouteName =
            ROUTE_NAMES_EN[currentRoute as keyof typeof ROUTE_NAMES_EN] ||
            'route';
        }

        if (
          this.currentRouteName === 'route' ||
          this.currentRouteName === 'ruta'
        ) {
          const currentRoute = this.router.url.split('?')[0];
          const baseRoute = currentRoute.split('/').slice(0, -1).join('/');
          if (this.storageService.getItem() === 'es') {
            this.currentRouteName =
              ROUTE_NAMES_ES[baseRoute as keyof typeof ROUTE_NAMES_ES] ||
              'ruta';
          } else {
            this.currentRouteName =
              ROUTE_NAMES_EN[baseRoute as keyof typeof ROUTE_NAMES_EN] ||
              'route';
          }
        }
      }
    });

    // Configurar el nombre inicial si ya hay una ruta activa al cargar
    const initialRoute = this.router.url.split('?')[0] || '/home';
    const staticRoute = this.getStaticRoute(initialRoute);
    if (this.storageService.getItem() === 'es') {
      this.currentRouteName =
        ROUTE_NAMES_ES[staticRoute as keyof typeof ROUTE_NAMES_ES] || 'b';
    } else {
      this.currentRouteName =
        ROUTE_NAMES_EN[staticRoute as keyof typeof ROUTE_NAMES_EN] || 'a';
    }
  }

  getStaticRoute(route: string): string {
    const staticRoute = route.split('/')[1];
    return `/${staticRoute}`;
  }

  getUserAuthenticaded(): void {
    this.fullName =
      this.authService.getUserData()?.user.name +
      ' ' +
      this.authService.getUserData()?.user.last_name;
    if (this.storageService.getItem() === 'es') {
      this.rolName = this.authService.getUserData()?.user.role.name!;
    } else {
      if (this.authService.getUserData()?.user.role.name === 'Estudiante') {
        this.rolName = 'Student';
      } else if (this.authService.getUserData()?.user.role.name === 'Docente') {
        this.rolName = 'Teacher';
      } else {
        this.rolName = 'Administrator';
      }
    }
  }

  getPhotoUser(): string {
    return (
      'https://ui-avatars.com/api/?name=' +
      this.authService.getUserData()?.user.name +
      '+' +
      this.authService.getUserData()?.user.last_name +
      '&background=0D92F4&color=FFFFFF'
    );
  }

  logout(): void {
    this.authService.logout();
    this.gameDataParamsService.removeGameRoomIdLocalStorage();
    this.gameDataParamsService.clearGameDataLocalStorage();
    this.gameDataParamsService.removeGameRoomOptionLocalStorage();
    this.gameDataParamsService.clearGameDataPractice();
  }
}
