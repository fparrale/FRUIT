export interface Question {
    id: number;
    nfr: string;
    other_recommended_values: string;
  }

  export interface Questions {
    id: number;
    nfr: string;
    variable: string;
    feedback1: string;
    value: string;
    feedback2: string;
    recomend: string;
    feedback3: string;
    validar: string;
  }


export interface QuestionTransformed {
  requirement: string;
  variable: {
    options: string[];
    correct: string;
    feedback: string;
  };
  value: {
    options: string[];
    correct: string;
    feedback: string;
  };
  recommendation: {
    options: string[];
    correct: string;
    feedback: string;
  }
};
