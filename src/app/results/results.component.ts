import { Component, OnInit } from '@angular/core';
import { GameDataParamsService } from '../game/params/game-data-params.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ResultsQuestionsResponse } from './interfaces/ResultsQuestionsResponse';
import { TranslateModule } from '@ngx-translate/core';
import { GameRoomsService } from '../game-rooms/services/game-rooms.service';
import { GraficService } from '../grafic/services/GraficService.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css'
})
export default class ResultsComponent implements OnInit {
  resultData: ResultsQuestionsResponse | null = null;
  expandedIndex: number | null = null;
  //graphedRnfIds: string[] = [];


  constructor(private gameRoomService: GameRoomsService, private gameDataService: GameDataParamsService, private router: Router, private graficService : GraficService) {}

  ngOnInit(): void {
    const result = this.gameDataService.getGameResult();

    // Load graph status from localStorage
    this.graficService.loadGraphedRnfIds();

    if (result && result.data) {
      this.resultData = result.data;
      this.gameDataService.setGameResultLocalStorage(JSON.stringify(this.resultData));

    } else if (this.gameDataService.getGameResultLocalStorage() !== null) {
      
      this.resultData = this.gameDataService.getGameResultLocalStorage();

    } else {
      
      this.gameDataService.removeGameRoomIdLocalStorage();
      this.gameDataService.clearQuestionIDLocalStorage();
      this.gameDataService.clearQuestionsGameLocalStorage();
      this.gameDataService.clearGameResultLocalStorage();
      
      this.router.navigate(['/game'], {
        queryParams: { mode: 'find' },
      });
      
    }
  }

  toggleCard(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  backHome(): void {
    this.gameDataService.removeGameRoomIdLocalStorage();
    this.gameDataService.clearQuestionIDLocalStorage();
    this.gameDataService.clearQuestionsGameLocalStorage();
    this.gameDataService.clearGameResultLocalStorage();
   
    // Clear graphed RNFs status
    localStorage.removeItem('graphedRnfIds');

    // Remove all editMode keys from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('editMode_')) {
        localStorage.removeItem(key);
        i--;
      }
    }

    this.router.navigate(['/game'], {
      queryParams: { mode: 'find' }
    });
  }

  goGrafic(rnf_id: string): void {
    this.gameDataService.setQuestionIDLocalStorage(rnf_id);
    
    const editMode = this.isRnfGraphed(rnf_id);
    localStorage.setItem(`editMode_${rnf_id}`, editMode.toString());
    
    if (this.gameDataService.getQuestionsGameLocalStorage() === null) {
      this.gameRoomService
        .getGameRoomQuestions(
          Number(this.gameDataService.getGameRoomIdLocalStorage()) ?? 0
        )
        .subscribe(
          (response) => {
            this.gameDataService.setQuestionsGameLocalStorage(
              JSON.stringify(response.questions)
            );
            // Ya no llamamos a markRnfAsGraphed aquí
            this.router.navigate(['/grafic'], { queryParams: { edit: editMode } });
          },
          (error) => {
            console.error('Error al obtener preguntas de la sala:', error.message);
          }
        );
    } else {
      // Ya no llamamos a markRnfAsGraphed aquí tampoco
      this.router.navigate(['/grafic'], { queryParams: { edit: editMode } });
    }
  }

  isRnfGraphed(rnf_id: string): boolean {
    return this.graficService.isRnfGraphed(rnf_id);
  }

}