import { A_Vertex } from "./A_Vertex";
import { A_Conditions, A_Val } from "./types";

export class A_Edge {
    constructor(public from: A_Vertex, public to: number, public key: string) {}
    public travarseable(values: A_Conditions) {
        const val: A_Val | undefined = values[this.key];
        if (val === undefined) return false;
        if (typeof val === "boolean") return val;
        return val(this.from);
    }
}
