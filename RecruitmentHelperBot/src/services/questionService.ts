import { mockQuestions } from "../mock/mock";

export const getRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * mockQuestions.length);
    return mockQuestions[randomIndex];
}