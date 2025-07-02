import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/ApiResponse';
import { AuthService } from '../../auth/services/AuthService.service';
import { environment } from '../../../environments/environment';
import { BodyResultsQuestions } from '../interfaces/BodyResultsQuestions';
import { Question, Questions } from '../interfaces/Questions';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {
  private apiUrlQuestions = environment.apiUrl + 'questions/questionInfoBycode';
  private apiUrlResultsQuestions = environment.apiUrl + 'quiz/quiz';

  private currentQuestionIndex = 0;
  private readonly timePerStep = 30; 
  
  private againQuestionSource = new Subject<any>();
  againQuestion$ = this.againQuestionSource.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) { }

  // getQuestions(salaDeJuego: string): Observable<ApiResponse> {

  //   const userData = this.authService.getUserData();

  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${userData?.access_token}`,
  //   });

  //   return this.http.post<ApiResponse>(this.apiUrlQuestions, { code: salaDeJuego }, { headers, withCredentials: true });
  // }

  againQuestions(data: any) {
    if (data) {
      this.againQuestionSource.next(data);
    }
  }

  getResultsQuestions(body: BodyResultsQuestions): Observable<any> {

    const userData = this.authService.getUserData();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${userData?.access_token}`,
    });

    return this.http
      .post<any>(this.apiUrlResultsQuestions, body, { headers })
      .pipe(
        tap((response) => {
          return response;
        }),
        catchError((error) => {
          return throwError(
            () =>
              new Error(
                error.error.message || 'Ocurrio un error intentalo mas tarde'
              )
          );
        })
      );
  }

  getCurrentQuestion(questions: Questions[]): Questions | null {
    if (this.currentQuestionIndex < questions.length) {
      return questions[this.currentQuestionIndex];
    }
    return null;
  }

  nextQuestion(questions: Questions[]) {
    this.currentQuestionIndex++;
    return this.getCurrentQuestion(questions);
  }

  resetGame() {
    this.currentQuestionIndex = 0;
  }

  calculateScore(timeRemaining: number): number {
    return Math.max(0, timeRemaining);
  }
  
}
