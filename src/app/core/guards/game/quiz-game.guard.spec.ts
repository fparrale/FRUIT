import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { quizGameGuard } from './quiz-game.guard';

describe('quizGameGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => quizGameGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
