import { BASE_URL } from "../../constans";
import { ValidateQuizJson } from "../utils/validation";
import { QuizGenerator } from "../components/quizGenerator";
import { addQuiz } from "../utils/storage";
import { Header } from "../components/header";

const form = document.forms['json-block'];
const textarea = document.querySelector('.generator-input');
const popup = document.querySelector('.popup');
const popupDescription = document.querySelector('.popup__description');
const popupButton = document.querySelector('.popup__button');

const header = new Header();
const quizGenerator = new QuizGenerator(ValidateQuizJson, addQuiz);

header.setButtonItems([{text: "Посмотреть сохранённые квизы", href: `${BASE_URL}quizzes.html`, variant: "secondary"}]);

const popupCloseHandler = () => {
    popup.classList.remove("popup--open");

    popupButton.removeEventListener("click", popupCloseHandler);
};

const inputJSONHandler = async (event) => {
    event.preventDefault();

    const response = await quizGenerator.setDataQuiz(textarea.value);

    if (!response.ok) {
        popup.classList.add("popup--open");
        popupButton.addEventListener("click", popupCloseHandler);

        textarea.classList.add("generator-input-error");
        popupDescription.textContent = response.message;

        console.error(response);
    } else {
        window.location.href = `${BASE_URL}quizzes.html`;
    }
};

form.addEventListener('submit', inputJSONHandler);