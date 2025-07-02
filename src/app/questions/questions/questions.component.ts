import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Question } from '../interfaces/Questions';
import { QuestionsService } from '../services/questions.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { GameDataParamsService } from '../../game/params/game-data-params.service';
import { AlertService } from '../../shared/alert.service';
import { BodyResultsQuestions } from '../interfaces/BodyResultsQuestions';
import { LoadingService } from '../../shared/loading.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [DragDropModule, CommonModule, MatButtonModule, TranslateModule],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.css',
  providers: [QuestionsService],
})
export default class QuestionsComponent implements OnInit {
  questions: Question[] = [];
  currentQuestion: Question | undefined;
  currentQuestionIndex = 0;
  questionWords: string[] = [];
  otherRecommendedValues: string[] = [];
  variable: string[] = [];
  //feedback1: string[] = [];
  value: string[] = [];
  //feedback2: string[] = [];
  recomend: string[] = [];
  //feedback3: string[] = [];
  //validar: string[] = [];
  currentDraggingItem: string[] = [];

  timer: number = 0;
  interval: any;

  isButtonCloseConfirm: boolean = true;

  // alertMessage: string = '';
  // title: string = '';

  modalTitle: string = '';
  modalContent: string = '';
  contenidoHTML: string = '';
  showInfoModal: boolean = false;

  showInstructions: boolean = true;

  showConfirmationModal: boolean = false;

  completedAnswers: {
    id: string;
    nfr : string;
    variable: string;
    value: string;
    recomend: string;
  }[] = [];

  private againQuestionSubscription: Subscription | undefined;

  answers: {
    variable: string[];
    value: string[];
    recomend: string[];
    availableWords: string[];
    otherRecommendedValues: string[];
  }[] = [];

  constructor(
    private loadingService: LoadingService,
    private alertService: AlertService,
    private questionService: QuestionsService,
    private router: Router,
    private gameDataParamsService: GameDataParamsService
  ) {}

  ngOnInit(): void {
    const storedTime = localStorage.getItem('timer');
    this.timer = storedTime ? parseInt(storedTime, 10) : 0;

    if (this.showInstructions) {
      const instructionsElement = document.getElementById('instructionsAlert');
      if (instructionsElement) {
        instructionsElement.style.display = 'flex';
      }
    }

    const gameDataParams = this.gameDataParamsService.getGameData();

    if (gameDataParams != null) {
      this.questions = gameDataParams;
      this.showQuestion();
    } else {
      const dataGameStorage =
        this.gameDataParamsService.getGameDataLocalStorage();
      console.log('dataGameStorage', dataGameStorage);
      if (dataGameStorage != null) {
        this.questions = dataGameStorage;
        this.showQuestion();
      } else {
        this.router.navigate(['/game']);
        this.router.navigate(['/game'], {
          queryParams: { mode: 'find' }, 
        });
      }
    }

    this.againQuestionSubscription =
      this.questionService.againQuestion$.subscribe((res) => {
        this.againQuestion();
      });
  }

  closeInstructions(): void {
    this.showInstructions = false;
    const instructionsElement = document.getElementById('instructionsAlert');
    if (instructionsElement) {
      this.startTimer();
      instructionsElement.style.display = 'none';
    }
  }

  showQuestion(): void {
    this.currentQuestion = this.questions[this.currentQuestionIndex];
    if (this.answers[this.currentQuestionIndex]) {
      this.variable = this.answers[this.currentQuestionIndex].variable;
      this.value = this.answers[this.currentQuestionIndex].value;
      this.recomend = this.answers[this.currentQuestionIndex].recomend;
      this.questionWords =
        this.answers[this.currentQuestionIndex].availableWords;
      this.otherRecommendedValues =
        this.answers[this.currentQuestionIndex].otherRecommendedValues;
    } else {
      this.variable = [];
      this.value = [];
      this.recomend = [];
      this.questionWords = [...(this.currentQuestion?.nfr.split(' ') || [])];
      this.otherRecommendedValues =
        this.currentQuestion?.other_recommended_values.split(',') || [];
      this.answers[this.currentQuestionIndex] = {
        variable: this.variable,
        value: this.value,
        recomend: this.recomend,
        availableWords: this.questionWords,
        otherRecommendedValues: this.otherRecommendedValues,
      };
    }
  }

