export class Header {
    #container;
    #nav;

    constructor(options = {}) {
        const {
            containerSelector = '.header',
            navSelector = '.header__nav',
        } = options;

        this.#container = document.querySelector(containerSelector);
        this.#nav = document.querySelector(navSelector);

        if (!this.#container) throw new Error('Header: .header not found');
        if (!this.#nav) throw new Error('Header: .header__nav not found');
    }

    setButtonItems(items) {
        this.#nav.replaceChildren();

        items.forEach((item) => {
            const element = document.createElement('a');

            element.href = item.href;
            element.textContent = item.text;

            if (item.variant) {
                element.className = `button button-${item.variant}`;
                //header__nav-item
            } else {
                element.className = 'header__link';
            }

            if (item.ariaLabel) element.setAttribute('aria-label', item.ariaLabel);
            if (item.isActive) element.classList.add('header__link--active');

            this.#nav.append(element);
        });
    }
}