export default class Likes {
    constructor() {
        this.likes = [];
    };

    addLike (id, title, author, image) {
        const like = { id, title, author, image }
        this.likes.push(like);

        // persist data in local storage
        this.persistData()

        return like;
    };

    delLike (id) {
        const index = this.likes.findIndex(el => el.id === id);
        this.likes.splice(index, 1);

        // persist data in local storage
        this.persistData()

    };


    // function returns a boolean if the recipe with id is liked or not.
    // if the input id is not in the likes array, then -1 will be returned, if the index returned is not -1, then it's true.
    isLiked (id) {
        return this.likes.findIndex(el => el.id === id) !== -1;
    };

    getNumLikes () {
        return this.likes.length;
    };

    persistData () {
        localStorage.setItem('likes', JSON.stringify(this.likes));
    }

    readStorage() {

        // Read localStorage as a string and parse it back into an object.
        const storage = JSON.parse(localStorage.getItem('likes'));

        // Restore likes from localStorage
        if (storage) this.likes = storage;
    }
}   