  againQuestion(): void {
    this.currentQuestion = this.questions[this.currentQuestionIndex];
    this.questionWords.length = 0;
    this.otherRecommendedValues.length = 0;
    this.questionWords.push(...(this.currentQuestion?.nfr.split(' ') || []));
    this.otherRecommendedValues.push(...(this.currentQuestion?.other_recommended_values.split(',') || []));
    this.variable = [];
    this.value = [];
    this.recomend = [];
  }

  nextQuestion(): void {
    const answer = {
      id: this.currentQuestion?.id?.toString() || '0',
      nfr: this.currentQuestion?.nfr || 'No seleccionada',
      variable: this.variable.join(' '),
      value: this.value.join(' '),
      recomend: this.recomend.join(' '),
    };

    const existingIndex = this.completedAnswers.findIndex(
      (item) => item.id === answer.id
    );
    if (existingIndex !== -1) {
      this.completedAnswers[existingIndex] = answer;
    } else {
      this.completedAnswers.push(answer);
    }

    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.clearContainers();
      this.showQuestion();
    } else {
      this.showConfirmationModal = true;
      //this.alertService.showAlert('¡Has terminado el juego!', false);
    }
  }

  canProceed(): boolean {
    return (
      this.variable.length > 0 &&
      this.value.length > 0 &&
      this.recomend.length > 0
    );
  }

  cancelSubmit(): void {
    this.showConfirmationModal = false;
  }

  submitAnswers(): void {
    this.loadingService.showLoading();

    clearInterval(this.interval);

    const body: BodyResultsQuestions = {
      game_room_id: Number(
        this.gameDataParamsService.getGameRoomIdLocalStorage() //ID DEL ROOM
      ),
      duration: this.formatTime(this.timer),
      answers: this.completedAnswers.map((answer) => ({
        id: answer.id,
        variable: answer.variable || 'No seleccionada',
        value: answer.value || 'No seleccionada',
        recomend: answer.recomend || 'No seleccionada',
      })),
    };

    this.questionService.getResultsQuestions(body).subscribe({
      next: (response) => {
        this.loadingService.hideLoading();
        this.gameDataParamsService.clearGameDataLocalStorage();
        localStorage.removeItem('timer');
        console.log('onsubmit respuesta:', response);
        this.gameDataParamsService.setGameResult(response);
        // localStorage.setItem('gameResult', JSON.stringify(response.data)); //BORRAR
        this.router.navigate(['/results']);
      },
      error: (error) => {
        this.loadingService.hideLoading();
        this.alertService.showAlert(error.message, true);
      },
    });
  }

  previousQuestion(): void {
    // if (this.timer >= 10) {
    //   console.log('No puedes retroceder después de 2 minutos.');
    //   return; // Bloquear retroceso
    // }
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.showQuestion();
    } else {
      alert('No hay preguntas anteriores');
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    // if (this.isDraggingBlocked) {
    //   console.log('El arrastre está bloqueado después de 2 minutos.');
    //   return; // Bloquear el arrastre
    // }
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      if (this.currentDraggingItem) {
        const draggedItemIndex = event.previousContainer.data.indexOf(
          this.currentDraggingItem[0]
        );

        if (draggedItemIndex !== -1) {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            draggedItemIndex,
            event.currentIndex
          );
        } else {
          console.error(
            'El elemento arrastrado no se encontró en el contenedor anterior.'
          );
        }
      }
      this.answers[this.currentQuestionIndex] = {
        variable: this.variable,
        value: this.value,
        recomend: this.recomend,
        availableWords: this.questionWords,
        otherRecommendedValues: this.otherRecommendedValues,
      };
    }
  }

  onDragMove(item: string) {
    this.currentDraggingItem.length = 0;
    this.currentDraggingItem.push(item);
  }

  clearContainers(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
    this.variable = [];
    this.value = [];
    this.recomend = [];
  }

  ngOnDestroy() {
    if (this.againQuestionSubscription) {
      this.againQuestionSubscription.unsubscribe();
    }
    clearInterval(this.interval);
  }

  startTimer(): void {

    //*********************/
  //   this.timer = 10; // Tiempo inicial en segundos (ejemplo: 2 minutos)
  // this.interval = setInterval(() => {
  //   this.timer--;
  //  //localStorage.setItem('timer', this.timer.toString());

  //   if (this.timer <= 0) {
  //     this.timer = 0;
  //     this.blockDragging();
  //     this.nextQuestion();
  //     this.isButtonCloseConfirm = false;
  //   }
  // }, 1000);
    /********************/
    //ANTIGUO
    this.interval = setInterval(() => {
      this.timer++;
      localStorage.setItem('timer', this.timer.toString());
    }, 1000);

    //NUEVO
    // this.interval = setInterval(() => {
    //   this.timer++;
    //   localStorage.setItem('timer', this.timer.toString());
  
    //   // Bloquear cuando pasan 2 minutos
    //   if (this.timer >= 10) {
    //     this.blockDragging();
    //     this.nextQuestion();
    //   }
    // }, 1000);
  }

  

  isDraggingBlocked: boolean = false;

  blockDragging(): void {
    this.isDraggingBlocked = true;
  }

  resetTimer(): void {
    this.timer = 0;
    localStorage.setItem('timer', '0');
  }

  formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }

  openInfoModal(type: string): void {
    switch (type) {
      case 'variable':
        this.modalTitle = 'Variable Lingüística';
        this.modalContent = 'Es una variable que puede tomar valores expresados en términos lingüísticos, es decir, palabras o frases en lugar de números precisos. Por ejemplo, "Rendimiento del sistema" es una variable lingüística que describe una propiedad medible.';
        // this.contenidoHTML = ` <ul class="list-disc pl-4">
        //     <li><strong>Variable lingüística:</strong> "Rendimiento del sistema"</li>
        //     <li><strong>Valores lingüísticos: </strong> "Alto", "Medio", "Bajo"</li>
        // </ul>`;
        //this.modalContent = 'Es una variable cuyo valor no es un número, sino una palabra o frase en lenguaje natural. Es común en la lógica difusa y permite modelar información subjetiva o imprecisa. Ejemplo: "Rendimiento del sistema: alto, medio, bajo".'
        // this.modalContent = 'Es una variable que representa una característica o propiedad de interés en términos cualitativos. Por ejemplo, en el ámbito de los RNF, podríamos tener variables lingüísticas como "rendimiento del sistema", "usabilidad" o "seguridad".';
        break;
      case 'value':
        this.modalTitle = 'Valor Lingüístico';
        this.modalContent = 'Son las posibles categorías o etiquetas que la variable lingüística puede asumir. En el caso de "Rendimiento del sistema", los valores lingüísticos podrían ser por ejemplo: "bajo", "medio" y "alto".';
        // this.contenidoHTML = '';
          //this.modalContent = 'Un valor lingüística es un concepto utilizado principalmente en lógica difusa (fuzzy logic) y representa un valor que puede expresarse mediante términos o palabras de un lenguaje natural en lugar de valores numéricos estrictos. Estos términos suelen ser etiquetas lingüísticas como "bajo", "alto", "medio", "rápido", "lento", entre otros.';
        break;
      case 'recomend':
        this.modalTitle = 'Recomendación Lingüística';
        this.modalContent = 'Son terminos adicionales que usamos para describir los diferentes niveles de esa caracteristica. Si ya tienes "alto", los otros valores lingüísticos serian "bajo".';
        break;
      default:
        this.modalTitle = '';
        this.modalContent = '';
    }
    this.showInfoModal = true; 
  }
}



