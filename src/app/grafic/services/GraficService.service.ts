import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../../auth/services/AuthService.service';
import { environment } from '../../../environments/environment';
import { GraficChartGameModel } from '../interfaces/ApiResponse';


@Injectable({
  providedIn: 'root'
})
export class GraficService {

  private apiUrlResultsGraphicsByRoomQuestionUser = environment.apiUrl + 'grafic-chart/getGraficByRoomQuestionUser';
  private apiUrlAddGrafica = environment.apiUrl + 'grafic-chart/add-grafica';
  private apiUrlUpdateGrafica = environment.apiUrl + 'grafic-chart/update-grafica';
  
  private againQuestionSource = new Subject<any>();
  againQuestion$ = this.againQuestionSource.asObservable();

  // BehaviorSubject para mantener y compartir el estado de los RNFs graficados
  private graphedRnfIdsSubject = new BehaviorSubject<string[]>([]);
  public graphedRnfIds$: Observable<string[]> = this.graphedRnfIdsSubject.asObservable();


  constructor(private http: HttpClient, private authService: AuthService) { 

    this.loadGraphedRnfIds();

  }


  getGraficByRoomAndQuestionAndUser(game_room_id: number, question_id: number, user_id?: number): Observable<any> {
    const userData = this.authService.getUserData();
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${userData?.access_token}`,
    });
  
    return this.http
      .post<any>(this.apiUrlResultsGraphicsByRoomQuestionUser, { game_room_id, question_id, user_id }, { headers })
      .pipe(
        tap((response) => {
          return response.data;
        }),
        catchError((error) => {
          console.error('SERVICE | Error al obtener gráficos:', error);
          return throwError(
            () => new Error(
              error.error.message || 'SERVICE | Ocurrió un error. Intenta más tarde.'
            )
          );
        })
      );
  }
  

  createGraphics(graphicData: GraficChartGameModel): Observable<any> {

    const userData = this.authService.getUserData();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${userData?.access_token}`,
    });

    return this.http
      .post<any>(this.apiUrlAddGrafica, graphicData, { headers })
      .pipe(
        tap((response) => {
          console.log('SERVICE | Gráfica creada con éxito', response);  // Puedes agregar más lógica si es necesario
          return response;  
        }),
        catchError((error) => {
          return throwError(
            () =>
              new Error(
                error.error.message || 'SERVICE | Ocurrió un error. Intenta más tarde.'
              )
          );
        })
      );
  }

  updateGraphics(graphicData: GraficChartGameModel): Observable<any> {

    const userData = this.authService.getUserData();
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${userData?.access_token}`,
    });
  
    console.log('SERVICE | Datos a actualizar:', graphicData); // Verifica los datos que se envían

    return this.http
      .put<any>(this.apiUrlUpdateGrafica, graphicData, { headers })
      .pipe(
        tap((response) => {
          console.log('SERVICE | Gráfica actualizada con éxito', response);
          return response;
        }),
        catchError((error) => {
          return throwError(
            () =>
              new Error(
                error.error.message || 'SERVICE | Ocurrió un error al actualizar la gráfica.'
              )
          );
        })
      );
  }
  
  //LOCALSTORAGE COMPARTIR IDS RNF GRAFICADOS

  // Cargar IDs guardados en localStorage
  public loadGraphedRnfIds(): void {
    const savedIds = localStorage.getItem('graphedRnfIds');
    if (savedIds) {
      this.graphedRnfIdsSubject.next(JSON.parse(savedIds));
    }
  }

  // Guardar IDs en localStorage
  public saveGraphedRnfIds(ids: string[]): void {
    localStorage.setItem('graphedRnfIds', JSON.stringify(ids));
  }

  // Obtener lista actual de IDs graficados
  getGraphedRnfIds(): string[] {
    return this.graphedRnfIdsSubject.getValue();
  }

  // Verificar si un RNF está graficado
  isRnfGraphed(rnfId: string): boolean {
    return this.getGraphedRnfIds().includes(rnfId);
  }

  // Marcar un RNF como graficado
  markRnfAsGraphed(rnfId: string): void {
    const currentIds = this.getGraphedRnfIds();
    if (!currentIds.includes(rnfId)) {
      const newIds = [...currentIds, rnfId];
      this.graphedRnfIdsSubject.next(newIds);
      this.saveGraphedRnfIds(newIds);
    }
  }

}
