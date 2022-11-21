"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = void 0;
var thaw_1 = require("./thaw");
var Block = /** @class */ (function () {
    function Block(options, count) {
        if (count === void 0) { count = 200; }
        this.index = 0;
        this.thaws = [];
        this.count = count;
        this.options = options;
    }
    /**
     * add an item to the end of items
     */
    Block.prototype.add = function (item) {
        var next = this.next();
        next.add(item);
        return this;
    };
    /**
     * add an Array to the end of items
     */
    Block.prototype.addArray = function (items) {
        var next = this.next();
        next.addArray(items);
        return this;
    };
    /**
     * insert an item into items @ current position
     */
    Block.prototype.insert = function (item) {
        var next = this.next();
        next.insert(item);
        return this;
    };
    /**
     * insert and array into items @ current position
     */
    Block.prototype.insertArray = function (items) {
        var next = this.next();
        next.insertArray(items);
        return this;
    };
    /**
     * Stops all thaws in this block
     */
    Block.prototype.stop = function () {
        for (var i = 0; i < this.thaws.length; i++) {
            this.thaws[i].stop();
        }
        return this;
    };
    /**
     * Get next available in block
     */
    Block.prototype.next = function () {
        var thaw;
        var thaws = this.thaws;
        if (thaws.length < this.count) {
            thaw = new thaw_1.Thaw([], this.options);
            thaws.push(thaw);
        }
        else {
            thaw = thaws[this.index] || null;
        }
        this.index++;
        if (this.index >= this.count) {
            this.index = 0;
        }
        return thaw;
    };
    return Block;
}());
exports.Block = Block;
//# sourceMappingURL=block.js.map