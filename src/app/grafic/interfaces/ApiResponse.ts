import { ChartDataInput } from "./ChartDataInput";

export interface GraficChartGameModel {
  game_room_id: number;
  question_id: number;  
  user_id?: number;
  data: ChartDataInput; 
}
  
export interface ApiResponse {
  data: any;
  message: string;
  statusCode: number;
}
  