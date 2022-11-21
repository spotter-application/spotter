"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.thaw = exports.Block = exports.Thaw = void 0;
/**
 * thaw an array of items
 */
var Thaw = /** @class */ (function () {
    function Thaw(items, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var _a = __assign(__assign({}, Thaw.defaultSettings), options), each = _a.each, done = _a.done;
        this.i = 0;
        this.isStopped = false;
        this.items = items;
        this.options = options;
        this.tick = function () {
            if (_this.isStopped)
                return;
            _this.timeout = setTimeout(_this.tick, 0);
            if (Thaw.thawing)
                return;
            var item = _this.items[_this.i];
            if (_this.i >= _this.items.length) {
                if (done !== null) {
                    Thaw.thawing = true;
                    done();
                    Thaw.thawing = false;
                }
                _this.isStopped = true;
                clearTimeout(_this.timeout);
                return;
            }
            if (each !== null) {
                Thaw.thawing = true;
                each(item, _this.i);
                Thaw.thawing = false;
            }
            else if (item !== undefined) {
                item();
            }
            _this.i++;
        };
        Thaw.thaws.push(this);
        if (!options.delay) {
            this.tick();
        }
    }
    Object.defineProperty(Thaw, "isThawing", {
        /**
         * returns if Thaw.js is thawing
         */
        get: function () {
            return Thaw.thawing;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Stops all Thaw instances
     */
    Thaw.stopAll = function () {
        for (var i = 0; i < Thaw.thaws.length; i++) {
            Thaw.thaws[i].stop();
        }
    };
    /**
     * readies thaw to continue
     */
    Thaw.prototype.makeReady = function () {
        if (this.isStopped) {
            this.isStopped = false;
            return true;
        }
        return false;
    };
    /**
     * Adds an item to the end of this instance of Thaw and readies Thaw to process it
     */
    Thaw.prototype.add = function (item) {
        this.items.push(item);
        if (this.makeReady()) {
            this.tick();
        }
        return this;
    };
    /**
     * Inserts an item just after the current item being processed in Thaw and readies Thaw to process it
     */
    Thaw.prototype.insert = function (item) {
        this.items.splice(this.i, 0, item);
        if (this.makeReady()) {
            this.tick();
        }
        return this;
    };
    /**
     * Adds an Array to the end of this instance of Thaw and readies Thaw to process it
     */
    Thaw.prototype.addArray = function (items) {
        this.items = this.items.concat(items);
        if (this.makeReady()) {
            this.tick();
        }
        return this;
    };
    /**
     * Inserts an Array just after the current item being processed in Thaw and readies Thaw to process them
     */
    Thaw.prototype.insertArray = function (items) {
        var before = this.items.splice(0, this.i);
        var after = this.items;
        this.items = before.concat(items, after);
        if (this.makeReady()) {
            this.tick();
        }
        return this;
    };
    /**
     * Stops this instance of Thaw
     */
    Thaw.prototype.stop = function () {
        this.isStopped = true;
        clearTimeout(this.timeout);
        if (this.options.done) {
            this.options.done();
        }
        return this;
    };
    Thaw.thawing = false;
    Thaw.thaws = [];
    Thaw.defaultSettings = {
        each: null,
        done: null
    };
    return Thaw;
}());
exports.Thaw = Thaw;
/**
 * simple thaw
 */
function thaw(items, options) {
    return new Thaw(items, options);
}
exports.thaw = thaw;
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
            thaw = new Thaw([], this.options);
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
if (typeof window !== 'undefined') {
    // @ts-ignore
    window.Thaw = Thaw;
    // @ts-ignore
    window.thaw = thaw;
    // @ts-ignore
    window.Thaw.Block = Block;
}
