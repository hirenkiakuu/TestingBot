import { mockQuestions } from "../mock/mock";
import { Question } from "../models/Question";

export const getRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * mockQuestions.length);
    return mockQuestions[randomIndex];
}

export const createQuestion = async (obj: any) => {
    const newQstn = await Question.create(obj);
    return newQstn;
}   