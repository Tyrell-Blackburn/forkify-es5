import axios from 'axios';
import { proxy } from '../config';

/**
 * when a recipe is click on, a Recipe object is created. The key data is requested and added to the Recipe object
 */

export default class Recipe {

    constructor(id) {
        this.id = id;
    }
    
    // The recipe is retrived from the API and key data is added to the Recipe object
    async getRecipe () {

        try {
            const res = await axios(`${proxy}https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;

        } catch (error) {
            console.log(`Your search encountered an error. ${error}`)
        }
    }

    calcTime () {
        // Time is calculated on the assumption that we need 15 mins for every 3 ingredients.
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings () {
        // An arbitrary amount
        this.servings = 4;
    }

    /**
     * Modifies each ingredient string preparing it to render
     */

    parseIngredients () {

        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];

        // incredients are held in an array, so we use map to modify each element and return a new array.
        const newIngredients = this.ingredients.map(el => {
            
            // 1. Make the ingredient lowercase
            let ingredient = el.toLowerCase();

            // 2. Replace every long representation of a unit with the short version
            // examines each element in unitsLong.
            // If the element exists in an ingredient, then replace it with the short version
            unitsLong.forEach((unit, index) => {
                ingredient = ingredient.replace(unit, units[index]);
            });

            // 3. Remove parenthesis
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // 4. Split ingredient string by ' ' into an array containing count, unit and ingredient
            const arrIng = ingredient.split(' ');

            console.log(arrIng);
            // arrIng = ["1-1/2", "pound", "ground", "beef"]
            // findIndex() examines each element of arrIng and evaluates it against a callback function that returns 'true' or 'false'. If the callback returns true, then the index of the element in arrIng is returned. If all elements return 'false' after being evaluated, then -1 is returned.

            // units.includes(element) checks to see if the element in arrIng also exists in the units array. If so 'true' will be returned. Index 1 of arrIng matches index 7 of the units array so true is returned from the includes() and therefore index 1 is stored in unitIndex.
            
            // unitIndex = 1
            const unitIndex = arrIng.findIndex(element => units.includes(element));

            let objIng;

            // If there is a matching unit and the first character of the ingredient is a space, then
            if (unitIndex > -1 && ingredient.charAt(0) === ' ') {
                objIng = {
                    count: 1,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                };
            }

            // if unit
            else if (unitIndex > -1) {

                // My solution to the count
/*                 
                let count = '';
                const regexForCount = RegExp(/\d|\/|\s\d/); 
                const regexForUnit = RegExp(/ \D/); 

                for (let i = 0; i < ingredient.length; i ++) {
                    if (ingredient.charAt(i).match(regexForCount)) {
                        count += ingredient.charAt(i);
                    } else if (ingredient.charAt(i).match(regexForUnit)) {
                        break;
                    }
                }
 */

                // Teacher's solution to the count
                // 4 1/2 cups, arrCount is [4, 1/2]
                // 4 cups, arrCount is [4]
                const arrCount = arrIng.slice(0, unitIndex);

                let count;

                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrCount.join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                };

            // There is NO unit, but 1st element is a number
            } else if (parseInt(arrIng[0], 10)) {
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
                
            // there is not a unit
            } else if (unitIndex === -1) { 
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

            return objIng;
        });

        this.ingredients = newIngredients;
    }

    // update the servings amount and the ingredients amount
    updateServings (type) {

        // Update servings
        const oldServings = this.servings;
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;
        const servingsMultiplier = newServings / oldServings;

        this.servings = newServings;
        
        // Update ingredients
        this.ingredients.forEach(el => {
            el.count *= servingsMultiplier;
        })
    }
}

