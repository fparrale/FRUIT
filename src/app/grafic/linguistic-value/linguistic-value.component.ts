import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-linguistic-value',
  standalone: true,
  imports: [FormsModule, NgIf, CommonModule, TranslateModule], // Agrega CommonModule a los imports
  templateUrl: './linguistic-value.component.html',
  styleUrl: './linguistic-value.component.css'
})
  
export class LinguisticValueComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() valueAdded = new EventEmitter<any>();
  @Input() editingValue: any = null;
  @Input() availableValues: string[] = [];

  nameValue: string = '';
  functionType: string = 'trapezoidal';
  pointA: number | null = null;
  pointB: number | null = null;
  pointC: number | null = null;
  pointD: number | null = null;
  pointE: number | null = null;

  ngOnInit(): void {
    if (this.editingValue) {
      this.nameValue = this.editingValue.nameValue;
      this.functionType = this.editingValue.functionType;
      if (this.editingValue.points) {
        this.pointA = this.editingValue.points.a;
        this.pointB = this.editingValue.points.b;
        this.pointC = this.editingValue.points.c;
        this.pointD = this.editingValue.points.d;
        this.pointE = this.editingValue.points.e;
      }
    } else {
      this.onFunctionTypeChange();
      this.nameValue = this.availableValues[0] || ''; 
    }
  }

  onFunctionTypeChange() {
    this.pointA = null;
    this.pointB = null;
    this.pointC = null;
    this.pointD = null;
    this.pointE = null;
  }

  isValid(): boolean {
    if (!this.nameValue) {
      return false;
    }

    if (this.functionType === 'trapezoidal') {
      return (
        this.pointA !== null && this.pointA >= 0 &&
        this.pointB !== null && this.pointB >= 0 &&
        this.pointC !== null && this.pointC >= 0 &&
        this.pointD !== null && this.pointD >= 0 &&
        this.pointA < this.pointB &&
        this.pointB < this.pointC &&
        this.pointC < this.pointD
      );
    } else if (this.functionType === 'triangular') {
      return (
        this.pointA !== null && this.pointA >= 0 &&
        this.pointB !== null && this.pointB >= 0 &&
        this.pointC !== null && this.pointC >= 0 &&
        this.pointA < this.pointB &&
        this.pointB < this.pointC
      );
    } else if (this.functionType === 'sigmoide') {
      return (
        this.pointA !== null && this.pointA >= 0 &&
        this.pointB !== null && this.pointB >= 0 &&
        this.pointC !== null && this.pointC >= 0 &&
        this.pointD !== null && this.pointD >= 0 &&
        this.pointE !== null && this.pointE >= 0 &&
        this.pointA < this.pointB &&
        this.pointB < this.pointC &&
        this.pointC < this.pointD &&
        this.pointD < this.pointE
      );
    }
    return false;
  }

  isValidOrder(): boolean {
    if (this.functionType === 'trapezoidal') {
      return (
        this.pointA !== null && this.pointB !== null &&
        this.pointC !== null && this.pointD !== null &&
        this.pointA < this.pointB &&
        this.pointB < this.pointC &&
        this.pointC < this.pointD
      );
    } else if (this.functionType === 'triangular') {
      return (
        this.pointA !== null && this.pointB !== null &&
        this.pointC !== null &&
        this.pointA < this.pointB &&
        this.pointB < this.pointC
      );
    } else if (this.functionType === 'sigmoide') {
      return (
        this.pointA !== null && this.pointB !== null &&
        this.pointC !== null && this.pointD !== null &&
        this.pointE !== null &&
        this.pointA < this.pointB &&
        this.pointB < this.pointC &&
        this.pointC < this.pointD &&
        this.pointD < this.pointE
      );
    }
    return true;
  }

  getOrderErrorMessage(): string {
    if (this.functionType === 'trapezoidal') {
      return 'Los puntos deben estar en orden: A < B < C < D';
    } else if (this.functionType === 'triangular') {
      return 'Los puntos deben estar en orden: A < B < C';
    } else if (this.functionType === 'sigmoide') {
      return 'Los puntos deben estar en orden: A < B < C < D < E';
    }
    return '';
  }

  hasValidationErrors(): boolean {
    if (!this.isValidOrder() && this.allPointsEntered()) {
      return true;
    }
    return false;
  }

  allPointsEntered(): boolean {
    if (this.functionType === 'trapezoidal') {
      return this.pointA !== null && this.pointB !== null &&
        this.pointC !== null && this.pointD !== null;
    } else if (this.functionType === 'triangular') {
      return this.pointA !== null && this.pointB !== null &&
        this.pointC !== null;
    } else if (this.functionType === 'sigmoide') {
      return this.pointA !== null && this.pointB !== null &&
        this.pointC !== null && this.pointD !== null &&
        this.pointE !== null;
    }
    return false;
  }

  addValue() {
    if (this.isValid()) {
      let newValue: any;
      if (this.functionType === 'trapezoidal') {
        newValue = {
          nameValue: this.nameValue,
          functionType: this.functionType,
          points: { a: this.pointA, b: this.pointB, c: this.pointC, d: this.pointD },
        };
      } else if (this.functionType === 'triangular') {
        newValue = {
          nameValue: this.nameValue,
          functionType: this.functionType,
          points: { a: this.pointA, b: this.pointB, c: this.pointC },
        };
      } else if (this.functionType === 'sigmoide') {
        newValue = {
          nameValue: this.nameValue,
          functionType: this.functionType,
          points: { a: this.pointA, b: this.pointB, c: this.pointC, d: this.pointD, e: this.pointE },
        };
      }

      this.valueAdded.emit(newValue);
      this.closeModal();
    }
  }

  closeModal() {
    this.close.emit();
  }
}