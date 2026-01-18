export class Header {
    #container;
    #nav;
    #menuButton;

    constructor(options = {}) {
        const {
            containerSelector = '.header',
            navSelector = '.header__nav',
            menuSelector = '.header__menu',
        } = options;

        this.#container = document.querySelector(containerSelector);
        this.#nav = document.querySelector(navSelector);
        this.#menuButton = document.querySelector(menuSelector);

        if (!this.#container) throw new Error('Header: .header not found');
        if (!this.#nav) throw new Error('Header: .header__nav not found');

        if (this.#menuButton) {
            this.#menuButton.addEventListener('click', () => {
                this.#container.classList.toggle('header__menu-open');
                this.#nav.classList.toggle('header__menu-mobile');
            });
        }

        this.#nav.addEventListener('click', (event) => {
            const target = event.target;

            if (target.closest('a')) {
                this.#container.classList.remove('header__menu-open');
                this.#nav.classList.remove('header__menu-mobile');
            }
        });
    }

    setButtonItems(items) {
        this.#nav.replaceChildren();

        items.forEach((item) => {
            const element = document.createElement('a');

            element.href = item.href;
            element.textContent = item.text;

            if (item.variant) {
                element.className = `button button-${item.variant} header__nav-item`;
            } else {
                element.className = 'header__link';
            }

            if (item.ariaLabel) element.setAttribute('aria-label', item.ariaLabel);
            if (item.isActive) element.classList.add('header__link--active');

            this.#nav.append(element);
        });
    }
}