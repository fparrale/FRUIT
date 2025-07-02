import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { createRnfGameRoomService, CreateRnfList } from '../interfaces/game-rooms';
import { LoadingService } from '../../shared/loading.service';
import { AlertService } from '../../shared/alert.service';
import { GameRoomsService } from '../services/game-rooms.service';
import { StorageService } from '../../shared/storage.service';

@Component({
  selector: 'app-edit-game-room',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './edit-game-room.component.html',
  styleUrl: './edit-game-room.component.css'
})
export default class EditGameRoomComponent implements OnInit {
  questions: any[] = [];
  gameRoom: any;
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

    showModal: boolean = false;
    editIndex: number | null = null;
    listRnf: Array<createRnfGameRoomService> = [];
    indexQuestionId: number = 0;

    // Fecha y hora
  selectedDate: string = ''; // Fecha seleccionada (yyyy-MM-dd)
  selectedHour: string = '00'; // Hora seleccionada (hh)
  selectedMinute: string = '00'; // Minutos seleccionados (mm)
  today: string = new Date().toISOString().split('T')[0]; // Fecha mínima para el selector

  // Opciones para horas y minutos
  hours: string[] = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  minutes: string[] = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  paginatedData: any[] = [];
  currentPage = 1;
  itemsPerPage = 5;

  searchTerm: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  sortField: 'nfr' | 'id' = 'nfr';
  filteredGameRooms: any[] = [];


  constructor(private router: Router, private loadingService: LoadingService,
      private alertService: AlertService, private gameRoomsService: GameRoomsService, private storageService: StorageService) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.questions = navigation.extras.state['questions'];
      this.gameRoom = navigation.extras.state['gameRoom'];
    }
  }

  ngOnInit() {
    if (!this.questions || !this.gameRoom) {
      this.router.navigate(['/game-rooms']); 
    }else{
      const [date, time] = this.gameRoom["expiration_date"].split(' ');
      const [hour, minute] = time.split(':');
      this.selectedDate = date;
      this.selectedHour = hour;
      this.selectedMinute = minute;
    }

    this.filteredGameRooms = [...this.questions];
    this.updatePagination();
  }

  onEdit(gameRooms: any) {
    this.loadingService.showLoading();
    this.gameRoomsService.getGameRoomQuestionsAndQuestionId(this.gameRoom.id, gameRooms.id).subscribe({
      next: (response) => {
        this.loadingService.hideLoading();
        if (response.questions && response.questions.length > 0) {
          const question = response.questions[0];
          // Split validar string to get individual weights
          const weights = question.validar.split('/');
          
          this.newRnf = {
            nfr: question.nfr,
            variable: question.variable,
            feedback1: question.feedback1,
            value: question.value,
            feedback2: question.feedback2,
            recomend: question.recomend,
            other_recommended_values: question.other_recommended_values,
            feedback3: question.feedback3,
            weightVarible: weights[0].replace(',', '.'),
            weightValue: weights[1].replace(',', '.'),
            weightRecomend: weights[2].replace(',', '.'),
            validar: question.validar
          };
        }
        this.indexQuestionId = gameRooms.id;
        this.showModal = true;
      },
      error: (error) => {
        this.loadingService.hideLoading();
        this.alertService.showAlert(error.message, true);
      }
    });
    
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

      const body: any = {
              questions: this.listRnf,
              questionId: this.indexQuestionId,
              language: this.storageService.getItem() || 'es'
      };

      this.loadingService.showLoading();
      this.gameRoomsService.editGameRoomQuestion(body).subscribe({
        next: (response) => {
          this.loadingService.hideLoading();
          this.alertService.showAlert(response.message, false);
          this.gameRoomsService.getGameRoomQuestions(this.gameRoom.id).subscribe({
            next: (response) => {
              this.loadingService.hideLoading();
              this.questions = response.questions;
              this.router.navigate(['/edit-game-room', this.gameRoom.id], {
                state: { questions: this.questions, gameRoom: this.gameRoom }
              });
            },
            error: (error) => {
              this.loadingService.hideLoading();
              this.alertService.showAlert(error.message, true);
            }
          });
        },
        error: (error) => {
          this.loadingService.hideLoading();
          this.alertService.showAlert(error.message, true);
        },
      });

      this.showModal = false;
      this.listRnf = [];
    }
  }

  updateExpirationDate() {
    if (!this.selectedDate || !this.selectedHour || !this.selectedMinute) {
      this.alertService.showAlert('Por favor, completa la fecha, hora y minutos.', true);
      return;
    }
  
    const newExpirationDate = `${this.selectedDate} ${this.selectedHour}:${this.selectedMinute}:00`;
  
    const body = {
      gameRoomId: this.gameRoom.id,
      expirationDate: newExpirationDate,
      language: this.storageService.getItem() || 'es'
    };
  
    this.loadingService.showLoading();
  
    this.gameRoomsService.updateExpirationDate(body).subscribe({
      next: (response) => {
        this.loadingService.hideLoading();
        this.alertService.showAlert(response.message, false);
        this.gameRoom.expiration_date = newExpirationDate;
      },
      error: (error) => {
        this.loadingService.hideLoading();
        this.alertService.showAlert(error.message, true);
      }
    });
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedData = this.filteredGameRooms.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.questions.length) {
      this.currentPage++;
      this.updatePagination();
    }
  }


  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredGameRooms.length / this.itemsPerPage);
  }

  searchGameRooms(): void {
    this.filteredGameRooms = this.questions.filter(room => 
      room.nfr.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.sortGameRooms();
    this.currentPage = 1;
    this.updatePagination();
  }

  sortGameRooms(): void {
    this.filteredGameRooms.sort((a, b) => {
      if (this.sortField === 'nfr') {
      const valueA = a.nfr.toLowerCase();
      const valueB = b.nfr.toLowerCase();
      return this.sortDirection === 'asc' ? 
        valueA.localeCompare(valueB) : 
        valueB.localeCompare(valueA);
      } else if (this.sortField === 'id') {
      return this.sortDirection === 'asc' ? 
        a.id - b.id : 
        b.id - a.id;
      }
      return 0;
    });
    this.updatePagination();
    }

  toggleSort(field: 'nfr' | 'id'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.sortGameRooms();
    this.updatePagination();
  }
}
