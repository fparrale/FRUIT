import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip-info',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './tooltip-info.component.html'
})
export class TooltipInfoComponent {
  @Input() imageSrc: string = '';
  @Input() imageAlt: string = '';
  @Input() text: string = '';
  @Input() width: string = 'w-96';

  
  getImageAlt() : string {
    return this.imageAlt;
  }

}