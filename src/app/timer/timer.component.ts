import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css'
})
export class TimerComponent implements OnInit, OnDestroy {
  @Input() duration: number = 60;
  @Output() timeUp = new EventEmitter<void>();
  @Output() timeRemainingChange = new EventEmitter<number>();

  timeRemaining: number = 60;
  private timer: any;

  ngOnInit() {
    this.timeRemaining = this.duration;
    this.startTimer();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  private startTimer() {
    this.timer = setInterval(() => {
      this.timeRemaining--;
      this.timeRemainingChange.emit(this.timeRemaining);

      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.timeUp.emit();
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  resetTimer() {
    this.stopTimer();
    this.timeRemaining = this.duration;
    this.startTimer();
  }
}
