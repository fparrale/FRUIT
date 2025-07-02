import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';

import { MatListModule } from '@angular/material/list';

import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../navbar/navbar.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../auth/services/AuthService.service';
import { GameDataParamsService } from '../../game/params/game-data-params.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    TranslateModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isMobile = true;
  isCollapsed = true;

  @Output() toggleSidenav = new EventEmitter<void>();

  userRoleId: string = '';

  constructor(
    private translate: TranslateService,
    private observer: BreakpointObserver,
    private authService: AuthService,
    private gameDataParamsService: GameDataParamsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    this.userRoleId = userData?.user.role.name ?? '';
  }

  canShowItemAdmin(): boolean {
    return this.userRoleId === 'Administrador';
  }

  canShowItemTeacher(): boolean {
    return this.userRoleId === 'Docente';
  }

  canShowItemStudent(): boolean {
    return this.userRoleId === 'Estudiante';
  }

  // routeGame() : void {
  //   this.router.navigate(['/game'], {
  //     queryParams: { mode: 'find' }, 
  //   });
  // }

  // ngOnInit() {
  //   this.observer.observe(['(max-width: 800px)']).subscribe((screenSize) => {
  //     if (screenSize.matches) {
  //       this.isMobile = true;
  //       this.isCollapsed = this.isMobile;
  //     } else {
  //       this.isMobile = false;
  //     }
  //   });
  // }

  // togleMenuMobile() {
  //   if (this.isMobile) {
  //     this.sidenav.toggle();
  //     this.isCollapsed = false;
  //     this.toggleSidenav.emit();
  //   }

  //   if (!this.isMobile) {
  //     this.sidenav.open();
  //     this.isCollapsed = !this.isCollapsed;
  //     this.toggleSidenav.emit();
  //   }
  // }


  isRouteActive(): boolean {
    const rutasActivas = ['/game', '/quiz-game'];
    return rutasActivas.some(ruta => this.router.isActive(ruta, false));
  }

  menuOpen = false;

 
  isActive(route: string): boolean {
    return this.router.url === route;
  }

  @ViewChild('menuRef', { static: true }) menuRef!: ElementRef;

  toggleMenu(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.menuOpen = !this.menuOpen;
  }

  onOptionClick() {
    if (window.innerWidth < 1280) {
      this.menuOpen = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth >= 1280) {
      this.menuOpen = true;
    }else{
      this.menuOpen = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.menuOpen && !this.menuRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    }
  }
}