// import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
// import {
//   CdkDragDrop,
//   DragDropModule,
//   moveItemInArray,
//   transferArrayItem,
// } from '@angular/cdk/drag-drop';
// import { Question } from '../interfaces/Questions';
// import { QuestionsService } from '../services/questions.service';
// import { CommonModule } from '@angular/common';
// import { MatButtonModule } from '@angular/material/button';
// import { Subscription } from 'rxjs';
// import { Router } from '@angular/router';
// import { GameDataParamsService } from '../../game/params/game-data-params.service';
// import { AlertService } from '../../shared/alert.service';
// import { BodyResultsQuestions } from '../interfaces/BodyResultsQuestions';
// import { LoadingService } from '../../shared/loading.service';

// @Component({
//   selector: 'app-questions',
//   standalone: true,
//   imports: [DragDropModule, CommonModule, MatButtonModule],
//   templateUrl: './questions.component.html',
//   styleUrl: './questions.component.css',
//   providers: [QuestionsService],
// })
// export default class QuestionsComponent implements OnInit {
//   questions: Question[] = [];
//   currentQuestion: Question | undefined;
//   currentQuestionIndex = 0;
//   questionWords: string[] = [];
//   otherRecommendedValues: string[] = [];
//   variable: string[] = [];
//   //feedback1: string[] = [];
//   value: string[] = [];
//   //feedback2: string[] = [];
//   recomend: string[] = [];
//   //feedback3: string[] = [];
//   //validar: string[] = [];
//   currentDraggingItem: string[] = [];

