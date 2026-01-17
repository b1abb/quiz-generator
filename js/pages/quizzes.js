import { Header } from "../components/header";
import { BASE_URL } from "../../constans";
import { QuizGenerator } from "../components/quizGenerator";
import { getAllQuizzes } from "../utils/storage";
import { QuizCardGenerator } from "../components/card";

const quizzesSection = document.querySelector(".quizzes");
const quizzesListTemplate = document.getElementById("quizzes-list");
const quizEmpty = document.getElementById("quiz-empty");

const header = new Header();
const cardsGenerator = new QuizCardGenerator();

header.setButtonItems([{text: "Добавить квиз", href: `${BASE_URL}index.html`, variant: "primary"}]);

const renderQuizzes = async () => {
    try {
        const data = await getAllQuizzes();

        console.log(data)

        quizzesSection.replaceChildren();

        if (!Array.isArray(data) || data.length === 0) {
            const emptyFragment = quizEmpty.content.cloneNode(true);
            quizzesSection.append(emptyFragment);
            return;
        }

        const listFragment = quizzesListTemplate.content.cloneNode(true);
        const listNode = listFragment.querySelector(".quizzes-list");

        const fragment = document.createDocumentFragment();

        data.forEach((quiz) => {
            console.log(quiz)
            const node = cardsGenerator.getElement(quiz);
            fragment.append(node);
        });

        quizzesSection.append(listFragment);
        listNode.append(fragment);

    } catch (error) {
        quizzesSection.replaceChildren();

        const errorFragment = quizEmpty.content.cloneNode(true);
        const title = errorFragment.querySelector(".quiz-empty__title");
        const subtitle = errorFragment.querySelector(".quiz-empty__subtitle");
        const btn = errorFragment.querySelector(".quiz-empty__action");

        if (title) title.textContent = error instanceof Error ? error.message : "Ошибка загрузки квизов";
        subtitle?.remove();
        btn?.remove();

        quizzesSection.append(errorFragment);
        console.log(error)
    }
}

await renderQuizzes();