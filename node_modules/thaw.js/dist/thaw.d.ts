export interface IEach {
    (item: () => void, i: number): void;
}
export interface IThawOptions {
    delay?: boolean;
    done?: () => void;
    each?: IEach;
}
/**
 * thaw an array of items
 */
export declare class Thaw {
    static thawing: boolean;
    static thaws: Thaw[];
    static defaultSettings: IThawOptions;
    /**
     * returns if Thaw.js is thawing
     */
    static get isThawing(): boolean;
    /**
     * Stops all Thaw instances
     */
    static stopAll(): void;
    items: (() => void)[];
    i: number;
    options: IThawOptions;
    timeout: number;
    tick: any;
    isStopped: boolean;
    constructor(items: (() => void)[], options?: IThawOptions);
    /**
     * readies thaw to continue
     */
    makeReady(): boolean;
    /**
     * Adds an item to the end of this instance of Thaw and readies Thaw to process it
     */
    add(item: any): this;
    /**
     * Inserts an item just after the current item being processed in Thaw and readies Thaw to process it
     */
    insert(item: () => void): this;
    /**
     * Adds an Array to the end of this instance of Thaw and readies Thaw to process it
     */
    addArray(items: (() => void)[]): this;
    /**
     * Inserts an Array just after the current item being processed in Thaw and readies Thaw to process them
     */
    insertArray(items: (() => void)[]): this;
    /**
     * Stops this instance of Thaw
     */
    stop(): this;
}
/**
 * simple thaw
 */
export declare function thaw(items: (() => void)[], options: IThawOptions): Thaw;
