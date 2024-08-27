import { Context } from "telegraf";

export interface CustomContext extends Context {
    session: {
        waitingForQuestionText?: boolean;
        waitingForQuestionAnswers?: boolean;
        questionText?: string;
        score?: number;
        newQstnId?: number | null;
    }
}