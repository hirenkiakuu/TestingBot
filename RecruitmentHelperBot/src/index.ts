import { Context, Markup, Telegraf, session } from "telegraf";
import { message } from "telegraf/filters";
import { askQuestion, showTip, createQuestionAction } from "./controllers/controller";
import 'dotenv/config';
import { testConnection } from "./db";
import { Question, Answer, CorrectAnswer } from "./models/Question";
import { CustomContext } from "./session";
import { createQuestion } from "./services/questionService";
import { create } from "domain";
import { randomBytes } from "crypto";

const bot = new Telegraf<CustomContext>(process.env.BOT_TOKEN as string);


const syncDatabase = async () => {
    await Question.sync({ alter: true });
    await Answer.sync({ alter: true });
    await CorrectAnswer.sync({ alter: true });
}

syncDatabase();

bot.use(session());

bot.command('help', showTip(`Данный бот поможет проверить знания из разных областей IT, введите /questions, чтобы начать тест.
                            Команды:
                            /start_quiz - начать тест
                            /create_question - добавить вопрос
                            /questions - все вопросы по списку`));

bot.command('questions', askQuestion());
bot.hears('New question', createQuestionAction());

bot.command('create_question', (ctx) => {
    ctx.reply('Введите новый вопрос: ');
    
    ctx.session = {
        waitingForQuestionText: true,
        waitingForQuestionAnswers: true
    };
});

bot.command('all_questions', async (ctx) => {
    const all = await Question.findAll();

    const allQuestions = all.map(qData => {
        return `ID: ${qData.id}, Вопрос: ${qData.question}, ID ответа - ${qData.correct_answer_id}`
    }).join('\n')

    ctx.reply(allQuestions);
})

bot.command('start_quiz', async (ctx) => {
    ctx.session = {
        score: 0
    }

    const questions = await Question.findAll();

    if (questions.length > 0) {
        const randomIndex = Math.floor(Math.random() * questions.length);
        const randomQuestion = questions[randomIndex];

        const correctAnswerPointer = await CorrectAnswer.findOne({
            where: { question_id: randomQuestion.id }
        })

        console.log(correctAnswerPointer)

        const correctAnswerId = correctAnswerPointer?.answer_id;

        const correctAnswer = await Answer.findOne({
            where: { id: correctAnswerId }
        });

        console.log(correctAnswer);

        ctx.reply(`Вопрос: ${randomQuestion.question}
                   Ответ: ${correctAnswer?.answer}`);
       
    }
});

bot.on(message('text'), async (ctx) => {
    if (ctx.session) {
        if (ctx.session.waitingForQuestionText) {
            const questionText = ctx.message.text;

            const newQstn = await createQuestion({ question: questionText });

            ctx.session.waitingForQuestionText = false;
            ctx.session.waitingForQuestionAnswers = true;
            ctx.session.newQstnId = newQstn.id; // Сохранение ID вопроса в сессии

            ctx.reply('Введите ответы через пробел, перед правильным ответом введите +');
            return;
        }

        if (ctx.session.waitingForQuestionAnswers) {
            const userAnswers = ctx.message.text.split(' ');

            for (const ans of userAnswers) {
                const isCorrect = ans.startsWith('+');
                const answerText = isCorrect ? ans.slice(1) : ans;

                const newAns = await Answer.create({
                    answer: answerText,
                    question_id: ctx.session.newQstnId
                });

                if (isCorrect) {
                    await CorrectAnswer.create({
                        question_id: ctx.session.newQstnId,
                        answer_id: newAns.id
                    });
                }
            }

            ctx.reply('Вопрос с ответами успешно добавлены');
            ctx.session.waitingForQuestionAnswers = false;
            ctx.session.newQstnId = null;
            
            return;
        }
    }
});

bot.hears('check session', async (ctx) => {

    console.log(ctx.session)
    if (ctx.session) {
        ctx.reply(`${ctx.session.waitingForQuestionText}`);
    }
})

testConnection();

// bot.command('questions', async (ctx) => {
//     const question = getRandomQuestion();

//     sessions[ctx.chat.id] = {
//         question: question.question,
//         correctAnswer: question.correctAnswer,
//         description: question.description
//     };

//     const keyboard = Markup.inlineKeyboard(question.answers.map(answer => Markup.button.callback(answer, answer)));

//     await ctx.reply(question.question, keyboard);
// })


// bot.action(/.+/, async (ctx) => {
//     const answer = ctx.match[0];

//     if (ctx?.chat?.id) {
//         const session = sessions[ctx.chat.id];

//         if (session) {
//             const { correctAnswer, description } = session;
            
//             if (answer === correctAnswer) {
//                 await ctx.reply(`Верно!, ${description}`)
//                 await ctx.reply('Введите команду /questions, чтобы получить следующий вопрос')
//             } else {
//                 await ctx.reply('Неверно!')
//                 await ctx.reply('Введите команду /questions, чтобы получить следующий вопрос')
//             }
            

//             delete sessions[ctx.chat.id];
//         } else {
//             await ctx.reply('Ошибка!')
//         }
//     }
// });

bot.launch().then(() => {
    console.log('Bot launched successfully');
}).catch((err) => {
    console.log('Bot havent started', err);
});
