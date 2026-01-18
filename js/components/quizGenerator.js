import {nanoid} from 'nanoid';

export class QuizGenerator {
    validatorQuiz = null;
    dbQuiz = null;

    constructor(validatorQuiz, dbQuiz) {
        this.validatorQuiz = validatorQuiz;
        this.dbQuiz = dbQuiz;
    }

    async setDataQuiz(dataQuiz) {
        const response = this.validatorQuiz.validateJson(dataQuiz);

        if (!response.ok) {
            return response;
        }

        if (!this.dbQuiz) {
            return {
                ok: false,
                error: response.message,
            }
        }

        const id = nanoid();

        try {
            await this.dbQuiz({id, ...response.data});

            return {...response, id};
        } catch (error) {
            return {
                ok: false,
                error: error,
            };
        }
    }

}