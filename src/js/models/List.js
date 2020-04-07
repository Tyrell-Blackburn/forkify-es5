import uniqid from 'uniqid';

// This class is used to generate the list of ingredients
export default class List {
    constructor () {
        this.items = [];
    }

    addItem (count, unit, ingredient) {
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient
        }

        this.items.push(item);
        return item;
    }

    delItem (id) {
        // get index of object based on ID
        const index = this.items.findIndex(el => el.id === id);
        // remove object at found index
        // start index, how many positions want to delete
        // [splice] cuts out of oroginal, [slice] makes a copy of original
        // [2,4,8] splice(1,2) --> returns [4], original array is [2, 8]
        // [2,4,8] slice(1,2) --> returns [4], original array is [2,4,8]
        this.items.splice(index, 1);
    }

    // When counts are modified on the UI, this is called to update the counts in the List object
    updateCount (id, newCount) {
        this.items.find(el => el.id === id).count = newCount;
    }
}