import { TestBed } from '@angular/core/testing';

import { GameDataParamsService } from './game-data-params.service';

describe('GameDataParamsService', () => {
  let service: GameDataParamsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameDataParamsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
