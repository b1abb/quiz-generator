export class Router {
    static getState() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        const question = Number(params.get("question")) || 1;

        return { id, question };
    }

    static setQuestion(question) {
        const url = new URL(window.location.href);

        url.searchParams.set("question", String(question));
        history.pushState({}, "", url);
    }
}