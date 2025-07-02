import { Question } from "./Questions";

export interface ApiResponse {
    questions: Question[];
    game_room_id: number;
    message: string;
  }