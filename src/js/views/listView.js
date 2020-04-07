import { elements } from './base';

export const renderItem = item => {
    const markup = `
        <li class="shopping__item" data-itemid=${item.id}>
            <div class="shopping__count">
                <input type="number" min="0" value="${item.count}" step="${item.count / 2}" class="shopping__count-value">
                <p>${item.unit}</p>
            </div>
            <p class="shopping__description">${item.ingredient}</p>
            <button class="shopping__delete btn-tiny">
                <svg>
                    <use href="img/icons.svg#icon-circle-with-cross"></use>
                </svg>
            </button>
        </li>
    `;
    elements.shopping.insertAdjacentHTML('beforeend', markup);
}

// delete item from window
// Need to update. If all items have been deleted, then delete the actual list object so a new one can be added
export const delItem = id => {

    // CSS attribute selector using these brackets []
    const item = document.querySelector(`[data-itemid="${id}"]`)
    if (item) item.parentElement.removeChild(item);
}