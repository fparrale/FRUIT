import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { AuthService } from '../../auth/services/AuthService.service';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { createRnfGameRoomService, GameRoomRnf } from '../interfaces/game-rooms';

@Injectable({
  providedIn: 'root'
})
export class GameRoomsService {
  private apiUrlGameRooms = environment.apiUrl + 'game/game-rooms';
  private apiUrlGameRoomsOne = environment.apiUrl + 'questions/get-game-room';
  private apiUrlGameRoomAndQuestionId = environment.apiUrl + 'questions/get-game-room-question';
  private apiUrlGameRoomsQuestionEdit = environment.apiUrl + 'game/edit-room-game-question';
  private apiurlDeleteGameRoom = environment.apiUrl + 'game/delete-game-room';
  private apiurlUploadExcel = environment.apiUrl + 'question/UploadQuestion';
  private apiUrlGenerateReportGameRoom = environment.apiUrl + 'report/generate-report-teacher-game-room';
  private apiUrlCreateGameRoom = environment.apiUrl + 'game/create-room-game-questions';
  private apiurlEditGameRoom = environment.apiUrl + 'game/edit-game-room';
  private apiUrlParticipatingPlayersByGameRoom = environment.apiUrl + 'game/get-participating-players';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getGameRooms(): Observable<any> {
    const userData = this.authService.getUserData();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${userData?.access_token}`,
    });

    return this.http
      .get<any>(this.apiUrlGameRooms, { headers })
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

  getGameRoomQuestions(room_id: number): Observable<any> {
    const userData = this.authService.getUserData();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${userData?.access_token}`,
    });

    return this.http
      .post<any>(this.apiUrlGameRoomsOne, {room_id},{ headers })
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
      );;
  }

  getGameRoomQuestionsAndQuestionId(room_id: number, question_id: number): Observable<any> {
    const userData = this.authService.getUserData();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${userData?.access_token}`,
    });

    return this.http
      .post<any>(this.apiUrlGameRoomAndQuestionId, {room_id, question_id},{ headers })
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
      );;
  }

  deleteGameRoom(game_room_id:number,status:boolean, language: string): Observable<any> {
    const userData = this.authService.getUserData();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${userData?.access_token}`,
    });

    return this.http
      .post<any>(this.apiurlDeleteGameRoom, {game_room_id, status, language:language},{ headers })
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

  generateReportGameRoom(game_room_id:number, language:string): Observable<any> {
    const userData = this.authService.getUserData();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${userData?.access_token}`,
    });

    return this.http
    .post(
      this.apiUrlGenerateReportGameRoom,
      { game_room_id, language },
      { headers, responseType: 'blob', observe: 'response' }
    )
    .pipe(
      tap((response) => {
        return response;
      }),
      catchError((error) => {
        let errorMessage = 'Ocurrió un error, inténtalo más tarde';

        if (error.error instanceof Blob) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const errorData = JSON.parse(reader.result as string);
                errorMessage = errorData?.message || errorMessage;
                reject(new Error(errorMessage));
              } catch (e) {
                reject(new Error(errorMessage));
              }
            };
            reader.onerror = () => {
              reject(new Error(errorMessage));
            };
            reader.readAsText(error.error);
          });
        } else {
          errorMessage = error?.error?.message || errorMessage;
          return throwError(() => new Error(errorMessage));
        }
      })
    );
  }

  uploadExcel(file: Array<createRnfGameRoomService>): Observable<any> {
    const userData = this.authService.getUserData();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${userData?.access_token}`,
    });

    return this.http
      .post<any>(this.apiurlUploadExcel, file ,{ headers })
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

  createGameRoom(body: GameRoomRnf): Observable<any> {
    const userData = this.authService.getUserData();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${userData?.access_token}`,
    });

    return this.http
      .post<any>(this.apiUrlCreateGameRoom, body,{ headers })
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

  editGameRoomQuestion(body: any): Observable<any> {
    const userData = this.authService.getUserData();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${userData?.access_token}`,
    });

    return this.http
      .post<any>(this.apiUrlGameRoomsQuestionEdit, body,{ headers })
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

  updateExpirationDate(body: any): Observable<any> {
    const userData = this.authService.getUserData();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${userData?.access_token}`,
    });

    return this.http
      .post<any>(this.apiurlEditGameRoom, body ,{ headers })
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

  getParticipatingPlayersByGameRoom(gameRoomId: number): Observable<any> {
    const userData = this.authService.getUserData();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${userData?.access_token}`,
    });

    return this.http
      .post<any>(this.apiUrlParticipatingPlayersByGameRoom, {gameRoomId},{ headers })
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
      );;
  }

}
