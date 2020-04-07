import axios from 'axios';
import { key, proxy } from '../config'; // These are used for APIs that need them. This one doesn't

/**
 * Search Class to call the forkify API and hold the result
 */

export default class Search {

    // Store the user query from the search field in this object
    constructor (query) {
        this.query = query;
    }

/*
    Async Function to return recipes from forkify-api
    
    Arguments:
    page number: current page number
    type of button: enter 'prev' or 'next'
*/
    
    // adding 'async' at the start tells us it's an asynchronous method
    async getResults() {

        // encapsulate the await into a try expression to add error handling
        // Try to call the API
        try {
            // Call the forkify API using the user search query and store the results in the res constant
            const res = await axios(`${proxy}https://forkify-api.herokuapp.com/api/search?key=${key}&q=${this.query}`);

            // Filter the results to only include the recipies in the results property
            this.result = res.data.recipes; // returns an array of recipe objects

        }

        // If the AJAX request fails, then catch the error
        catch (error){
            // Print the error to the console
            console.log(`Your search encountered an error. ${error}`)
        }
    }
}