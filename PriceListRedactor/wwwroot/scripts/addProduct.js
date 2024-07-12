import { showProducts } from "./priceListContent.js";

// функция получения данных формы
function getFormData(form) {
    const data = [];
    const elements = form.querySelectorAll(`input, textarea`);
    elements.forEach(element => {
        data.push({ columnId: element.id, columnName: element.name, value: element.value });
    });

    return data;
}

// функция закрытия формы
function closeProductForm(checkChanges = true) {
    const form = document.querySelector(`#product-form`);
    const elements = form.querySelectorAll(`input, textarea`);

    // проверка, были ли внесены изменения
    const hasChanges = Array.from(elements).some(element => element.value != "");

    if (checkChanges == false || hasChanges == false || confirm(`Отменить внесенные изменения?`)) {
        // очищаем и скрываем форму
        elements.forEach(element => {
            element.value = ``;
        });

        document.querySelector(`#product-form-container`).style.display = `none`;
    }
}

// обработчик кнопки сохранения товара
document.querySelector(`#product-form`).addEventListener(`submit`, async function (event) {
    event.preventDefault();

    // собираем данные формы
    const productData = getFormData(this);

    let isValid = true;

    if (productData.some(p => p.columnName == `name` && p.value.trim() == ``)) {
        this.querySelector(`.name`).placeholder = `Поле обязательно к заполнению`;
        isValid = false;
    }
    if (productData.some(p => p.columnName == `code` && p.value.trim() == ``)) {
        this.querySelector(`.code`).placeholder = `Поле обязательно к заполнению`;
        isValid = false;
    }

    if (isValid) {
        const pathParams = window.location.pathname.split(`/`);
        const id = pathParams[pathParams.length - 1];

        // отправляем данные на сервер
        const response = await fetch(`/api/products/${id}`, {
            method: `POST`,
            headers: {
                "Content-Type": `application/json`
            },
            body: JSON.stringify(productData)
        });
        if (response.ok) {
            // закрываем форму
            closeProductForm(false);
            //загружаем новый список товаров
            await showProducts(id);
        }
        else {
            alert(`Не удалось сохранить`);
        }
    }
});

// обработчик кнопки закрытия формы
document.querySelector(`#cancel-product`).addEventListener(`click`, () => {
    closeProductForm();
});