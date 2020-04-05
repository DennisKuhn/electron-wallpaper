interface CreateAndAppendOptions {
    className?: string;
    parent?: Element;
    text?: string;
    html?: string;
}

export default (name: string, options: CreateAndAppendOptions) => {
    const element = document.createElement(name);

    if (options) {
        if (options.className) {
            element.classList.add(options.className);
        }
        if (options.parent) {
            options.parent.appendChild(element);
        }
        if (options.text) {
            element.textContent = options.text;
        }
        if (options.html) {
            element.innerHTML = options.html;
        }
    }
    return element;
};

