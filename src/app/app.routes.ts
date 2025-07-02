import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './core/guards/auth.guard';
import { AuthenticatedGuard } from './core/guards/authenticated.guard';
import { quizGameGuard } from './core/guards/game/quiz-game.guard';
import { roleAdminGuard } from './core/guards/role/role-admin.guard';
import { roleTeacherGuard } from './core/guards/role/role-teacher.guard';
import { roleStudentGuard } from './core/guards/role/role-student.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component'),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component'),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'forget-password',
    loadComponent: () => import('./auth/forget-password/forget-password.component'),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout.component'),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./shared/home-question/home-question.component'),
        canActivate: [AuthGuard],
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.component'),
        canActivate: [AuthGuard, roleAdminGuard],
      },
      // {
      //   path: 'questions',
      //   loadComponent: () => import('./questions/questions/questions.component'),
      //   canActivate: [AuthGuard, roleStudentGuard],
      // },
      {
        path: 'game',
        loadComponent: () => import('./game/game.component'),
        canActivate: [AuthGuard, quizGameGuard, roleStudentGuard],
      },
      {
        path: 'quiz-game',
        loadComponent: () => import('./questions/questions/questions.component'),
        canActivate: [AuthGuard, roleStudentGuard],
      },
      { path: 'results', 
        loadComponent: () => import('./results/results.component'),
        canActivate: [AuthGuard, roleStudentGuard],
      },
      {
        path: 'grafic',
        loadComponent: () => import('./grafic/grafic.component'),
        canActivate: [AuthGuard, roleStudentGuard],
      },
      { path: 'game-history', 
        loadComponent: () => import('./game-history/game-history.component'),
        canActivate: [AuthGuard, roleStudentGuard],
      },
      { path: 'game-rooms', 
        loadComponent: () => import('./game-rooms/game-rooms.component'),
        canActivate: [AuthGuard, roleTeacherGuard],
      },
      { 
        path: 'edit-game-room/:id', 
        loadComponent: () => import('./game-rooms/edit-game-room/edit-game-room.component'),
        canActivate: [AuthGuard, roleTeacherGuard],
      },
      { 
        path: 'get-participating-players/:id', 
        loadComponent: () => import('./participants-list/participants-list.component'),
        canActivate: [AuthGuard, roleTeacherGuard],
      },
      { path: 'create-game-room', 
        loadComponent: () => import('./game-rooms/create-game-room/create-game-room.component'),
        canActivate: [AuthGuard, roleTeacherGuard],
      },
      { path: 'report', 
        loadComponent: () => import('./report/report.component'),
        canActivate: [AuthGuard, roleTeacherGuard],
      },
      {
        path: 'practice-game',
        loadComponent: () => import('./practice-questions/practice-questions.component').then(m => m.PracticeQuestionsComponent),
        canActivate: [AuthGuard, roleStudentGuard],
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path : '**',
    redirectTo: 'home',
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}