import { z } from 'zod';

export const OptionsSchema = z.object({
    id: z.number().int().positive(),
    text: z.string().min(3, 'Текст варианта ответа обязателен'),
    correct: z.boolean(),
    message: z.string().min(1, 'Сообщение для варианта ответа обязательно')
})

export const QuestionsSchema = z.object({
    id: z.number().int().positive(),
    text: z.string().min(3, 'Текст вопроса обязателен'),
    type: z.enum(['single', 'multiple']),
    options: z.array(OptionsSchema).min(2, 'Должно быть минимум 2 варианта ответа')
}).superRefine(
    /**
     * @param {{
     *   id: number,
     *   text: string,
     *   type: 'single' | 'multiple',
     *   options: Array<{
     *     id: number,
     *     text: string,
     *     correct: boolean,
     *     message: string
     *   }>
     * }} questions
     *
     * @param {{
     *   addIssue(issue: {
     *     code: string,
     *     path?: (string | number)[],
     *     message: string
     *   }): void
     * }} context
     */
    (questions, context) => {
    const ids = questions.options.map((options) => options.id);
    const uni = new Set(ids);
    if (uni.size !== ids.length) {
        context.addIssue({
            code: 'custom',
            path: ['options'],
            message: 'ID вариантов ответа должны быть уникальны в рамках одного вопроса',
        });
    }

    const correctCount = questions.options.reduce((acc, o) => acc + (o.correct ? 1 : 0), 0);

    if (questions.type === 'single' && correctCount !== 1) {
        context.addIssue({
            code: 'custom',
            path: ['options'],
            message: 'Для одиночного выбора ровно один вариант должен быть правильным',
        });
    }

    if (questions.type === 'multiple' && correctCount < 1) {
        context.addIssue({
            code: 'custom',
            path: ['options'],
            message: 'Для множественного выбора должен быть хотя бы один правильный вариант',
        });
    }
})

export const QuizSchema = z.object({
    title: z.string().min(3, 'Название теста обязательно'),
    description: z.string().min(1, 'Описание теста обязательно'),
    questions: z.array(QuestionsSchema).min(1, 'Должен быть минимум 1 вопрос')
}).superRefine(
    /**
     * @param {{
     *   title: string,
     *   description: string,
     *   questions: Array<{
     *     id: number,
     *     text: string,
     *     type: 'single' | 'multiple',
     *     options: Array<{
     *       id: number,
     *       text: string,
     *       correct: boolean,
     *       message: string
     *     }>
     *   }>
     * }} quiz
     *
     * @param {{
     *   addIssue(issue: {
     *     code: string,
     *     path?: (string | number)[],
     *     message: string
     *   }): void
     * }} context
     */
    (quiz, context) => {
    const qIds = quiz.questions.map((q) => q.id);
    const uni = new Set(qIds);
    if (uni.size !== qIds.length) {
        context.addIssue({
            code: 'custom',
            path: ['questions'],
            message: 'ID вопросов должны быть уникальны в рамках одного теста',
        });
    }
})

export class ValidateQuizJson {
    static validateJson(jsonString) {
        const raw = ValidateQuizJson.#parseJson(jsonString);
        if (!raw.ok) return raw;

        const parsed = QuizSchema.safeParse(raw.data);
        if (parsed.success) {
            return {ok: true, data: parsed.data};
        }

        const issues = parsed.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
        }));

        return {
            ok: false,
            message: ValidateQuizJson.#formatIssuesMessage(issues),
            issues,
        };
    }

    static #parseJson(jsonString) {
        if (typeof jsonString !== 'string' || jsonString.trim() === '') {
            return {
                ok: false,
                message: 'Введите JSON в поле',
                issues: [{path: '', message: 'Пустая строка'}],
            };
        }

        try {
            const data = JSON.parse(jsonString);
            if (data === null || typeof data !== 'object') {
                return {
                    ok: false,
                    message: 'JSON должен быть объектом',
                    issues: [{path: '', message: 'Ожидается объект, получено null/примитив'}],
                };
            }
            return {ok: true, data};
        } catch (e) {
            return {
                ok: false,
                message: 'Некорректный JSON',
                issues: [{path: '', message: e instanceof Error ? e.message : String(e)}],
            };
        }
    }

    static #formatIssuesMessage(issues) {
        const first = issues[0];
        if (!first) return 'Ошибка валидации';

        return first.path ? `${first.path}: ${first.message}` : first.message;
    }
}