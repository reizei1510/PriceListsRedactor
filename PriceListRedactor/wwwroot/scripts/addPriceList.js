import * as elementCreater from "./elementCreater.js";

// функция отображения формы
function showPriceListForm() {
    const today = getTodayDate();
    // предварительное имя прайс-листа
    document.querySelector(`#price-list-name`).value = `Прайс-лист от ${today}`;
}

// функция нахождения сегодняшней даты
function getTodayDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    const date = `${day}.${month}.${year}`;

    return date;
}

//функция создания списка готовых колонок
function showExistingColumns() {
    const columns = getCookie('columns');
    if (columns != null) {
        document.querySelector(`#offer-columns`).style.display = `block`;

        const existingColumns = getCookie(`columns`);
        const columns = existingColumns ? JSON.parse(existingColumns) : [];

        const select = document.querySelector(`#select-column`);
        columns.forEach(column => {
            const option = document.createElement('option');
            option.value = column.type;
            option.textContent = column.name;
            select.append(option);
        });
    }
}

// функция получения куки с готовыми колонками
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// функция добавления колонки в прайс-лист
function addColumn(data) {
    const table = document.querySelector(`#price-list-columns-table`);

    // получаем номер новой строки
    const num = table.querySelectorAll(`tr`).length + 1;

    createColumnRow(table, data, num);
}

// функция создания строки колонки
function createColumnRow(table, data, num) {
    const row = document.createElement(`tr`);

    // номер колонки
    elementCreater.createCell(row, `Колонка ${num}`);

    // поле для ввода названия колонки
    const input = elementCreater.createInput(`name`);
    elementCreater.createCell(row, input);

    // поле для выбора типа колонки
    const select = elementCreater.createSelect(`type`, [
        { value: `text`, content: `Однострочный текст` },
        { value: `textarea`, content: `Многострочный текст` },
        { value: `number`, content: `Число` },
        { value: `date`, content: `Дата` }
    ]);
    elementCreater.createCell(row, select);

    // кнопка удаления колонки
    const button = elementCreater.createButton(`delete-button`, `Удалить`, deleteColumn);
    elementCreater.createCell(row, button);

    if (data) {
        input.value = data.name;
        select.value = data.type;
    }

    table.append(row);
}

// функция удаления колонки
function deleteColumn(event) {
    const button = event.target;

    const row = button.closest('tr');
    row.remove();

    const table = document.querySelector(`#price-list-columns-table`);

    // обновляем номера колонок
    const rows = table.querySelectorAll(`tr`);
    rows.forEach((row, index) => {
        const numCell = row.querySelector(`td:first-child`);
        numCell.textContent = `Колонка ${index + 1}`;
    });
}

// обработчик кнопки добавления колонки
document.querySelector(`#add-column`).addEventListener(`click`, function () {
    addColumn();
});

// обработчик кнопки добавления готовой колонки
document.querySelector('#add-existing-column').addEventListener('click', function () {
    const select = document.querySelector(`#select-column`);
    addColumn({ type: select.value, name: select.options[select.selectedIndex].text });
});

// обработчик кнопки сохранения прайс-листа
document.querySelector(`#price-list-form`).addEventListener(`submit`, async function (event) {
    event.preventDefault();

    let isValid = true;

    // сохраняем имя
    const nameInput = this.querySelector(`#price-list-name`);
    const name = nameInput.value;
    if (name.trim() == "") {
        nameInput.placeholder = `Поле обязательно к заполнению`;
        isValid = false;
    }

    // сохраняем колонки в массив
    const columns = [];
    this.querySelectorAll(`#price-list-columns-table tr`).forEach(column => {
        const columnNameInput = column.querySelector(`.name`);
        const columnName = columnNameInput.value;
        if (columnName.trim() == ``) {
            columnNameInput.placeholder = `Поле обязательно к заполнению`;
            isValid = false;
        }

        const type = column.querySelector(`.type`).value;

        columns.push({ name: columnName, type: type });
    });

    if (isValid) {
        // отправляем данные на сервер
        const response = await fetch(`/api/price-lists/`, {
            method: `POST`,
            headers: {
                "Content-Type": `application/json`
            },
            body: JSON.stringify({ name, columns })
        });
        if (response.ok) {
            // сохраняем созданные колонки в куки
            saveCookie(columns);

            window.location.href = `/price-lists/`;
        }
        else {
            alert(`Не удалось сохранить`);
        }
    }
});

// фунцкия сохранения колонок
function saveCookie(columns) {
    const existingColumns = getCookie(`columns`);
    const existingColumnsArray = existingColumns ? JSON.parse(existingColumns) : [];

    // объединяем новые колонки с существующими
    const updatedColumns = [...existingColumnsArray];
    columns.forEach(column => {
        if (existingColumnsArray.some(existingColumn => existingColumn.name == column.name && existingColumn.type == column.type) == false) {
            updatedColumns.push(column);
        }
    });
    
    document.cookie = `columns=${JSON.stringify(updatedColumns)}`;
}

// обработчик кнопки отмены
document.querySelector(`#cancel-price-list`).addEventListener(`click`, function() {
    window.location.href = `/price-lists/`;
});

document.addEventListener(`DOMContentLoaded`, function() {
    showPriceListForm();
    showExistingColumns();
});