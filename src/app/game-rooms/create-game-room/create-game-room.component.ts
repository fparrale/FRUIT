import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CreateRnfList,
  GameRoomRnf,
  createRnfGameRoomService,
} from '../interfaces/game-rooms';
import { GameRoomsService } from '../services/game-rooms.service';
import { LoadingService } from '../../shared/loading.service';
import { AlertService } from '../../shared/alert.service';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { StorageService } from '../../shared/storage.service';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-create-game-room',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './create-game-room.component.html',
  styleUrl: './create-game-room.component.css',
})
export default class CreateGameRoomComponent implements OnInit {
  constructor(
    private gameRoomsService: GameRoomsService,
    private loadingService: LoadingService,
    private alertService: AlertService,
    private router: Router,
    private storageService: StorageService
  ) {}

  today: string = '';

  selectedDate: string | null = null;
  selectedHour: string | null = null;
  selectedMinute: string | null = null;

  hours: string[] = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0')
  );
  minutes: string[] = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  // durations: number[] = [5, 10, 15, 20, 30, 45, 60];
  // duration: number = 15;

  newRnf: CreateRnfList = {
    nfr: '',
    variable: '',
    feedback1: '',
    value: '',
    feedback2: '',
    recomend: '',
    other_recommended_values: '',
    feedback3: '',
    weightVarible: '',
    weightValue: '',
    weightRecomend: '',
    validar: '',
  };

  listRnf: Array<createRnfGameRoomService> = [];

  showModal: boolean = false;

  editIndex: number | null = null;

  fullDateTime: string = '';

  ngOnInit() {
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
  }

  onNumberInput(event: Event, position: number): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    if (value === '') {
      this.updateWeightValue(position, '');
      return;
    }

    value = value.replace(',', '.');

    value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');

    if (!value.includes('.') && value.length > 1) {
      value = value[0] + '.' + value.slice(1);
    }

    if (value.includes('.')) {
      const [integer, decimals] = value.split('.');
      value = `${integer}.${decimals.slice(0, 2)}`;
    }

    if (value.startsWith('.')) {
      value = '0' + value;
    }

    input.value = value;
    this.updateWeightValue(position, value);
  }

  private updateWeightValue(position: number, value: string): void {
    if (position === 1) this.newRnf.weightVarible = value;
    if (position === 2) this.newRnf.weightValue = value;
    if (position === 3) this.newRnf.weightRecomend = value;
  }

  guardarRNF() {
    this.newRnf.validar = `${this.newRnf.weightVarible}/${this.newRnf.weightValue}/${this.newRnf.weightRecomend}`;

    const numbers = this.newRnf.validar
      .split('/')
      .map((num) => parseFloat(num.trim()));
    const total = numbers.reduce((sum, num) => sum + num, 0);

    if (total > 1) {
      this.alertService.showAlert(
        'La suma de los pesos debe ser igual a 1',
        true
      );
    } else {
      const { weightVarible, weightValue, weightRecomend, ...rnfToSave } =
        this.newRnf;

      if (this.editIndex !== null) {
        this.listRnf[this.editIndex] = rnfToSave;
        this.editIndex = null;
      } else {
        this.listRnf.push(rnfToSave);
      }

      this.newRnf = {
        nfr: '',
        variable: '',
        feedback1: '',
        value: '',
        feedback2: '',
        recomend: '',
        other_recommended_values: '',
        feedback3: '',
        validar: '',
        weightVarible: '',
        weightValue: '',
        weightRecomend: '',
      };

      this.showModal = false;
    }
  }

  onDelete(rnf: any) {
    const index = this.listRnf.findIndex((item) => item === rnf);

    if (index > -1) {
      this.listRnf.splice(index, 1);
    }
  }

  createGameRoomService(): void {
    if (this.listRnf.length === 0) {
      if (this.storageService.getItem() === 'en') {
        this.alertService.showAlert('No non-functional requirements have been added', true );
      } else {
        this.alertService.showAlert('No se han agregado requerimientos no funcionales', true );
      }
    } else {
      if (!this.submitDateTime()) return;

      const body: GameRoomRnf = {
        expiration_date: this.fullDateTime,
        questions: this.listRnf,
        language: this.storageService.getItem() || 'es',
      };

      this.loadingService.showLoading();
      this.gameRoomsService.createGameRoom(body).subscribe({
        next: (response) => {
          this.loadingService.hideLoading();
          this.alertService.showAlert(response.message, false);
          this.router.navigate(['/game-rooms']);
        },
        error: (error) => {
          this.loadingService.hideLoading();
          this.alertService.showAlert(error.message, true);
        },
      });
    }
  }

  onEdit(rnf: createRnfGameRoomService, index: number): void {
    this.newRnf = {
      nfr: rnf.nfr,
      variable: rnf.variable,
      feedback1: rnf.feedback1,
      value: rnf.value,
      feedback2: rnf.feedback2,
      recomend: rnf.recomend,
      other_recommended_values: rnf.other_recommended_values,
      feedback3: rnf.feedback3,
      validar: '',
      weightVarible: rnf.validar.split('/')[0],
      weightValue: rnf.validar.split('/')[1],
      weightRecomend: rnf.validar.split('/')[2],
    };

    this.editIndex = index;
    this.showModal = true;
  }

  openModal(): void {
    this.showModal = true;
    this.editIndex = null;

    this.newRnf = {
      nfr: '',
      variable: '',
      feedback1: '',
      value: '',
      feedback2: '',
      recomend: '',
      other_recommended_values: '',
      feedback3: '',
      validar: '',
      weightVarible: '',
      weightValue: '',
      weightRecomend: '',
    };
  }

  submitDateTime(): boolean {
    if (this.selectedDate && this.selectedHour && this.selectedMinute) {
      this.fullDateTime = `${this.selectedDate} ${this.selectedHour}:${
        this.selectedMinute
      }:${new Date().getSeconds()}`;
      return true;
    } else {
      if (this.storageService.getItem() === 'en') {
        this.alertService.showAlert('The end date is mandatory.', true);
        return false;
      } else
      this.alertService.showAlert('La fecha de finalizacion es obligatoria.', true);
      return false;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

  if (input.files && input.files.length > 0) {
    const selectedFile = input.files[0];

    const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!allowedTypes.includes(selectedFile.type)) {
      this.alertService.showAlert('Solo se permiten archivos Excel (.xls, .xlsx)', true);
      input.value = '';
      return;
    }
    
    this.loadingService.showLoading();
    this.transformExcelToCsv(selectedFile)
      .then((csv) => {
        this.parseCsvToArray(csv);
        this.loadingService.hideLoading();
        input.value = '';
      })
      .catch((error) => {
        input.value = '';
        this.loadingService.hideLoading();
        this.alertService.showAlert('Error al subir el archivo', error);
      });
    }
  }

  transformExcelToCsv(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const data = new Uint8Array(e.target.result);
          const arr = new Array();
          for (let i = 0; i !== data.length; ++i) arr[i] = String.fromCharCode(data[i]);
          const bstr = arr.join("");
          const workbook = XLSX.read(bstr, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          resolve(csv);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
      });
    }

    parseCsvToArray(csv: string): void {
      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          this.listRnf = result.data.map((item: any) => ({
            nfr: item.RNF || '',
            variable: item.linguistic_variable || '',
            feedback1: item.feedback_linguistic_variable || '',
            value: item.linguistic_value || '',
            feedback2: item.feedback_linguistic_value || '',
            recomend: item.recommended_linguistic_value || '',
            other_recommended_values: item.other_linguistic_values || '',
            feedback3: item.feedback_recommended_linguistic_value || '',
            validar: item.weights || ''
          }));
          this.loadingService.hideLoading();
        },
        error: (error: any) => {
          this.alertService.showAlert('Error al procesar el archivo CSV', true);
          console.error('Error parsing CSV:', error);
        }
      });
    }
}
