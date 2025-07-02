import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { roleTeacherGuard } from './role-teacher.guard';

describe('roleTeacherGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => roleTeacherGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
