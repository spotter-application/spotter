"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = exports.thaw = exports.Thaw = void 0;
var thaw_1 = require("./thaw");
Object.defineProperty(exports, "Thaw", { enumerable: true, get: function () { return thaw_1.Thaw; } });
Object.defineProperty(exports, "thaw", { enumerable: true, get: function () { return thaw_1.thaw; } });
var block_1 = require("./block");
Object.defineProperty(exports, "Block", { enumerable: true, get: function () { return block_1.Block; } });
if (typeof window !== 'undefined') {
    // @ts-ignore
    window.Thaw = thaw_1.Thaw;
    // @ts-ignore
    window.thaw = thaw_1.thaw;
    // @ts-ignore
    window.Thaw.Block = block_1.Block;
}
//# sourceMappingURL=index.js.map