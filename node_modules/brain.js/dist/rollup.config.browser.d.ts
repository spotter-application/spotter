declare namespace _default {
    const input: string;
    const external: string[];
    const plugins: import("rollup").Plugin[];
    const output: {
        file: string;
        format: string;
        sourcemap: boolean;
        globals: {
            'gpu.js': string;
        };
        name: string;
    }[];
}
export default _default;
//# sourceMappingURL=rollup.config.browser.d.ts.map