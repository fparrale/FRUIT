import { Component, Input, ViewChild } from '@angular/core';
import { QuestionsService } from '../questions/services/questions.service';
import { CommonModule } from '@angular/common';
import { GameDataParamsService } from '../game/params/game-data-params.service';
import { Router } from '@angular/router';
import { Question, Questions, QuestionTransformed } from '../questions/interfaces/Questions';
import { TimerComponent } from '../timer/timer.component';

@Component({
  selector: 'app-practice-questions',
  standalone: true,
  imports: [TimerComponent, CommonModule],
  templateUrl: './practice-questions.component.html',
  styleUrl: './practice-questions.component.css',
  providers: [QuestionsService]
})
export class PracticeQuestionsComponent {

  constructor(private questionService: QuestionsService, private router: Router, private gameDataParamsService: GameDataParamsService) {}

  @Input() question!: QuestionTransformed;
  @ViewChild(TimerComponent) timer!: TimerComponent;

  currentStep: 'variable' | 'value' | 'recommendation' = 'variable';
  selectedOption: string = '';
  feedback: string = '';
  isCorrect: boolean = false;
  showNextButton: boolean = false;
  currentTimeRemaining: number = 30;
  questionIndex: number = 0;
  totalScore = 0;
  gameCompleted = false;
  totalScoreCompleted = 0;
  score = 0;

  questions: Questions[] = [];
  questionsTransformed: QuestionTransformed[] = [];
  currentQuestion: Question | undefined;
  currentQuestionIndex = 0;
  questionWords: string[] = [];
  variable: string[] = [];
  feedback1: string[] = [];
  value: string[] = [];
  feedback2: string[] = [];
  recomend: string[] = [];
  feedback3: string[] = [];
  validar: string[] = [];

  answers: { variable: string[], value: string[], recomend: string[], availableWords: string[] }[] = []; 

  ngOnInit(): void {
    const gameDataParams = this.gameDataParamsService.getGameData();
    let totalSteps = 0;

    if(gameDataParams != null){
      this.questions = gameDataParams;
      this.questionsTransformed = this.transformQuestions(this.questions);
      this.question = this.questionsTransformed[this.questionIndex];
      totalSteps = this.questionsTransformed.length * 3; // 3 pasos por pregunta
      this.totalScoreCompleted = 100 / totalSteps;
    }else{
      const dataGameStorage = this.gameDataParamsService.getGamePracticeDataLocalStorage();

      if(dataGameStorage != null){
        this.questions = dataGameStorage;
        this.questionsTransformed = this.transformQuestions(this.questions);
        this.question = this.questionsTransformed[this.questionIndex];
        totalSteps = this.questionsTransformed.length * 3; // 3 pasos por pregunta
        this.totalScoreCompleted = 100 / totalSteps;
      }else{
        this.router.navigate(['/game']);
      }
    }
  }

  updateTimeRemaining(time: number) {
    this.currentTimeRemaining = time;
  }

  onTimeUp() {
    if (!this.feedback) {
      this.checkAnswer(true);
    }
  }

  selectOption(option: string) {
    this.selectedOption = option;
    this.checkAnswer();
  }

  checkAnswer(timeUp: boolean = false) {
    if (timeUp && !this.selectedOption) {
      this.feedback = '¡Se acabó el tiempo! Debes seleccionar una opción más rápido.';
      this.isCorrect = false;
      this.showNextButton = true;
      return;
    }

    const currentStepData = this.question[this.currentStep];
    this.isCorrect = this.selectedOption === currentStepData.correct;
    this.feedback = currentStepData.feedback;
    this.showNextButton = true;
  }

  // get isLastStep(): boolean {
  //   return this.currentStep === 'recommendation';
  // }

  // nextStep() {
  //   const score = this.isCorrect ? this.currentTimeRemaining : 0;

  //   if (this.isLastStep) {
  //     this.completed.emit(score);
  //   } else {
  //     this.selectedOption = '';
  //     this.feedback = '';
  //     this.showNextButton = false;

  //     if (this.currentStep === 'variable') {
  //       this.currentStep = 'value';
  //     } else if (this.currentStep === 'value') {
  //       this.currentStep = 'recommendation';
  //     }

