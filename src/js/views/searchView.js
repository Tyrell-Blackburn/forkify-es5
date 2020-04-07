// Concerned with DOM elements

import { elements } from './base';

/*
    Get the user search query from the search bar
*/
 
export const getInput = () => elements.searchInput.value;

/*
    Clears the search field
*/

export const clearInput = () => {
    elements.searchInput.value = '';
}

/*
    Clears the search results and page buttons from the search area
*/

export const clearResults = () => {
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
}

/*
    Highlights the selected recipe in the search view
*/

export const highlightSelected = id => {

    /* 
    1. Clear highlights from existing elements
    Build an NodeList of all the <a> search elements with class "results__link"
    <a class="results__link" href="#23456"> */

    const searchResults = document.querySelectorAll('.results__link');

    // Iterate through every <a> element in the NodeList and remove the 'results__link--active' class from each
    searchResults.forEach(el => el.classList.remove('results__link--active'));
    
    /* 
    2. Highlight newly selected element
    Store the selected recipe element into a variable by searching for the one that has the same hash ID as the one in the URL
    <a class="results__link" href="#23456"></a> */
    
    const recipeToHighlight = document.querySelector(`.results__link[href*="#${id}"]`)
    
    // Add the class 'results__link--active' to this element, which will highlight it according to the CCS
    // <a class="results__link results__link--active" href="#23456"></a>
    recipeToHighlight.classList.add('results__link--active');
}

/**
 * Function called from renderRecipe() to truncate the title of each recipe to fit on a single line
 * Truncates title to 17 characters if > 17 characters else returns original title
 * 
 *  Arguments:
 *  title: title to evalutate
 *  limit: title character length to truncate to
 */
    
export const limitRecipeTitle = (title, limit = 17) => {

    // Temporary array that will hold the words of the new title
    // Can use const because we are not mutating the type
    const newTitle = [];

    // If title > 17 characters
    if (title.length > limit) {

        // [Pasta,with,Pesto,Sauce,and,Olives]
        // accumulator = 0 = initialValue which is 0 OR the callback's return value
        // currentValue = Pasta = current element in the array
        const reducerFunction = (accumulator, currentValue) => {
            
            /**
             * [Pasta] Acc = 0 + Cur = 5    newTitle = [Pasta]
             * [with] Acc = 5 + Cur = 4     newTitle = [Pasta,with]
             * [Pesto] Acc = 9 + Cur = 5    newTitle = [Pasta,with,Pesto]
             * [Sauce] Acc = 14 + Cur = 5   newTitle = NO CHANGE (Acc = 14 + Cur = 5 > limit)
             */

            // If accumulator + current word length is less than the limit
            if (accumulator + currentValue.length <= limit) { 
                
                // Then push word to new title
                newTitle.push(currentValue);
            }

            // Return value = value of accumulator for next element
            return accumulator + currentValue.length; // new accumulator value
        }
        
        // Split title string by ' ' and put each word into a single array
        // 'Pasta with Pesto Sauce and Olives' => [Pasta,with,Pesto,Sauce,and,Olives]
        const truncTitle = title.split(' ');
        
        // Rebuilds title to remain within the limit
        // [Pasta,with,Pesto,Sauce,and,Olives]
        // Arg 1 = reducerFunction
        // Arg 2 = initialValue of accumulator
        truncTitle.reduce(reducerFunction, 0);
        
        // Combine array elements into a string and separate with ' ', then return the new string
        // 'Pasta with Pesto ...'
        return `${newTitle.join(' ')} ...`;
    }

    // If title < 17 characters, then don't truncate
    return title;
}

/*
    Function called from renderButtons() only for button HTML code
    
    Arguments:
    page: current page number
    type: enter 'prev' or 'next'
*/

// HTML5 dataset attribute (data-goto=${type === 'prev' ? page - 1 : page + 1})
// Can be referenced later to determine what results to render
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
    <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
`;

/*
    Function called from renderResults() to return HTML code for next or previous search result buttons
    
    Arguments:
    page: current page number
    numResults: total number of recipies found
    resPerPage: how many results display on the page
*/
const renderButtons = (page, numResults, resPerPage) => {
    
    // Determine how many pages there will be by dividing total results by how many results per page.
    // 25 results with 10 per page (2.5) will be 3 pages (ceil)
    const totalPages = Math.ceil(numResults / resPerPage);

    // button variable to hold the button code
    let button;
    
    // If on page 1 && results are more than what will fit on a page (more results than 10)
    if (page === 1 && totalPages > 1) {
        // then create only next button 
        button = createButton(page, 'next');
    }

    // If current page is in the middle of page 1 and last page
    else if (page < totalPages) {
        // then create both buttons
        button = `
            ${createButton(page, 'next')}
            ${createButton(page, 'prev')}
        `;

    // If on the last page and total pages is more than 1
    } else if (page === totalPages && totalPages > 1) {
        // then create only previous button
        button = createButton(page, 'prev');
    }

    // render buttons to the DOM
    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

/*
    Function used with renderResults() to create the search result HTML code for each recipe and render it to the DOM
    
    Arguments:
    recipe: a single recipe object
*/

const renderRecipe = recipe => {

    /* When the <a> element is clicked, the text in the href attribute will be added to the URL. This will initiate a hashchange event which will trigger the controlRecipe() in index.js. */
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${limitRecipeTitle(recipe.title)}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;

    // Render the list item HTML to the DOM
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
}

/*
    Render the recipe array from the fokify API to the DOM
    
    Arguments:
    recipes: recipes array from the Forkify API
    page: page number to dispay
    resPage: how many results per page
*/

export const renderResults = (recipes, page = 1, resPerPage = 10) => {

    // start index of the recipe array to display (Default 0)
    const start = (page - 1) * resPerPage;

    // end index of the recipe array to display (Default 10)
    const end = page * resPerPage;
    
    // Use try and catch in case the array is empty
    try {

        // Extract (slice) an array of recipes only containing the start to end index
        const recipesToDisplay = recipes.slice(start, end);
        
        // For each recipe in the array, render it to the DOM
        // Giving the forEach a function will automatically input the element (a recipe) into the function
        recipesToDisplay.forEach(renderRecipe);
    }

    // If the array is empty, then return this
    catch {
        console.log('No recipes can be found for your search term');
    }

    // Render the buttons to the DOM
    renderButtons(page, recipes.length, resPerPage)
};
