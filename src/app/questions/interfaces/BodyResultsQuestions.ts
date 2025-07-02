export interface BodyResultsQuestions {
    game_room_id: number;
    duration:     string;
    answers:      Answer[];
}

export interface Answer {
    id:       string;
    variable: string;
    value:    string;
    recomend: string;
}
