import * as elementCreater from "./elementCreater.js";

const pageSize = 5; // количество строк на странице
let currentPage = 1; // текущая страница
let totalPages = 1; // всего страниц

// функция создания формы для добавления товара
async function createProductForm(data) {
    const form = document.querySelector(`#product-form`);

    form.querySelector(`.name`).id = data.columns[0].id; // название товара
    form.querySelector(`.code`).id = data.columns[1].id; // артикул

    const table = document.querySelector(`#product-columns-table tbody`);
    
    for (let i = 2; i < data.columns.length; i++) {
        const row = document.createElement(`tr`);

        elementCreater.createCell(row, data.columns[i].name);

        // создаем элемент, соответствующий типу колонки
        let field;
        if (data.columns[i].type == `textarea`) {
            field = document.createElement(`textarea`);
            field.rows = `3`;
        }
        else {
            field = document.createElement(`input`);
            field.type = data.columns[i].type;
        }
        field.className = `form-control field`;
        field.id = data.columns[i].id;
        field.name = data.columns[i].name;

        elementCreater.createCell(row, field);

        table.append(row);
    }
}

// функция отображения содержимого прайс-листа
async function showPriceListContent(id) {
    const header = document.querySelector(`#products-table-header`);

    // получаем данные прайс-листа (имя и колонки)
    const response = await fetch(`/api/price-lists/${id}`, {
        method: `GET`,
        headers: {
            "Accept": `application/json`
        }
    });
    if (response.ok) {
        const data = await response.json();

        // создаем форму для добавления товара
        createProductForm(data);

        // вписываем имя прайс-листа в название вкладки и заголовок страницы
        document.title = data.name;
        document.querySelector(`#price-list-title`).textContent = data.name;

        // заполняем заголовок таблицы именами колонок
        data.columns.forEach((column, index) => {
            const cell = document.createElement(`th`);
            cell.style.cursor = `pointer`;
            cell.textContent = column.name;
            cell.setAttribute(`index`, index);
            cell.setAttribute(`order`, `desc`); // порядок сортировки
            // добавляем заголовкам функцию сортировки по щелчку
            cell.addEventListener(`click`, async function () {
                // меняем тип сортировки
                cell.setAttribute(`order`, cell.getAttribute(`order`) == 'asc' ? 'desc' : 'asc');

                // помечаем заголовок выбранным для сортировки, чтобы сразу сортировать добавляемые товары
                header.querySelectorAll(`th`).forEach(column => {
                    console.log(header.querySelectorAll(`th`));
                    column.setAttribute(`selected`, `false`);
                });
                cell.setAttribute(`selected`, `true`);

                // отображаем новый список продуктов
                await showProducts(id);
            });

            header.append(cell);
        });
        elementCreater.createCell(header, ``);

        // заполняем список товаров
        showProducts(id, currentPage);
    }
    else {
        alert(`Не удалось получить данные прайс-листа`);
    }
}

// функция отображения списка товаров
export async function showProducts(id) {
    const table = document.querySelector(`#products-table tbody`);

    // получаем товары прайс-листа
    const response = await fetch(`/api/products/${id}`, {
        method: `GET`,
        headers: {
            "Accept": `application/json`
        }
    });
    if (response.ok) {
        const data = await response.json();

        // очищаем список
        table.innerHTML = ``;

        if (data.length > 0) {
            // считаем количество страниц
            totalPages = Math.ceil(data.length / pageSize);
            // сортируем полученные строки
            sortData(data);
            // отображаем строки текущей страницы
            displayPage(table, data, currentPage);
        }
        else {
            createNoDataRow(table);
        }

        // обновляем данные навигации
        updatePagination();
    }
    else {
        alert(`Не удалось получить данные о колонках`);
    }
}

