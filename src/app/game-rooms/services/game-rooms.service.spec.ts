import { TestBed } from '@angular/core/testing';

import { GameRoomsService } from './game-rooms.service';

describe('GameRoomsService', () => {
  let service: GameRoomsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameRoomsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