  //     this.timer.resetTimer();
  //   }

  //   console.log(this.isLastStep);
  // }

  nextStep(): void {
    this.score = this.isCorrect ? this.totalScoreCompleted : 0;


    if (this.isLastStep) {
      this.onQuestionCompleted(0);
    } else {
      this.selectedOption = '';
      this.feedback = '';
      this.showNextButton = false;

      if (this.currentStep === 'variable') {
        this.currentStep = 'value';
      } else if (this.currentStep === 'value') {
        this.currentStep = 'recommendation';
      } else if (this.currentStep === 'recommendation') {
        this.questionIndex++;
        if (this.questionIndex < this.questionsTransformed.length) {
          this.question = this.questionsTransformed[this.questionIndex];
          this.currentStep = 'variable';
        } else {
          this.onQuestionCompleted(0);
        }
      }
      this.sumScore(this.score);
      this.timer.resetTimer();
    }
  }

  get isLastStep(): boolean {
    return this.currentStep === 'recommendation' && this.questionIndex === this.questionsTransformed.length - 1;
  }

  private generateRandomWords(): string[] {
    const randomWords = [];
    const characters = 'abcdefghijklmnopqrstuvwxyz';

    for (let i = 0; i < 3; i++) { // Generar 3 palabras
      let word = '';
      const wordLength = Math.floor(Math.random() * 5) + 3; // Palabras de 3 a 7 letras
      for (let j = 0; j < wordLength; j++) {
        word += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      randomWords.push(word);
    }

    return randomWords;
  }

  private generateOptionsWithVariations(correctWord: string): string[] {
    const variations = [
      `${correctWord}ly`,
      `super${correctWord}`, 
      `${correctWord}s`, 
      ...this.generateRandomWords(), 
    ];

    return Array.from(new Set([correctWord, ...variations])); 
  }

  private generateOptionsFromDictionary(correctWord: string): string[] {
    const dictionary = ['performance', 'speed', 'optimization', 'efficiency', 'scalability', 'latency'];
    const randomSelection = dictionary.sort(() => 0.5 - Math.random()).slice(0, 3); // Elegir 3 palabras al azar

    return Array.from(new Set([correctWord, ...randomSelection])); // Incluir la palabra correcta
  }

  private generateDynamicOptions(correctWord: string): string[] {
    const options = [
      ...this.generateRandomWords(), // Palabras aleatorias
      ...this.generateOptionsWithVariations(correctWord), // Variaciones de la palabra correcta
      ...this.generateOptionsFromDictionary(correctWord), // Diccionario temático
    ];

    const uniqueOptions = Array.from(new Set([...options]));
    if (!uniqueOptions.includes(correctWord)) {
      uniqueOptions.push(correctWord);
    }

    const shuffledOptions = this.shuffleArray(uniqueOptions);
    const limitedOptions = [correctWord, ...shuffledOptions.filter(word => word !== correctWord)].slice(0, 4);
    const shuffledOptionsOther = this.shuffleArray(limitedOptions);
    return this.reverseArray(shuffledOptionsOther);

  }

  private shuffleArray(array: string[]): string[] {
    return array.sort(() => Math.random() - 0.5);
  }
  
  private reverseArray(array: string[]): string[] {
    return array.reverse();
  }
  
  

  transformQuestions(questions: Questions[]): QuestionTransformed[] {
    return questions.map((q) => ({
      requirement: q.nfr,
      variable: {
        options: this.generateDynamicOptions(q.variable),
        correct: q.variable,
        feedback: q.feedback1,
      },
      value: {
        options: this.generateDynamicOptions(q.value),
        correct: q.value,
        feedback: q.feedback2,
      },
      recommendation: {
        options: this.generateDynamicOptions(q.recomend),
        correct: q.recomend,
        feedback: q.feedback3,
      },
    }));
  }

  onQuestionCompleted(score: number) {

    if (!this.currentQuestion) {
      this.gameCompleted = true;
    }
  }

  restartGame() {
    window.location.reload();
  }

  sumScore(score: number) {
    this.totalScore += score;
  }


}
