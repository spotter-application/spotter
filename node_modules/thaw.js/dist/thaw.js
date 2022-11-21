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
exports.thaw = exports.Thaw = void 0;
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
//# sourceMappingURL=thaw.js.map