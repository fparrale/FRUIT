import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalizeScaleComponent } from './personalize-scale.component';

describe('PersonalizeScaleComponent', () => {
  let component: PersonalizeScaleComponent;
  let fixture: ComponentFixture<PersonalizeScaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalizeScaleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalizeScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
