import { BASE_URL } from "../../constans";

const form = document.forms['json-block'];
const buttonSubmit = document.querySelector('.generator-submit');
const textarea = document.querySelector('.generator-input');

const

const inputJSONHandler = async (event) => {
    event.preventDefault();

    const response = await fetch(BASE_URL + '/generator.json');
}
