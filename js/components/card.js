import { BASE_URL } from "../../constans";

export class QuizCardGenerator {
    template = null;

    constructor() {
        this.template = document.getElementById('quiz-card');
    }

    getElement({id, title, description, questions}) {
        const fragment = this.template.content.cloneNode(true);

        const questionCount = questions.length;

        const card = fragment.querySelector(".quiz-card");
        const titleCard = card.querySelector(".quiz-card__title");
        const descCard = card.querySelector(".quiz-card__description");
        const countCard = card.querySelector(".quiz-card__questions");
        const button = card.querySelector(".quiz-card__pass");

        titleCard.textContent = title;
        descCard.textContent = description;
        countCard.textContent = `${questionCount} вопросов`;
        button.href = `${BASE_URL}quiz.html?id=${encodeURIComponent(id)}`;

        return fragment;
    }
}
