/**
 * @param {number} idx - index to remove
 */
Array.prototype.remove = function(idx) {
    this.splice(idx, 1);
}

Array.prototype.random = function() {

    const randomIdx = Math.floor(Math.random() * this.length);

    return this[randomIdx];
}