//   timer: number = 0;
//   interval: any;

//   // alertMessage: string = '';
//   // title: string = '';

//   modalTitle: string = '';
//   modalContent: string = '';
//   contenidoHTML: string = '';
//   showInfoModal: boolean = false;

//   showInstructions: boolean = true;

//   showConfirmationModal: boolean = false;

//   completedAnswers: {
//     id: string;
//     nfr : string;
//     variable: string;
//     value: string;
//     recomend: string;
//   }[] = [];

//   private againQuestionSubscription: Subscription | undefined;

//   answers: {
//     variable: string[];
//     value: string[];
//     recomend: string[];
//     availableWords: string[];
//     otherRecommendedValues: string[];
//   }[] = [];

//   constructor(
//     private loadingService: LoadingService,
//     private alertService: AlertService,
//     private questionService: QuestionsService,
//     private router: Router,
//     private gameDataParamsService: GameDataParamsService
//   ) {}

//   ngOnInit(): void {
//     const storedTime = localStorage.getItem('timer');
//     this.timer = storedTime ? parseInt(storedTime, 10) : 0;

//     if (this.showInstructions) {
//       const instructionsElement = document.getElementById('instructionsAlert');
//       if (instructionsElement) {
//         instructionsElement.style.display = 'flex';
//       }
//     }

//     const gameDataParams = this.gameDataParamsService.getGameData();

//     if (gameDataParams != null) {
//       this.questions = gameDataParams;
//       this.showQuestion();
//     } else {
//       const dataGameStorage =
//         this.gameDataParamsService.getGameDataLocalStorage();
//       if (dataGameStorage != null) {
//         this.questions = dataGameStorage;
//         this.showQuestion();
//       } else {
//         this.router.navigate(['/game']);
//       }
//     }

//     this.againQuestionSubscription =
//       this.questionService.againQuestion$.subscribe((res) => {
//         console.log('againQuestion$ called');
//         this.againQuestion();
//       });
//   }

//   closeInstructions(): void {
//     this.showInstructions = false;
//     const instructionsElement = document.getElementById('instructionsAlert');
//     if (instructionsElement) {
//       this.startTimer();
//       instructionsElement.style.display = 'none';
//     }
//   }

//   showQuestion(): void {
//     this.currentQuestion = this.questions[this.currentQuestionIndex];
//     if (this.answers[this.currentQuestionIndex]) {
//       this.variable = this.answers[this.currentQuestionIndex].variable;
//       this.value = this.answers[this.currentQuestionIndex].value;
//       this.recomend = this.answers[this.currentQuestionIndex].recomend;
//       this.questionWords =
//         this.answers[this.currentQuestionIndex].availableWords;
//       this.otherRecommendedValues =
//         this.answers[this.currentQuestionIndex].otherRecommendedValues;
//     } else {
//       this.variable = [];
//       this.value = [];
//       this.recomend = [];
//       this.questionWords = [...(this.currentQuestion?.nfr.split(' ') || [])];
//       this.otherRecommendedValues =
//         this.currentQuestion?.other_recommended_values.split(',') || [];
//       this.answers[this.currentQuestionIndex] = {
//         variable: this.variable,
//         value: this.value,
//         recomend: this.recomend,
//         availableWords: this.questionWords,
//         otherRecommendedValues: this.otherRecommendedValues,
//       };
//     }
//   }

