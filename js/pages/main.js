import { BASE_URL } from "../../constans";
import { ValidateQuizJson } from "../utils/validation";
import { QuizGenerator } from "../components/quizGenerator";
import { addQuiz } from "../utils/storage";
import { Header } from "../components/header";

const form = document.forms['json-block'];
const buttonSubmit = document.querySelector('.generator-submit');
const textarea = document.querySelector('.generator-input');

const header = new Header();
const quizGenerator = new QuizGenerator(ValidateQuizJson, addQuiz);

header.setButtonItems([{text: "Посмотреть сохранённые квизы", href: `${BASE_URL}quizzes.html`, variant: "secondary"}])

const inputJSONHandler = async (event) => {
    event.preventDefault();

    const response = await quizGenerator.setDataQuiz(textarea.value);

    if (!response.ok) {
        textarea.classList.add("generator-input-error");
        console.error(response);
    } else {
        window.location.href = `${BASE_URL}quizzes.html`;
    }
};

form.addEventListener('submit', inputJSONHandler);