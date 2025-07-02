import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/services/AuthService.service';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home-question',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './home-question.component.html',
  styleUrl: './home-question.component.css'
})
export default class HomeQuestionComponent implements OnInit {

  constructor( private translate: TranslateService, private router: Router, private authService: AuthService) {}
  userRoleId: string = '';

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    this.userRoleId = userData?.user.role.name ?? '';
  }

  importQuestions() {
    this.router.navigate(['/game-rooms']);
  }

  createGame() {
    this.router.navigate(['/create-game-room']);
  }

  findGame(option: string) {
    this.router.navigate(['/game']);
    localStorage.setItem('gameOption', option);
    this.router.navigate(['/game'], {
      queryParams: { mode: option }, 
    });
  }

  canShowItemTeacher(): boolean {
    return this.userRoleId === 'Docente';
  }

  canShowItemStudent(): boolean {
    return this.userRoleId === 'Estudiante';
  }

}
