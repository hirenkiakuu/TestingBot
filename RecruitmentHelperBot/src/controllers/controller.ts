import { waitForDebugger } from "inspector";
import { createQuestion } from "../services/questionService";
import { Context } from "telegraf";
import { CustomContext } from "../session";

/**
 * 
 * @param msgToShow message to show (for default replies)
 */
export function showTip(msgToShow: string) {
    return async (ctx: Context) => {
        return await ctx.reply(msgToShow);
    }
}

/**
 * 
 * starts the sequence to get data from user
 */
export function createQuestionAction() {
    return async (ctx: CustomContext) => {

        ctx.reply('Введите новый вопрос: ');

        ctx.session = {
            waitingForQuestionText: true
        }

        console.log(ctx.session)

        const mockQuestionText = 'Another one question';
        const mockCorrectAnswerId = 1;

        const mockObj = {
            question: mockQuestionText,
            correct_answer_id: mockCorrectAnswerId
        }
        
        const newQstn = await createQuestion(mockObj);
        ctx.reply(`New question auto generated id is: ${newQstn.id},
                  The question is: ${newQstn.question}`);
    }
}

export function askQuestion () {
    return async (ctx: Context) => {
        return await ctx.reply('Тут будут вопросы')
    }
}