import { Injectable } from '@angular/core';
import { QuestionTransformed } from '../../questions/interfaces/Questions';

@Injectable({
  providedIn: 'root'
})
export class PracticesServicesService {

  constructor() { }

  private currentQuestionIndex = 0;
  private readonly timePerStep = 30; 


  getCurrentQuestion(questions: QuestionTransformed[]): QuestionTransformed | null {
    if (this.currentQuestionIndex < questions.length) {
      return questions[this.currentQuestionIndex];
    }
    return null;
  }

  nextQuestion(questions: QuestionTransformed[]) {
    this.currentQuestionIndex++;
    return this.getCurrentQuestion(questions);
  }

  resetGame() {
    this.currentQuestionIndex = 0;
  }

  calculateScore(timeRemaining: number): number {
    return Math.max(0, timeRemaining);
  }
}
