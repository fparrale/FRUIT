import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common'; 
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-personalize-scale',
  standalone: true,
  imports: [FormsModule, NgIf, TranslateModule],
  templateUrl: './personalize-scale.component.html',
  styleUrl: './personalize-scale.component.css'
})
  
export class PersonalizeScaleComponent implements OnInit, OnChanges {
  @Output() close = new EventEmitter<void>();
  @Output() scaleApplied = new EventEmitter<{ xAxisLimit: number; yAxisStep: number }>();
  @Input() initialXLimit: number = 1;
  @Input() initialYStep: number = 0.5;
  @Input() maxXFromFunctions: number = 1;

  xAxisLimit: number = 1;
  yAxisStep: number = 0.5;
  minXLimit: number = 1;
  hasCustomXLimit: boolean = false; // Nueva variable para rastrear si el usuario modificó el límite X

  ngOnInit(): void {
    this.xAxisLimit = this.initialXLimit;
    this.yAxisStep = this.initialYStep;

    this.minXLimit = this.maxXFromFunctions ?? this.initialXLimit;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialXLimit']) {
      const newInitialXLimit = changes['initialXLimit'].currentValue;
      this.minXLimit = newInitialXLimit;

      // Si el valor actual del input está por debajo del nuevo mínimo, lo ajustamos
      if (this.xAxisLimit < this.minXLimit) {
        this.xAxisLimit = this.minXLimit;
      }
    }

    if (changes['initialYStep']) {
      this.yAxisStep = changes['initialYStep'].currentValue;
    }
  }


  applyScale() {
    if (this.xAxisLimit >= this.minXLimit && this.yAxisStep >= 0.1 && this.yAxisStep <= 0.5) {
      this.scaleApplied.emit({ xAxisLimit: this.xAxisLimit, yAxisStep: this.yAxisStep });
      this.closeModal();
    }
  }

  closeModal() {
    this.close.emit();
  }

  updateMinXLimit(min: number) {
    this.minXLimit = Math.max(this.minXLimit, min);
    if (this.xAxisLimit < this.minXLimit) {
      this.xAxisLimit = this.minXLimit;
    }
  }
}