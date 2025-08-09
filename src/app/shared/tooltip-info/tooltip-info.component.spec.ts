import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipInfoComponent } from './tooltip-info.component';

describe('TooltipInfoComponent', () => {
  let component: TooltipInfoComponent;
  let fixture: ComponentFixture<TooltipInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TooltipInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
