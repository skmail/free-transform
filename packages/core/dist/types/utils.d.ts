export declare function call(callback?: (...args: any[]) => void, ...args: any[]): void;
export declare function value<T = boolean>(descriptor: T, ...args: T extends (...args: any[]) => any ? Parameters<T> : any[]): T extends (...args: any[]) => any ? ReturnType<T> : T;
export declare function clamp(number: number, min: number, max: number): number;
export declare const getDistance: (p2: [number, number], p1: [number, number]) => number;
