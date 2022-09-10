import { Event, Point, TranslateUpdatePayload } from "./types";
interface TransalateProps {
    x: number;
    y: number;
    start: Point;
}
export declare function translate({ x, y, start }: TransalateProps, onUpdate: (data: TranslateUpdatePayload) => void): (event: Event) => void;
export {};
