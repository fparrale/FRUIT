import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LinguisticValueComponent } from "./linguistic-value/linguistic-value.component";
import { PersonalizeScaleComponent } from "./personalize-scale/personalize-scale.component";
import { LineChartComponent } from "./line-chart/line-chart.component";
import { TranslateModule } from '@ngx-translate/core';
import { ChartDataInput } from './interfaces/ChartDataInput';
import { GameDataParamsService } from '../game/params/game-data-params.service';
import { ResultsQuestionsResponse } from '../results/interfaces/ResultsQuestionsResponse';
import { GraficService } from './services/GraficService.service';
import { GraficChartGameModel } from './interfaces/ApiResponse';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../shared/alert.service';

@Component({
  selector: 'app-grafic',
  standalone: true,
  imports: [CommonModule, FormsModule, LinguisticValueComponent, PersonalizeScaleComponent, LineChartComponent, TranslateModule],
  templateUrl: './grafic.component.html',
  styleUrl: './grafic.component.css'
})

export default class GraficComponent {
  modalTitle: string = 'Agregar valor lingüístico';
  isEditing: boolean = false;
  selectedLinguisticVariable: string = '';
  showAddValueModal: boolean = false;
  showEditValueModal: boolean = false;
  showScaleModal: boolean = false;
  currentXAxisLimit: number = 1;
  currentYAxisStep: number = 0.5;
  initialXLimit: number = 1;
  initialYStep: number = 0.5;
  chartData: ChartDataInput = {
    linguisticVariable: '',
    linguisticValues: [],
    xAxisLimit: this.currentXAxisLimit,
    yAxisStep: this.currentYAxisStep
  };
  editingValue: any = null;
  maxXFromFunctions: number = 0;
  game_room_id = 48;
  question_id = 1;
  rnf_desc = '';
  
