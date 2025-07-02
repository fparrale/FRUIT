import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinguisticValueComponent } from './linguistic-value.component';

describe('LinguisticValueComponent', () => {
  let component: LinguisticValueComponent;
  let fixture: ComponentFixture<LinguisticValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinguisticValueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinguisticValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
