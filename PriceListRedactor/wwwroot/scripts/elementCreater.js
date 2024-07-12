// функция создания ячейки строки
export function createCell(row, content) {
    const cell = document.createElement(`td`);
    cell.append(content);

    row.append(cell);

    return cell;
}

// функция создания ссылки
export function createHref(href, content) {
    const link = document.createElement(`a`);
    link.href = href;
    link.textContent = content;
    link.style.textDecoration = `none`;

    return link;
}

// функция создания поля для ввода
export function createInput(className) {
    const input = document.createElement(`input`);
    input.className = `form-control ${className}`;

    return input;
}

// функция создания поля с вариантами выбора
export function createSelect(className, options) {
    const select = document.createElement(`select`);
    select.className = `form-control ${className}`;

    // варианты выбора
    options.forEach(option => {
        const optionElement = document.createElement(`option`);
        optionElement.value = option.value;
        optionElement.textContent = option.content;

        select.append(optionElement);
    });

    return select;
}

// функция создания кнопки
export function createButton(className, textContent, clickHandler) {
    const button = document.createElement(`button`);
    button.className = `btn text-white ${className}`;
    button.textContent = textContent;
    button.style.cursor = `pointer`;
    button.addEventListener(`click`, (event) => clickHandler(event));

    return button;
}