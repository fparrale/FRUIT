import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GameRoomsService } from '../game-rooms/services/game-rooms.service';
import { AlertService } from '../shared/alert.service';
import { LoadingService } from '../shared/loading.service';
import { GraficService } from '../grafic/services/GraficService.service';
import { ChartDataInput } from '../grafic/interfaces/ChartDataInput';
import { LineChartComponent } from "../grafic/line-chart/line-chart.component";

export interface ParticipatingPlayersInterface {
  id: number;
  code: string;
  score: string;
  user_id: number;
  names: string;
  surnames: string;
  answered_questions: AnsweredQuestion[];
  duration: string;
}

export interface AnsweredQuestion {
  id: string;
  nfr: string;
  user_variable: string;
  feedback_variable: string;
  correct_variable: boolean;
  user_value: string;
  feedback_value: null;
  correct_value: boolean;
  user_recomend: string;
  feedback_recomend: null | string;
  correct_recomend: boolean;
}

@Component({
  selector: 'app-participants-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, LineChartComponent],
  templateUrl: './participants-list.component.html',
  styleUrl: './participants-list.component.css',
})
export default class ParticipantsListComponent implements OnInit {
  participatingPlayers: ParticipatingPlayersInterface[] = [];

  paginatedData: ParticipatingPlayersInterface[] = [];
  currentPage = 1;
  itemsPerPage = 10;

  showModal: boolean = false;
  selectedAnswers: AnsweredQuestion[] = [];

  gameHistoryPrint: ParticipatingPlayersInterface = {} as ParticipatingPlayersInterface;
  areAllChartsRendered: boolean = false;
  print: boolean = false;
  graficas: any[] = [];
  gameRoomId: number = 0;

  constructor(
    private gameRoomsService: GameRoomsService,
    private alertService: AlertService,
    private loadingService: LoadingService,
    // private router: Router,
    private route: ActivatedRoute,
    private graficChartService: GraficService
  ) {}

  ngOnInit() {
    this.loadingService.showLoading();
    this.gameRoomId = Number(this.route.snapshot.paramMap.get('id'));
    this.gameRoomsService.getParticipatingPlayersByGameRoom(this.gameRoomId)
      .subscribe({
        next: (response) => {
          this.loadingService.hideLoading();
          this.participatingPlayers = response.data;
          this.updatePagination();
        },
        error: (error) => {
          this.loadingService.hideLoading();
          this.alertService.showAlert(error.message, true);
        },
      });
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedData = this.participatingPlayers.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  nextPage() {
    if (
      this.currentPage * this.itemsPerPage <
      this.participatingPlayers.length
    ) {
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
    return Math.ceil(this.participatingPlayers.length / this.itemsPerPage);
  }

  openAnswersModal(answers: AnsweredQuestion[], gameHistory: ParticipatingPlayersInterface): void {
    this.selectedAnswers = answers;
    this.gameHistoryPrint = gameHistory;

    this.graficChartService.getGraficByRoomAndQuestionAndUser(this.gameRoomId, -1, gameHistory.user_id).subscribe(
      (response) => {
        if (response.data.length > 0) {
          this.graficas = response.data;
        }

        this.showModal = true;
      },
      (error) => {
        console.error('Error al obtener la gráfica:', error.message);
      }
    );
  }

  onChartRendered(canvas: HTMLCanvasElement): void {
    const img = document.createElement('img');
    img.src = canvas.toDataURL();
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';
    img.style.marginLeft = 'auto';
    img.style.marginRight = 'auto';
    canvas.parentNode?.replaceChild(img, canvas);
  }

  closeModal(): void {
    this.print = false;
    this.showModal = false;
    this.selectedAnswers = [];
    this.gameHistoryPrint = {} as ParticipatingPlayersInterface;
  }

  printResults(): void {

    this.print = true;

    const interval = setInterval(() => {

      const printContent = document.getElementById('print-content');
      const img = printContent?.getElementsByTagName('img');
      this.areAllChartsRendered = img?.length == this.graficas.length;

      if (this.areAllChartsRendered) {
        clearInterval(interval);

        const gameHistory = this.gameHistoryPrint;

        const score = gameHistory.score;
        const names = gameHistory.names;
        const surnames = gameHistory.surnames;
        const duration = gameHistory.duration;
        const code_sala = gameHistory.code;

        if (printContent) {
          document.title = `Resultados - ${surnames} ${names} - ${code_sala}`;

          const images = printContent?.getElementsByTagName('img');
          if (images) {
            for (let i = 0; i < images.length; i++) {
              const img = images[i];
              img.style.width = '90%';
              img.style.height = '40%';
              img.style.marginTop = '20px';
              img.style.marginBottom = '20px';
            }
          }

          const iframe = document.createElement('iframe');
          iframe.style.position = 'absolute';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.border = 'none';
          document.body.appendChild(iframe);

          const doc = iframe.contentWindow?.document || iframe.contentDocument;
          if (doc) {
            doc.open();
            doc.write(`
              <html>
                <head>
                <title>Resultados - ${surnames} ${names} - ${code_sala}</title>
                  <style>
                    body {
                      font-family: Arial, sans-serif;
                      margin: 20px;
                      color: #4a5568;
                    }
                    .header {
                      margin-bottom: 20px;
                      border-bottom: 1px solid #e2e8f0;
                      position: relative;
                    }
                    .score-box {
                      position: absolute;
                      top: 0;
                      right: 10px;
                      padding: 10px;
                      border: 2px solid #4a5568;
                      font-weight: bold;
                      font-size: 16px;
                      text-align: center;
                      color: #4a5568;
                      background-color: #f1f5f9;
                    }
                    .font-bold {
                      font-weight: bold;
                    }
                    .text-gray-700 {
                      color: #4a5568;
                    }
                    .text-green-500 {
                      color: #48bb78;
                    }
                    .text-red-500 {
                      color: #f56565;
                    }
                    .text-sm {
                      font-size: 0.875rem;
                    }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <div class="score-box">
                      SCORE<br>${score} / 100
                    </div>
                    <h2 class="font-bold text-gray-700">Resultado</h2>
                    <p><strong>Nombres:</strong> ${names}</p>
                    <p><strong>Apellidos:</strong> ${surnames}</p>
                    <p><strong>Duración:</strong> ${duration}</p>
                    <p><strong>Código de sala:</strong> ${code_sala}</p>
                  </div>
                  ${printContent.outerHTML}
                </body>
              </html>
            `);
            doc.close();
          }

          iframe.onload = () => {
            iframe.contentWindow?.print();
            document.title = 'FRUIT';
            document.body.removeChild(iframe);
            // volver a poner las imagenes con width 100%
            const images = printContent?.getElementsByTagName('img');
            if (images) {
              for (let i = 0; i < images.length; i++) {
                const img = images[i];
                img.style.width = '100%';
                img.style.height = 'auto';
                img.style.marginTop = '0px';
                img.style.marginBottom = '0px';
              }
            }
          };
        } else {
          console.error('No se encontró el contenido a imprimir.');
        }
      }
    }, 500);
  }
  
  graphicExists(questionId: string): boolean {
    return this.graficas.some((grafic) => grafic.question_id == questionId);
  }

  getChartData(questionId: string): ChartDataInput{
    return this.graficas.find((grafic) => grafic.question_id == questionId).data;
  }
  
}
