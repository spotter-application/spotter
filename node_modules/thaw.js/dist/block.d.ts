import { Thaw, IThawOptions } from './thaw';
export declare class Block {
    index: number;
    thaws: Thaw[];
    count: number;
    options: IThawOptions;
    constructor(options?: IThawOptions, count?: number);
    /**
     * add an item to the end of items
     */
    add(item: () => void): this;
    /**
     * add an Array to the end of items
     */
    addArray(items: (() => void)[]): this;
    /**
     * insert an item into items @ current position
     */
    insert(item: () => void): this;
    /**
     * insert and array into items @ current position
     */
    insertArray(items: any): this;
    /**
     * Stops all thaws in this block
     */
    stop(): this;
    /**
     * Get next available in block
     */
    next(): Thaw | null;
}
