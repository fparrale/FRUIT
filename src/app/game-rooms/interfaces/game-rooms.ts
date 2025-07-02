export interface CreateRnfList {
  nfr: string;
  variable: string;
  feedback1: string;
  value: string;
  feedback2: string;
  weightVarible: string;
  weightValue: string;
  weightRecomend: string;
  recomend: string;
  other_recommended_values: string;
  feedback3: string;
  validar: string;
}

export interface createRnfGameRoomService {
  nfr: string;
  variable: string;
  feedback1: string;
  value: string;
  feedback2: string;
  recomend: string;
  other_recommended_values: string;
  feedback3: string;
  validar: string;
}

export interface GameRoomRnf {
  expiration_date: string;
  questions: createRnfGameRoomService[];
  language: string;
}
