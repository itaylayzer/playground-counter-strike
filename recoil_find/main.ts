import * as fs from "fs";

const a = fs.readFileSync(".txt");

const d = a.toString().split("),");
const b = d.map((a) =>
	a
		.replace("(", "")
		.replace(")", "")
		.split(",")
		.map((v) => parseInt(v.trim()))
);
console.log(b);
