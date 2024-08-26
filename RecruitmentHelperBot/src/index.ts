import { Context, Markup, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import 'dotenv/config';

import { getRandomQuestion } from "./services/questionService";

const bot = new Telegraf(process.env.BOT_TOKEN as string);

const sessions: { [chatId: string]: { question: string, correctAnswer: string, description: string } } = {};

bot.command('help', async (ctx) => {
    ctx.reply(`Данный бот поможет вам проверить свои знания в выбранной вами сфере IT и подготовиться к собеседованию.
        Введите команду /questions для тестирования`);
})

// bot.hears('Вопросы', async (ctx, next) => {
//     const rndQstn = getRandomQuestion();
//     await ctx.reply(`${rndQstn.question}`, Markup.keyboard(rndQstn.answers).resize());
//     next();
// })


bot.command('questions', async (ctx) => {
    const question = getRandomQuestion();

    sessions[ctx.chat.id] = {
        question: question.question,
        correctAnswer: question.correctAnswer,
        description: question.description
    };

    const keyboard = Markup.inlineKeyboard(question.answers.map(answer => Markup.button.callback(answer, answer)));

    await ctx.reply(question.question, keyboard);
})


bot.action(/.+/, async (ctx) => {
    const answer = ctx.match[0];

    if (ctx?.chat?.id) {
        const session = sessions[ctx.chat.id];

        if (session) {
            const { correctAnswer, description } = session;
            
            if (answer === correctAnswer) {
                await ctx.reply(`Верно!, ${description}`)
                await ctx.reply('Введите команду /questions, чтобы получить следующий вопрос')
            } else {
                await ctx.reply('Неверно!')
                await ctx.reply('Введите команду /questions, чтобы получить следующий вопрос')
            }
            

            delete sessions[ctx.chat.id];
        } else {
            await ctx.reply('Ошибка!')
        }
    }
});


// bot.use((ctx) => {
//         if (ctx.message && 'text' in ctx.message) {
//             ctx.reply(`Вы выбрали: ${ctx.message.text}`)
//         } else {
//             return ctx.reply('Please input your details');
//         }
// })

bot.launch().then(() => {
    console.log('Bot launched successfully');
}).catch((err) => {
    console.log('Bot havent started', err);
});