//   againQuestion(): void {
//     this.currentQuestion = this.questions[this.currentQuestionIndex];
//     this.questionWords.length = 0;
//     this.otherRecommendedValues.length = 0;
//     this.questionWords.push(...(this.currentQuestion?.nfr.split(' ') || []));
//     this.otherRecommendedValues.push(
//       ...(this.currentQuestion?.other_recommended_values.split(',') || [])
//     );
//     this.variable = [];
//     this.value = [];
//     this.recomend = [];
//   }

//   nextQuestion(): void {
//     const answer = {
//       id: this.currentQuestion?.id?.toString() || '0',
//       nfr: this.currentQuestion?.nfr || 'No seleccionada',
//       variable: this.variable.join(' '),
//       value: this.value.join(' '),
//       recomend: this.recomend.join(' '),
//     };

//     const existingIndex = this.completedAnswers.findIndex(
//       (item) => item.id === answer.id
//     );
//     if (existingIndex !== -1) {
//       this.completedAnswers[existingIndex] = answer;
//     } else {
//       this.completedAnswers.push(answer);
//     }

//     if (this.currentQuestionIndex < this.questions.length - 1) {
//       this.clearContainers();
//       this.showQuestion();
//     } else {
//       this.showConfirmationModal = true;
//       console.log('Respuestas completadas:', this.completedAnswers);
//       //this.alertService.showAlert('¡Has terminado el juego!', false);
//     }
//   }

//   canProceed(): boolean {
//     return (
//       this.variable.length > 0 &&
//       this.value.length > 0 &&
//       this.recomend.length > 0
//     );
//   }

//   cancelSubmit(): void {
//     this.showConfirmationModal = false;
//   }

//   submitAnswers(): void {
//     this.loadingService.showLoading();

//     clearInterval(this.interval);

//     const body: BodyResultsQuestions = {
//       game_room_id: Number(
//         this.gameDataParamsService.getGameRoomIdLocalStorage()
//       ),
//       duration: this.formatTime(this.timer),
//       answers: this.completedAnswers.map((answer) => ({
//         id: answer.id,
//         variable: answer.variable || 'No seleccionada',
//         value: answer.value || 'No seleccionada',
//         recomend: answer.recomend || 'No seleccionada',
//       })),
//     };

//     this.questionService.getResultsQuestions(body).subscribe({
//       next: (response) => {
//         this.loadingService.hideLoading();
//         this.gameDataParamsService.clearGameDataLocalStorage();
//         this.gameDataParamsService.removeGameRoomIdLocalStorage();
//         localStorage.removeItem('timer');
//         this.gameDataParamsService.setGameResult(response);
//         // localStorage.setItem('gameResult', JSON.stringify(response.data)); //BORRAR
//         this.router.navigate(['/results']);
//       },
//       error: (error) => {
//         this.loadingService.hideLoading();
//         this.alertService.showAlert(error.message, true);
//       },
//     });
//   }

//   previousQuestion(): void {
//     if (this.currentQuestionIndex > 0) {
//       this.currentQuestionIndex--;
//       this.showQuestion();
//     } else {
//       alert('No hay preguntas anteriores');
//     }
//   }

//   drop(event: CdkDragDrop<string[]>) {
//     if (event.previousContainer === event.container) {
//       moveItemInArray(
//         event.container.data,
//         event.previousIndex,
//         event.currentIndex
//       );
//     } else {
//       if (this.currentDraggingItem) {
//         const draggedItemIndex = event.previousContainer.data.indexOf(
//           this.currentDraggingItem[0]
//         );

