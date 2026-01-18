export class QuizOption {
    #template;
    #root = null;
    #choice = null;
    #input = null;
    #label = null;
    #hint = null;

    id = null;
    inputType = "radio";
    name = "";
    text = "";
    correct = false;
    message = "";
    locked = false;
    status = "neutral";

    constructor() {
        this.#template = document.getElementById("quiz__option");
    }

    create(params) {
        const { optionId, inputType, name, text, correct = false, message = "" } = params;

        this.id = optionId;
        this.inputType = inputType;
        this.name = name;
        this.text = text;
        this.correct = Boolean(correct);
        this.message = message;

        const fragment = this.#template.content.cloneNode(true);

        const root = fragment.querySelector(".quiz__option");
        const choice = fragment.querySelector(".choice");
        const input = fragment.querySelector(".choice__input");
        const label = fragment.querySelector(".choice__label");
        const hint = fragment.querySelector(".choice__hint");

        this.#root = root;
        this.#choice = choice;
        this.#input = input;
        this.#label = label;
        this.#hint = hint;

        if (this.inputType === "radio") {
            choice.classList.add("choice--radio");
            input.type = "radio";
        } else {
            choice.classList.remove("choice--radio");
            input.type = "checkbox";
        }

        input.name = this.name;
        input.value = String(this.id);

        label.textContent = this.text;

        if (this.#hint) {
            if (this.message) {
                this.#hint.textContent = this.message;
                this.#hint.hidden = true;
            } else {
                this.#hint.remove();
                this.#hint = null;
            }
        }

        this.clearStatus();
        this.unlock();

        return root;
    }

    lock() {
        this.locked = true;

        this.#choice.setAttribute("disabled", this.locked);
        this.#choice.setAttribute("aria-disabled", "true");

        this.#choice.style.pointerEvents = "none";
        this.#input.disabled = true;
        this.#input.tabIndex = -1;
    }

    unlock() {
        this.locked = false;

        this.#choice.classList.remove("choice--locked");
        this.#choice.removeAttribute("aria-disabled");

        this.#choice.style.pointerEvents = "";
        this.#input.tabIndex = 0;
    }

    showCorrectness(options = {}) {
        const { showHint = true } = options;

        if (this.correct) {
            this.setStatus("success");
        } else {
            this.setStatus("error");
        }

        if (showHint && this.#hint) {
            this.#hint.hidden = false;
        }
    }

    setStatus(status) {
        this.status = status;

        this.#choice.classList.remove("choice--success", "choice--error");

        if (status === "success") this.#choice.classList.add("choice--success");
        if (status === "error") this.#choice.classList.add("choice--error");

        const span = document.createElement("span");
        span.classList.add("choice__hint", "caption");
        span.textContent = this.message;

        this.#root.appendChild(span);
    }

    clearStatus() {
        if (!this.#choice) return;

        this.status = "neutral";
        this.#choice.classList.remove("choice--success", "choice--error");

        if (this.#hint) {
            this.#hint.hidden = true;
            this.#hint.textContent = this.message;
        }
    }

    getState() {
        return {
            id: this.id,
            name: this.name,
            inputType: this.inputType,
            text: this.text,
            correct: this.correct,
            message: this.message,
            checked: this.#input ? this.#input.checked : false,
            locked: this.locked,
            status: this.status,
        };
    }
}