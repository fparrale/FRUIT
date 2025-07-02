import { Component, OnInit } from '@angular/core';
import { GameService } from './services/game.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameDataParamsService } from './params/game-data-params.service';
import { LoadingService } from '../shared/loading.service';
import { AlertService } from '../shared/alert.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StorageService } from '../shared/storage.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export default class GameComponent implements OnInit{
  gameCode: string = '';
  mode: string | null = null;

  constructor(
    private gameService: GameService,
    private router: Router,
    private route: ActivatedRoute,
    private gameDataParamsService: GameDataParamsService,
    private loadingService: LoadingService,
    private alertService: AlertService,
    private translate: TranslateService,
    private storageService: StorageService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.mode = params['mode'];
    });
  }
  ngOnInit(): void {
    // const language = this.storageService.getItem();
    // if (language) {
    //   this.translate.setDefaultLang(language);
    // }
  }
  submitCode() {
    if (this.gameCode.trim()) {
      this.loadingService.showLoading();
      if (this.mode == 'practice') {
        this.gameService.submitGameCodePractice(this.gameCode).subscribe({
          next: (response) => {
            this.loadingService.hideLoading();
            const gameData = response.questions;
            if (!gameData || gameData.length === 0) {
              this.alertService.showAlert(
                'No se encontraron preguntas para el juego, por favor comunicate con tu docente.'
              );
              return;
            } else {
              this.gameDataParamsService.setGamePracticeDataLocalStorage(
                gameData
              );
              this.gameDataParamsService.setGameRoomIdLocalStorage(
                response.game_room_id
              );
              this.gameDataParamsService.setGameDataPractice(gameData);
              if (this.mode === 'find') {
                this.router.navigate(['/quiz-game']);
              } else if (this.mode === 'practice') {
                this.router.navigate(['/practice-game']);
              }
            }
          },
          error: (error) => {
            this.loadingService.hideLoading();
            this.alertService.showAlert(error.message, true);
          },
        });
      } else {
        this.gameService.submitGameCode(this.gameCode, this.storageService.getItem() || 'es').subscribe({
          next: (response) => {
            this.loadingService.hideLoading();
            const gameData = response.questions;
            if (!gameData || gameData.length === 0) {
              if(this.storageService.getItem() === 'es'){
                this.alertService.showAlert('No se encontraron preguntas para el juego, por favor comunicate con tu docente.');
              }else{
                this.alertService.showAlert('No questions found for the game, please contact your teacher for more information.');  
              }
              return;
            } else {
              this.gameDataParamsService.setGameDataLocalStorage(gameData);
              this.gameDataParamsService.setGameRoomIdLocalStorage(
                response.game_room_id
              );
              this.gameDataParamsService.setGameData(gameData);
              if (this.mode === 'find') {
                this.router.navigate(['/quiz-game']);
              } else if (this.mode === 'practice') {
                this.router.navigate(['/practice-game']);
              }
            }
          },
          error: (error) => {
            this.loadingService.hideLoading();
            this.alertService.showAlert(error.message, true);
          },
        });
      }
    } else {
      if(this.storageService.getItem() === 'es'){
        this.alertService.showAlert('El código del juego no puede estar vacío.', true);
      }else{
        this.alertService.showAlert('The game code cannot be empty.', true);
      }
    }
  }
}
