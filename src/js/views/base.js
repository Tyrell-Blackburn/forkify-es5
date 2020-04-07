// Document that contains reusable code

// create an object that will create all the elements from our DOM
export const elements = {
    searchForm: document.querySelector('.search'),
    searchInput: document.querySelector('.search__field'),
    searchRes: document.querySelector('.results'),
    searchResList: document.querySelector('.results__list'),
    searchResPages: document.querySelector('.results__pages'),
    recipe: document.querySelector('.recipe'),
    recipeServings: document.querySelector('.recipe__info-data--people'),
    shopping: document.querySelector('.shopping__list'),
    likesMenu: document.querySelector('.likes__field'),
    likesList: document.querySelector('.likes__list')
};

// The class name of the loader element which is generated with our Javascript
export const elementStrings = {
    loader: 'loader'
}

/*
    Display a loader animation while AJAX requests are being made
    
    Arguments:
    parent: The element the loader will appear in as a child
*/

// 
export const renderLoader = parent => {

    // The loading animation using an SVG
    const loader = `
        <div class="${elementStrings.loader}">
            <svg>
                <use href="img/icons.svg#icon-cw"></use>
            </svg>
        </div>
    `;

    // add the 'loader' code into the element
    parent.insertAdjacentHTML('afterbegin', loader);
};

/*
    Clears the loader animation
*/
export const clearLoader = () => {

    // Selects the loader element
    const loader = document.querySelector(`.${elementStrings.loader}`);

    // If the loader element exists, select the parent element and remove the loader code from it.
    if (loader) loader.parentElement.removeChild(loader);
};