  currentVariableValues: string[] = [];
  isEditMode: boolean = false;
  //RESULTADOS DATA
  resultData: ResultsQuestionsResponse | null = null;

  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    private gameDataService: GameDataParamsService,
    private cdr: ChangeDetectorRef ,
    private graficChartService: GraficService,
    private router: Router) {
    this.updateXAxisLimit();
  }

  ngOnInit(): void {    

    this.game_room_id = Number(this.gameDataService.getGameRoomIdLocalStorage()) ?? 0;
    this.question_id = Number(this.gameDataService.getQuestionIDLocalStorage()) ?? 0;

    const questions = this.gameDataService.getQuestionsGameLocalStorage();
    const rnf = questions?.find((question: any) => question.id === this.question_id);

    this.route.queryParams.subscribe(params => {
      this.isEditMode = params['edit'] === 'true';
    });

    if (!this.isEditMode) {
      const flag = localStorage.getItem(`editMode_${this.question_id}`);
      this.isEditMode = flag === 'true';
    }

    if (this.game_room_id === 0 || this.question_id === 0 || !rnf) {
      this.gameDataService.removeGameRoomIdLocalStorage();
      this.gameDataService.clearQuestionIDLocalStorage();
      this.gameDataService.clearQuestionsGameLocalStorage();
      this.gameDataService.clearGameResultLocalStorage();
    
      this.router.navigate(['/game'], {
        queryParams: { mode: 'find' },
      });
    
      return; 
    }
    
    // Estas líneas deben ir después de la validación anterior
    this.rnf_desc = rnf.nfr || '';
    this.selectedLinguisticVariable = rnf.variable || '';
    this.currentVariableValues = [rnf.value, rnf.recomend];
    this.chartData.linguisticVariable = this.selectedLinguisticVariable;
    

   // EDITAR
    if (this.isEditMode) {
      this.graficChartService.getGraficByRoomAndQuestionAndUser(this.game_room_id, this.question_id, -1).subscribe(
        (response) => {
          if (response.data.length > 0) {
            this.chartData = response.data[0].data;
            this.chartData.linguisticVariable = this.selectedLinguisticVariable;
            this.currentXAxisLimit = this.chartData.xAxisLimit;
            this.currentYAxisStep = this.chartData.yAxisStep;
          } else {
            console.log('No hay datos de la gráfica para esta sala y pregunta.');
          }
        },
        (error) => {
          console.error('Error al obtener la gráfica:', error.message);
        }
      );
    } else {
      // Modo de creación
      this.chartData.linguisticVariable = this.selectedLinguisticVariable;
    }
   
  }
  


  backResults(): void {

    if (this.chartData.linguisticValues.length > 0) {

      const continuar = confirm('La grafica no se ha guardado. ¿Desea continuar?');
      if (!continuar) {
        return;
      }      
    }

    this.router.navigate(['/results']);
  }


  saveGrafic(): void {
    // Validación existente
    if (this.chartData.linguisticValues.length !== 2) {
      this.alertService.showAlert(
        'Faltan valores linguísticos por graficar.',
        true
      );
      return;
    }

    const dataToSave: GraficChartGameModel = {
      game_room_id: this.game_room_id,
      question_id: this.question_id,
      data: this.chartData
    };

    if (this.isEditMode) {


      this.graficChartService.updateGraphics(dataToSave).subscribe(
        () => {
          this.alertService.showAlert(
            'Gráfica actualizada correctamente.',
            false
          );
          // No necesitamos marcar como graficado aquí porque ya estaba marcado
          this.router.navigate(['/results']);
        },
        (error) => {
          console.error('Error al actualizar la gráfica:', error.message);
        }
      );
    } else {
      this.graficChartService.createGraphics(dataToSave).subscribe(
        () => {
          this.alertService.showAlert(
            'Gráfica guardada correctamente.',
            false
          );
          
          // AQUÍ es donde debemos marcar el RNF como graficado
          this.graficChartService.markRnfAsGraphed(this.question_id.toString());
          
          this.router.navigate(['/results']);
        },
        (error) => {
          console.error('Error al guardar la gráfica:', error.message);
        }
      );
    }
  }



  areNewValuesAvailable(): boolean {  
    this.currentVariableValues = this.currentVariableValues.filter((value) => {
      return !this.chartData.linguisticValues.some((lv) => lv.nameValue === value);
    });
    return this.currentVariableValues.length > 0;
  }


  closeAddValueModal() {
    this.showAddValueModal = false;
  }
  

  openAddValueModal() {
    this.editingValue = null;    
    this.showAddValueModal = true;  
    this.currentVariableValues = this.currentVariableValues.filter((value) => {
      return !this.chartData.linguisticValues.some((lv) => lv.nameValue === value);
    });
  }


  openEditValueModal(value: any) {
    if (value) {
      this.editingValue = { ...value, isEditing: true };
      this.modalTitle = 'Editar valor lingüístico';
      this.isEditing = true;
    } else {
      this.editingValue = { isEditing: false };
      this.modalTitle = 'Agregar valor lingüístico';
      this.isEditing = false;
    }
    this.showEditValueModal = true;
  }


  closeEditValueModal() {
    this.showEditValueModal = false;
    this.editingValue = null;
  }


  onValueAdded(newValue: any) {
    this.chartData = {
      ...this.chartData,
      linguisticValues: [...this.chartData.linguisticValues, newValue]
    };
    this.updateXAxisLimit();
    this.currentXAxisLimit = Math.max(this.currentXAxisLimit, this.initialXLimit);
    this.chartData.xAxisLimit = this.currentXAxisLimit;
  }

  onValueEdited(editedValue: any) {
    const index = this.chartData.linguisticValues.findIndex(
      (lv) => lv.nameValue === editedValue.nameValue
    );
    if (index !== -1) {
      const updatedFunctions = [...this.chartData.linguisticValues];
      updatedFunctions[index] = { ...editedValue };
      this.chartData = { ...this.chartData, linguisticValues: updatedFunctions };
      this.updateXAxisLimit();
      this.currentXAxisLimit = Math.max(this.currentXAxisLimit, this.initialXLimit);
      this.chartData.xAxisLimit = this.currentXAxisLimit;
      this.cdr.detectChanges();
    }
    this.closeEditValueModal();
  }

  openScaleModal() {
    this.updateXAxisLimit();
    this.initialXLimit = this.currentXAxisLimit;
    this.initialYStep = this.currentYAxisStep;
    this.cdr.detectChanges();
    this.showScaleModal = true;
    this.maxXFromFunctions = this.getMaxXFromAllFunctions();
  }

  closeScaleModal() {
    this.showScaleModal = false;
  }

  onScaleApplied(scale: { xAxisLimit: number; yAxisStep: number }) {
    this.currentXAxisLimit = scale.xAxisLimit;
    this.currentYAxisStep = scale.yAxisStep;
    this.chartData = {
      ...this.chartData,
      xAxisLimit: this.currentXAxisLimit,
      yAxisStep: this.currentYAxisStep
    };
  }

  updateXAxisLimit() {
    let maxX = 0;
    this.chartData.linguisticValues.forEach((lv) => {
      if (lv.functionType === 'trapezoidal' && lv.points) {
        maxX = Math.max(maxX, lv.points.a, lv.points.b, lv.points.c, lv.points.d);
      } else if (lv.functionType === 'triangular' && lv.points) {
        maxX = Math.max(maxX, lv.points.a, lv.points.b, lv.points.c);
      } else if (lv.functionType === 'sigmoide' && lv.points) {
        maxX = Math.max(maxX, lv.points.a, lv.points.b, lv.points.c, lv.points.d, lv.points.e);
      }
    });
    this.initialXLimit = Math.max(1, maxX);
    if (this.currentXAxisLimit < this.initialXLimit) {
      this.currentXAxisLimit = this.initialXLimit;
      this.chartData.xAxisLimit = this.currentXAxisLimit;
    }
  }

  getMaxXFromAllFunctions(): number {
    let maxX = 0;
    this.chartData.linguisticValues.forEach((lv) => {
      if (lv.functionType === 'trapezoidal' && lv.points) {
        maxX = Math.max(maxX, lv.points.a, lv.points.b, lv.points.c, lv.points.d);
      } else if (lv.functionType === 'triangular' && lv.points) {
        maxX = Math.max(maxX, lv.points.a, lv.points.b, lv.points.c);
      } else if (lv.functionType === 'sigmoide' && lv.points) {
        maxX = Math.max(maxX, lv.points.a, lv.points.b, lv.points.c, lv.points.d, lv.points.e);
      }
    });
    return maxX;
  }
  
}