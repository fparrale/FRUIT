import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alertSubject = new Subject<any>();
  public alertState$ = this.alertSubject.asObservable();

  showAlert(message: string, type: boolean = true) {
    this.alertSubject.next({ message, type });
  }
}
