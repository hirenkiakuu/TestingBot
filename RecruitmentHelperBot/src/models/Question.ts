import { DataTypes, Model } from "sequelize";
import sequelize from "../db";

class Question extends Model {
    declare id: number;
    declare question: string;
    declare correct_answer_id: number;
}

Question.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        question: {
            type: DataTypes.TEXT,
            allowNull: false
        },
    },
    {
        sequelize,
        modelName: 'Question'
    }
);

class Answer extends Model {
    declare id: number;
    declare answer: string;
    declare question_id: string;
    declare description?: string;
}

Answer.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        answer: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        question_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Questions', 
                key: 'id'
            },
        },
        // description: {
        //     type: DataTypes.TEXT,
        //     allowNull: false
        // }
    },
    {
        sequelize,
        modelName: 'Answer'
    }
)

class CorrectAnswer extends Model {
    declare id: number;
    declare question_id: number;
    declare answer_id: number;
}


CorrectAnswer.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        question_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Questions',
                key: 'id'
            }
        },
        answer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Answers',
                key: 'id'
            }
        }
    }, 
    {
        sequelize,
        modelName: 'CorrectAnswer'
    }
);

// Question.belongsTo(Answer, { foreignKey: 'correct_answer_id' });
// Answer.belongsTo(Question, { foreignKey: 'question_id' });

export { Question, Answer, CorrectAnswer };