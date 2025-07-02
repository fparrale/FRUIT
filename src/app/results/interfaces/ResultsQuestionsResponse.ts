export interface NfrResult {
  id: string;
  nfr: string;
  user_variable: string;
  feedback_variable: string | null;
  correct_variable: boolean;
  variable_score: string;
  user_value: string;
  feedback_value: string | null;
  correct_value: boolean;
  value_score: string;
  user_recomend: string;
  feedback_recomend: string | null;
  correct_recomend: boolean;
  recomend_score: string;
  total_score_nfr: number;
}

export interface ResultsQuestionsResponse {
  total_score: number;
  result: NfrResult[];
}
