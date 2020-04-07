import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';
import { _ } from 'core-js';

/*************************
 * Global state object of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 *************************/

const state = {};

/********************
 * SEARCH CONTROLLER - Handles user searches and displays in the search area
 * Called when the user hits enter or clicks the SEARCH button
 * 
 * 1. Retrieves the user search query
 * 2. Calls the Forkify API with the search query and stores the results
 * 3. Displays results to the DOM
 ********************/

const controlSearch = async () => {

    // Retrieve and store the user search query from the search bar
    const query = searchView.getInput();

    // If there is a search query...
    if (query) {
        
        // Create a new Search object containing the search query and store it in the global state object
        state.search = new Search(query);

        // Remove all current code in the search results area (buttons and results)
        searchView.clearInput();
        searchView.clearResults();

        // Display a loading animation in the search area
        renderLoader(elements.searchRes);

        // Attempt retrive results from the API
        try {
            // Calls the recipe API in the Search object
            await state.search.getResults();
    
            // API call success, removes the loading animation
            clearLoader();

            // Renders the search results to the results area
            searchView.renderResults(state.search.result);
        }

        // If the API does not have results from the search query, then print the error
        catch (e) {
            alert('something went wrong with the search...');
            clearLoader();
        }
    }
};

/**
 * When the user clicks on the SEARCH button
 * The submit event only fires when the user clicks a submit button (<button> or <input type="submit">) in a form.
 * searchForm: document.querySelector('.search')
 */

elements.searchForm.addEventListener('submit', e => { // <form class="search">
    
    // Prevents the default behavior of the element, in this case
    // A click on a form submit button – initiates its submission to the server.
    e.preventDefault();

    // Displays search results to the DOM
    controlSearch();
});

/**
 * When the user clicks the next and previous buttons
 * They don't exist when the page loads so we use Event Delegation, which is a technique for listening to events where you delegate a parent element that already exists as the listener for all of the events that happen inside it.
 */

elements.searchResPages.addEventListener('click', e => {

    // Select the element that the user clicked on
    // Event.target returns a reference to the target element which the event was originally dispatched
    
    // targetElement = <div class="results__pages">
    const targetElement = e.target;

    // Starting with the Element itself, the closest() method traverses parents (heading toward the document root) of the Element until it finds a node that matches the provided selectorString. Will return itself or the matching ancestor. If no such element exists, it returns null.
    
    // Users can only click the <span> and <svg> elements, so closest() will traverse to the parent
    // btn = <button class="btn-inline results__btn--next" data-goto="2">
    const btn = targetElement.closest('.btn-inline');

    /* 
        <PARENT>
            <div class="results__pages">                                     // click here btn = null
                <button class="btn-inline results__btn--next" data-goto="2"> // click here btn = btn-inline
                    <span>Page 2</span>                                      // click here btn = btn-inline
                    <svg class="search__icon">                               // click here btn = btn-inline
                        <use href="img/icons.svg#icon-triangle-right"></use>
                    </svg>
                </button>
            </div>
        </PARENT>
    */

    // If btn is assigned
    if (btn) {

        /* The dataset read-only property of the HTMLOrForeignElement interface provides read/write access to all the custom data attributes (data-*) set on the element. 

        <button class="btn-inline results__btn--next" data-goto="2">
        converts '2' into the integer 2 */
        const goToPage = parseInt(btn.dataset.goto, 10);
        
        // Clears the search results and page buttons from the search area
        searchView.clearResults();

        // Renders the recipe results and buttons according to the button that was clicked on
        searchView.renderResults(state.search.result, goToPage);
    }
});

/********************
 * RECIPE  CONTROLLER
 * 
 * Responsible for loading a recipe in the recipe view
 * This is called when
 * 1) The page loads
 * 2) When a recipe is selected and the fragment identifier changes (#xxxxx)
 *********************/

const controlRecipe = async () => {
    /*
    Stores the hash number in the URL into the id variable
    
    Window.location - The Window.location read-only property returns a Location object with information about the current location of the document.
    
    Location.hash - The hash property of the Location interface returns a USVString containing a '#' followed by the fragment identifier of the URL.
    
    Returns "#47746"

    String.replace('#', '') - removes the '#' from the string

    Returns "47746"

    id = 47746
    */
   const id = window.location.hash.replace('#', '');

    if (id) {
        
        // Clears the recipe area of HTML code
        recipeView.clearResults();

        // Display a loading animation in the recipe area
        renderLoader(elements.recipe);
        
        // Highlight selected recipe
        if (state.search) {
            searchView.highlightSelected(id);
        }
        
        // create new Recipe object
        state.recipe = new Recipe(id);
    
        // The recipe data is retrived
        try {

            // Get the recipe from the API
            await state.recipe.getRecipe();
            
            // Parse the ingredients
            state.recipe.parseIngredients();
        
            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render recipe
            clearLoader();

            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        
        }
        catch (error) {
            alert(`Error: ${error}. Cannot process recipe`);
        }
    }
};

/**
 * This ensures a recipe loads when
 * 1) The page is refreshed and there is a hash number in the URL
 * 2) When a different recipe is selected
 * 
 * Adds Event Listeners to the window object for:
 * 
 * 1) 'load' event is fired when a resource and its dependent resources (the window object) have finished loading.
 * 2) 'hashchange' is fired when the fragment identifier of the URL has changed (the part of the URL beginning with and following the # symbol). The fragment identifier will change when a recipe is click in the search results section.
 */

['hashchange', 'load'].forEach(e => window.addEventListener(e, controlRecipe));

/********************
 * LIKES  CONTROLLER
 ********************/

const controlLike = () => {
    // If no likes have been created, then create a Likes object
    if (!state.likes) state.likes = new Likes();

    // Get current recipe ID
    const currentID = state.recipe.id;
    
    // If user likes a recipe that HAS NOT yet been liked
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        // Tottle the Like buttton
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);

    // User HAS liked the current recipe
    } else {
        // Remove like from the state
        state.likes.delLike(currentID);

        // Tottle the Like buttton
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// Handling recipe View button clicks
elements.recipe.addEventListener('click', e => {
    
    // Teacher's solution to inc/dec buttons using matches()
    // the * means any child elements of this class

    // decrease button is clicked
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.renderServings(state.recipe);
        }

    // increase button is clicked
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.renderServings(state.recipe);
    
    // Add ingredients to shopping list
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // create new list Only if one does not yet exist
        if (state.list === undefined) {
            controlList();
        }

    // User clicks like on a recipe
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }

    // My solution to increase/decrease ingredient count buttons using closest()
    
    // const btn = e.target.closest('.btn-tiny');

    // if (btn) {
    //     // 1. get increase or decrease information from button
    //     const incrementServingsBtn = btn.dataset.change;
    //     // 2. update servings and ingredients
    //     state.recipe.updateServings(incrementServingsBtn);
    //     // 3. render results
    //     recipeView.renderServings(state.recipe.ingredients, state.recipe.servings);
    // }

});

/********************
 * LIST  CONTROLLER
 *******************/

const controlList = () => {
    // create a new list
    state.list = new List();


    // add each ingredient to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        // render the UI
        listView.renderItem(item);
    })
};

// Restore likes when page loads
window.addEventListener('load', () => {
    state.likes = new Likes();
    
    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handle delete and update list items events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        
        // delete from state
        state.list.delItem(id);
        
        // delete from UI
        listView.delItem(id);
        
        // Hamdle the count update from UI
    } else if (e.target.matches('.shopping__count-value')) {
        const value = parseFloat(e.target.value, 10);
        state.list.updateCount(id, value);
    }
});
