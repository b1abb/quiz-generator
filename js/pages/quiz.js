import { Header } from "../components/header";
import { BASE_URL } from "../../constans";
import { getQuiz } from "../utils/storage";
import { Router } from "../components/router";
import { Quiz } from "../components/quiz";
import { QuizOption } from "../components/option";

const quizElement = document.querySelector(".quiz");
const quizHeaderElement = quizElement.querySelector(".quiz__header");
const quizTitleElement = quizHeaderElement?.querySelector(".quiz__title");
const quizDescriptionElement = quizHeaderElement?.querySelector(".quiz__description");

const quizProgressBarElement = quizElement.querySelector(".quiz__progress-bar");
const quizCurrentProgressBarElement = quizProgressBarElement?.querySelector(".quiz__progress-bar__current-question");
const quizTotalProgressBarElement = quizProgressBarElement?.querySelector(".quiz__progress-bar__total-question");
const quizProgressElement = quizProgressBarElement?.querySelector(".quiz__progress-bar__progress");
const quizFillElement = quizProgressElement?.querySelector(".quiz__progress-bar__fill");

const quizQuestionElement = quizElement.querySelector(".quiz__question");
const quizQuestionHeaderElement = quizQuestionElement?.querySelector(".quiz__question-header");
const quizQuestionTitleElement = quizQuestionHeaderElement?.querySelector(".quiz__question-title");
const quizQuestionDescriptionElement = quizQuestionHeaderElement?.querySelector(".quiz__question-description");
const quizQuestionForm = document.forms["question-form"];
const quizOptionForm = quizQuestionForm.querySelector(".quiz__question-options");
const submitButton = quizQuestionForm.querySelector(".quiz-submit");

const popup = document.querySelector(".popup");
const popupTitle = popup.querySelector(".popup__title");
const popupDescription = popup.querySelector(".popup__description");
const popupSubtitle = popup.querySelector(".popup__subtitle");
const popupCloseButton = popup.querySelector(".popup--close-button");
const popupRestartButton = popup.querySelector(".popup--restart-button");

const fragment = document.createDocumentFragment();
let options = [];

const { id, question } = Router.getState();

const quizData = await getQuiz(id);
const quiz = new Quiz(quizData);

const header = new Header();

header.setButtonItems([{text: "Посмотреть сохранённые квизы", href: `${BASE_URL}quizzes.html`, variant: "secondary"}]);

const setProgress = (element, current, total) => {
    const totalStep = Math.max(1, total);
    const currentStep = Math.min(Math.max(current, 1), totalStep);
    const percent = (currentStep / totalStep) * 100;

    quizTotalProgressBarElement.textContent = String(totalStep);
    quizCurrentProgressBarElement.textContent = String(current);
    quizFillElement.style.width = `${percent}%`;

    element.setAttribute("aria-valuenow", String(current));
    element.setAttribute("aria-valuemax", String(totalStep));
}

const questionFromURL = (question) => {
    const total = quiz.getQuestionsCount();
    const safe = Math.min(Math.max(Number(question || 1), 1), Math.max(1, total));

    for (let i = 1; i < safe; i++) {
        quiz.getNextQuestion();
    }

    Router.setQuestion(safe);
}

const getSelectedOptionId = () => {
    const fd = new FormData(quizQuestionForm);

    return Array.from(fd.values()).map((v) => Number(v)).filter((n) => Number.isFinite(n));
}

const review = (selectedId) => {
    const selectedSet = new Set(selectedId.map(Number));

    for (const card of options) {
        const cardId = Number(card.id);

        if (!selectedSet.has(cardId)) {
            card.lock();
        }

        if (selectedSet.has(cardId)) {
            card.showCorrectness({ showHint: true });
        } else {
            card.clearStatus();
        }
    }

    submitButton.textContent = quiz.isLastQuestion() ? "Завершить тест" : "Следующий вопрос";
}

const finish = () => {
    const result = quiz.getQuizResult();

    if (!result) return;

    const views = {
        complete: {
            title: "Тест завершён!",
            subtitle: "Вы ответили правильно на все вопросы 🎉",
            description: "Ваши знания в этой теме на высоте!",
        },
        good: {
            title: "Тест завершён!",
            subtitle: `Вы ответили правильно на ${result.correctCount} из ${result.total} вопросов`,
            description:
                "Отличная попытка! Вы хорошо ответили на вопросы теста, но некоторые темы стоит освежить. Пройдите тест ещё раз, чтобы закрепить знания.",
        },
        bad: {
            title: "Не расстраивайтесь!",
            subtitle: `Вы ответили правильно на ${result.correctCount} из ${result.total} вопросов`,
            description:
                "Не переживайте — ошибки это часть обучения. Попробуйте пройти тест снова, чтобы закрепить материал и улучшить результат.",
        }
    };

    const view = views[result.status];

    if (!view) return;

    popupTitle.textContent = view.title;
    popupSubtitle.textContent = view.subtitle;
    popupDescription.textContent = view.description;

    popup.classList.add("popup--open");
}

const renderQuestions = () => {
    options = [];
    fragment.replaceChildren();
    quizOptionForm.replaceChildren();

    const cur = quiz.getCurrentQuestion();

    const { question: q, number } = cur;

    const isSingle = q.type === "single";
    const inputType = isSingle ? "radio" : "checkbox";
    const groupName = `question-${q.id}`;

    if (quizQuestionTitleElement) quizQuestionTitleElement.textContent = q.text;

    if (quizQuestionDescriptionElement) {
        quizQuestionDescriptionElement.textContent = isSingle
            ? "Выберите один вариант ответа"
            : "Выберите несколько вариантов ответа";
    }

    submitButton.textContent = "Ответить";

    for (const opt of q.options) {
        const card = new QuizOption();

        fragment.appendChild(
            card.create({
                optionId: opt.id,
                inputType,
                name: groupName,
                text: opt.text,
                correct: opt.correct,
                message: opt.message,
            })
        );

        options.push(card);
    }

    quizOptionForm.appendChild(fragment);

    if (quizProgressBarElement) {
        setProgress(quizProgressBarElement, number, quiz.getQuestionsCount());
    }
}

const initQuiz = () => {
    const { title, description } = quizData;

    if (quizTitleElement) {
        quizTitleElement.textContent = title;
    }
    if (quizDescriptionElement) {
        quizDescriptionElement.textContent = description;
    }

    renderQuestions();
}

const handleSubmitForm = (event) => {
    event.preventDefault();

    if (quiz.getMode() === "answer") {
        const cur = quiz.getCurrentQuestion();

        if (!cur) return;

        const q = cur.question;
        const selectedIds = getSelectedOptionId();

        if (selectedIds.length === 0) {
            console.warn("Выберите вариант ответа");
            return;
        }

        const result = quiz.answeredQuestion(q.id, selectedIds);

        review(result.highlightOptionIds);

        return;
    }

    if (quiz.getMode() === "review") {
        if (quiz.isLastQuestion()) {
            finish();

            return;
        }

        const next = quiz.getNextQuestion();

        if (!next) return;

        Router.setQuestion(next.number);

        renderQuestions();
    }
}

const handleCloseQuiz = () => {
    window.location.href = `${BASE_URL}quizzes.html`;
}

const handleRestartQuiz = (event) => {
    event.preventDefault();

    quiz.reset();
    Router.setQuestion(1);
    initQuiz();

    popup.classList.remove("popup--open");
}

questionFromURL(question);
initQuiz();

quizQuestionForm.addEventListener("submit", handleSubmitForm);
popupCloseButton.addEventListener("click", handleCloseQuiz);
popupRestartButton.addEventListener("click", handleRestartQuiz);