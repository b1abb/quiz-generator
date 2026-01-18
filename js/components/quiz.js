export class Quiz {
    #quiz = null;
    #currentQuestion = 1;
    #quizState = new Map();
    #mode = "answer";

    constructor(data) {
        if (!data || !Array.isArray(data.questions)) {
            throw new Error("Quiz: invalid quizData (questions must be an array)");
        }

        this.#quiz = data;
        this.#initQuizState();
    }

    #initQuizState() {
        if (!this.#quiz) return;

        this.#quizState = new Map();
        this.#currentQuestion = 1;
        this.#mode = "answer";

        this.#quiz.questions.forEach((question) => {
            this.#quizState.set(question.id, {
                questionId: question.id,
                stage: 'idle',
                correct: null,
                selectedOptionIds: []
            });
        });
    }

    getQuestionsCount() {
        if (!this.#quiz) return 0;
        return this.#quiz.questions.length;
    }

    getMode() {
        return this.#mode;
    }

    getCurrentQuestion() {
        if (!this.#quiz) {
            return null;
        }

        const current = this.#currentQuestion - 1;
        const question = this.#quiz.questions[current];

        if (!question) {
            return null;
        }

        return { question, number: this.#currentQuestion };
    }

    getNextQuestion() {
        if (!this.#quiz) {
            return null;
        }

        const next = this.#currentQuestion + 1;

        if (next > this.#quiz.questions.length) {
            return null;
        }

        this.#currentQuestion = next;
        this.#mode = "answer";

        return this.getCurrentQuestion();
    }

    isLastQuestion() {
        if (!this.#quiz) {
            return true;
        }

        return this.#currentQuestion >= this.#quiz.questions.length;
    }

    answeredQuestion(questionId, userOptionId) {
        if (!this.#quiz) {
            throw new Error("Quiz: quiz is not loaded");
        }

        const question = this.#quiz.questions.find((q) => q.id === questionId);

        if (!question) {
            throw new Error(`Quiz: question ${ questionId } not found`);
        }

        const userSelected = Array.isArray(userOptionId) ? userOptionId.map(Number).filter(Number.isFinite) : [];
        const userSet = new Set(userSelected);

        const correctIds = [];

        for (const opt of question.options) {
            if (opt.correct) correctIds.push(opt.id);
        }

        const correctSet = new Set(correctIds);

        const isCorrect =
            userSet.size === correctSet.size &&
            (() => {
                for (const id of userSet) {
                    if (!correctSet.has(id)) return false;
                }

                return true;
            })();

        const checkedSet = new Set(userSet);

        if (!isCorrect) {
            for (const id of correctSet) checkedSet.add(id);
        }

        const highlightSet = new Set();

        for (const id of userSet) highlightSet.add(id);
        for (const id of correctSet) highlightSet.add(id);

        const optionsView = question.options.map((o) => ({
            ...o,
            selected: checkedSet.has(o.id),
        }));

        const prev = this.#quizState.get(questionId);
        const nextState = {
            questionId,
            stage: "answered",
            correct: isCorrect,
            selectedOptionIds: [...userSet],
        };

        if (!prev) {
            this.#quizState.set(questionId, nextState);
        } else {
            prev.stage = nextState.stage;
            prev.correct = nextState.correct;
            prev.selectedOptionIds = nextState.selectedOptionIds;
        }

        this.#mode = "review";

        return {
            correct: isCorrect,
            checkedOptionIds: [...checkedSet],
            highlightOptionIds: [...highlightSet],
            optionsView,
        };
    }

    getQuizResult() {
        if (!this.#quiz) return null;

        const total = this.#quiz.questions.length;

        let correctCount = 0;
        this.#quizState.forEach((st) => {
            if (st.correct === true) correctCount += 1;
        });

        const percent = total === 0 ? 0 : Math.round((correctCount / total) * 100);

        let status = "bad";

        if (percent === 100) {
            status = "complete";
        } else if (percent >= 51) {
            status = "good";
        }

        return { correctCount, total, percent, status };
    }

    reset() {
        this.#currentQuestion = 1;
        this.#mode = "answer";
        this.#quizState.clear();
    }
}