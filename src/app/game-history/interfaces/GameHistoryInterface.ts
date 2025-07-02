export interface GameHistoryInterface {
    id:                 number;
    score:              number;
    answered_questions: AnsweredQuestion[];
    duration:           string;
    created_at:         Date;
    game_room:          GameRoom;
    user:               User;
    isGraphicMissing:   boolean;
}

export interface AnsweredQuestion {
    id:                string;
    nfr:               string;
    user_variable:     string;
    feedback_variable: null | string;
    correct_variable:  boolean;
    user_value:        string;
    feedback_value:    null | string;
    correct_value:     boolean;
    user_recomend:     string;
    feedback_recomend: null | string;
    correct_recomend:  boolean;
}

export interface GameRoom {
    id:              number;
    code:            string;
    expiration_date: string;
}

export interface User {
    id:       number;
    names:    string;
    surnames: string;
}
