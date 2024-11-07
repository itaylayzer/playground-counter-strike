import { A_Vertex } from "./A_Vertex";

export type A_Val = boolean | ((vertex: A_Vertex) => boolean);
export type A_Conditions = Record<string, A_Val>;
