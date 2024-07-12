import * as elementCreater from "./elementCreater.js";

// функция отображения списка прайс-листов
async function createPriceListsTable() {
    const table = document.querySelector(`#price-lists-table tbody`);

    // получаем список прайс-листов
    const response = await fetch(`/api/price-lists/`, {
        method: `GET`,
        headers: {
            "Accept": `application/json`
        }
    });
    if (response.ok) {
        const data = await response.json();

        if (data.length > 0) {
            // вставляем прайс-листы в таблицу
            data.forEach((pl, index) => {
                createPriceListRow(table, pl, index + 1);
            });
        }
        else {
            createNoDataRow(table);
        }
    }
    else {
        alert(`Не удалось получить информацию о прайс-листах`);
    }
}

// функция создания строки прайс-листа
function createPriceListRow(table, data, num) {
    const row = document.createElement(`tr`);
    row.id = data.id;

    // номер строки
    elementCreater.createCell(row, num);

    // ссылка на детали прайс-листа
    const link = elementCreater.createHref(`/price-lists/${data.id}`, data.name);
    elementCreater.createCell(row, link);

    // кнопка удаления прайс-листа
    const button = elementCreater.createButton(`delete-button`, `Удалить`, deletePriceList);
    elementCreater.createCell(row, button);

    // вставляем в начало списка (как в примере)
    table.insertBefore(row, table.firstChild);
}

// строка, если прайс-листов нет
function createNoDataRow(table) {
    const header = document.querySelector(`#price-lists-table tr`);

    const row = document.createElement(`tr`);

    const cell = document.createElement(`td`);
    cell.colSpan = header.children.length;
    cell.textContent = `Еще нет прайс-листов`;

    row.append(cell);

    table.append(row);
}

// функция удаления прайс-листа
async function deletePriceList(event) {
    if (confirm(`Удалить прайс-лист?`)) {
        const button = event.target;

        const row = button.closest('tr');

        // отправляем запрос на удаление прайс-листа
        const response = await fetch(`/api/price-lists/${row.id}`, {
            method: `DELETE`,
            headers: {
                "Accept": `application/json`
            }
        });
        if (response.ok) {
            row.remove();

            // обновляем номера строк
            const table = document.querySelector(`#price-lists-table tbody`);
            if (table.children.length > 0) {
                const rows = table.querySelectorAll(`tr`);
                rows.forEach((row, index) => {
                    const numCell = row.querySelector(`td:first-child`);
                    numCell.textContent = rows.length - index;
                });
            }
            else {
                createNoDataRow(table);
            }
        }
        else {
            alert(`Не удалось удалить прайс-лист`);
        }
    }
}

// обработчик кнопки добавления прайс-листа
document.querySelector(`#add-price-list`).addEventListener(`click`, async function() {
    window.location.href = `/price-lists/new/`;
});

document.addEventListener(`DOMContentLoaded`, async function() {
    await createPriceListsTable();
});