//         if (draggedItemIndex !== -1) {
//           transferArrayItem(
//             event.previousContainer.data,
//             event.container.data,
//             draggedItemIndex,
//             event.currentIndex
//           );
//         } else {
//           console.error(
//             'El elemento arrastrado no se encontró en el contenedor anterior.'
//           );
//         }
//       }
//       this.answers[this.currentQuestionIndex] = {
//         variable: this.variable,
//         value: this.value,
//         recomend: this.recomend,
//         availableWords: this.questionWords,
//         otherRecommendedValues: this.otherRecommendedValues,
//       };
//     }
//   }

//   onDragMove(item: string) {
//     this.currentDraggingItem.length = 0;
//     this.currentDraggingItem.push(item);
//   }

//   clearContainers(): void {
//     if (this.currentQuestionIndex < this.questions.length - 1) {
//       this.currentQuestionIndex++;
//     }
//     this.variable = [];
//     this.value = [];
//     this.recomend = [];
//   }

//   ngOnDestroy() {
//     if (this.againQuestionSubscription) {
//       this.againQuestionSubscription.unsubscribe();
//     }
//     clearInterval(this.interval);
//   }

//   startTimer(): void {
//     this.interval = setInterval(() => {
//       this.timer++;
//       localStorage.setItem('timer', this.timer.toString());
//     }, 1000);
//   }

//   resetTimer(): void {
//     this.timer = 0;
//     localStorage.setItem('timer', '0');
//   }

//   formatTime(seconds: number): string {
//     const hrs = Math.floor(seconds / 3600)
//       .toString()
//       .padStart(2, '0');
//     const mins = Math.floor((seconds % 3600) / 60)
//       .toString()
//       .padStart(2, '0');
//     const secs = (seconds % 60).toString().padStart(2, '0');
//     return `${hrs}:${mins}:${secs}`;
//   }

//   openInfoModal(type: string): void {
//     switch (type) {
//       case 'variable':
//         this.modalTitle = 'Variable Lingüística';
//         this.modalContent = 'Es una variable que puede tomar valores expresados en términos lingüísticos, es decir, palabras o frases en lugar de números precisos. Por ejemplo, "Rendimiento del sistema" es una variable lingüística que describe una propiedad medible.';
//         // this.contenidoHTML = ` <ul class="list-disc pl-4">
//         //     <li><strong>Variable lingüística:</strong> "Rendimiento del sistema"</li>
//         //     <li><strong>Valores lingüísticos: </strong> "Alto", "Medio", "Bajo"</li>
//         // </ul>`;
//         //this.modalContent = 'Es una variable cuyo valor no es un número, sino una palabra o frase en lenguaje natural. Es común en la lógica difusa y permite modelar información subjetiva o imprecisa. Ejemplo: "Rendimiento del sistema: alto, medio, bajo".'
//         // this.modalContent = 'Es una variable que representa una característica o propiedad de interés en términos cualitativos. Por ejemplo, en el ámbito de los RNF, podríamos tener variables lingüísticas como "rendimiento del sistema", "usabilidad" o "seguridad".';
//         break;
//       case 'value':
//         this.modalTitle = 'Valor Lingüístico';
//         this.modalContent = 'Son las posibles categorías o etiquetas que la variable lingüística puede asumir. En el caso de "Rendimiento del sistema", los valores lingüísticos podrían ser por ejemplo: "bajo", "medio" y "alto".';
//         // this.contenidoHTML = '';
//           //this.modalContent = 'Un valor lingüística es un concepto utilizado principalmente en lógica difusa (fuzzy logic) y representa un valor que puede expresarse mediante términos o palabras de un lenguaje natural en lugar de valores numéricos estrictos. Estos términos suelen ser etiquetas lingüísticas como "bajo", "alto", "medio", "rápido", "lento", entre otros.';
//         break;
//       case 'recomend':
//         this.modalTitle = 'Recomendación Lingüística';
//         this.modalContent = 'Son terminos adicionales que usamos para describir los diferentes niveles de esa caracteristica. Si ya tienes "alto", los otros valores lingüísticos serian "bajo".';
//         break;
//       default:
//         this.modalTitle = '';
//         this.modalContent = '';
//     }
//     this.showInfoModal = true; 
//   }
// }