// функция отображения строк на странице
function displayPage(table, rowsData) {
    const start = (currentPage - 1) * pageSize; // начало списка
    const end = start + pageSize; // конец списка
    const currentRows = rowsData.slice(start, end); // вырезаем нужный список

    if (currentRows.length == 0 && currentPage > 1) {
        currentPage--;
        displayPage(table, rowsData);
    }

    // отображаем строки полученного списка на странице
    currentRows.forEach(product => {
        createProductRow(table, product);
    });
}

// функция обновления навигации
function updatePagination() {
    document.querySelector(`#current-page`).textContent = currentPage;
    document.querySelector(`#total-pages`).textContent = totalPages;
    document.querySelector(`#prev-page`).disabled = currentPage === 1;
    document.querySelector(`#next-page`).disabled = currentPage === totalPages;
}

// функция создания строки товара
function createProductRow(table, data) {
    const row = document.createElement(`tr`);
    row.id = data.id;

    data.cells.forEach(cell => {
        elementCreater.createCell(row, cell.value);
    });

    // кнопка удаления товара
    const button = elementCreater.createButton(`delete-button`, `Удалить`, deleteProduct);
    elementCreater.createCell(row, button);

    table.append(row);
}

// функция удаления товара
async function deleteProduct(event) {
    if (confirm(`Удалить товар из списка?`)) {
        const button = event.target;

        const row = button.closest('tr');

        // отправляем запрос на удаление товара
        const response = await fetch(`/api/products/${row.id}`, {
            method: `DELETE`,
            headers: {
                "Accept": `application/json`
            }
        });
        if (response.ok) {
            const pathParams = window.location.pathname.split(`/`);
            const id = pathParams[pathParams.length - 1];
            showProducts(id);
        }
        else {
            alert(`Не удалось удалить товар`);
        }
    }
}

// строка, если товаров нет
function createNoDataRow(table) {
    const header = document.querySelector(`#products-table-header`);

    const row = document.createElement(`tr`);
    row.id = `no-data`;

    const cell = document.createElement(`td`);
    cell.colSpan = header.children.length;
    cell.textContent = `Прайс-лист пуст`;

    row.append(cell);

    table.append(row);
}

// функция сортировки строк
function sortData(data) {
    // находим столбец, по которому отсортирована таблица
    const table = document.querySelector(`#products-table`);
    const header = table.querySelector(`thead`).querySelector('[selected="true"]');

    if (header != null) {
        const order = header.getAttribute(`order`);
        const index = header.getAttribute(`index`);

        const sortedData = data.sort((a, b) => {
            // сравниваем строки по нужным столбцам
            const rowA = a.cells[index].value.toLowerCase();
            const rowB = b.cells[index].value.toLowerCase();

            if (rowA < rowB) {
                return order == 'asc' ? -1 : 1;
            }
            if (rowA > rowB) {
                return order == 'asc' ? 1 : -1;
            }
            return 0;
        });

        data = sortedData;
    }
}

// обработчик нажатия "Назад"
document.querySelector(`#prev-page`).addEventListener(`click`, () => {
    if (currentPage > 1) {
        currentPage--;

        const pathParams = window.location.pathname.split(`/`);
        const id = pathParams[pathParams.length - 1];
        
        showProducts(id);
    }
});

// обработчик нажатия "Вперед"
document.querySelector(`#next-page`).addEventListener(`click`, () => {
    if (currentPage < totalPages) {
        currentPage++;

        const pathParams = window.location.pathname.split(`/`);
        const id = pathParams[pathParams.length - 1];
        
        showProducts(id);
    }
});

// обработчик кнопки добавления товара
document.querySelector(`#add-product`).addEventListener(`click`, async function () {
    // отображаем форму
    document.querySelector(`#product-form-container`).style.display = `block`;
});

// обработчик кнопки возвращения к прайс-листам
document.querySelector(`#back-to-list`).addEventListener(`click`, async function () {
    window.location.href = `/price-lists/`;
});

document.addEventListener(`DOMContentLoaded`, async function () {
    const pathParams = window.location.pathname.split(`/`);
    const id = pathParams[pathParams.length - 1];

    await showPriceListContent(id);
});