import { loadInput, dayName, Difficulty } from "../utils/readUtils";
import { timedExecute } from "../utils/miscUtils";

let day = dayName(__dirname);
let contents = loadInput(__dirname, Difficulty.HARD);
let lines = contents.split("\n");
// split each line by 1 or more spaces
let splitLines = lines.map(line => line.split(/\s+/));
// remove empty strings
splitLines = splitLines.map(line => line.filter(item => item !== ""));

// create an array of columns (1st item in each line is column 1, 2nd item is column 2, etc.)
let columns = [];
for (let i = 0; i < splitLines[0].length; i++) {
    let column = [];
    for (let j = 0; j < splitLines.length; j++) {
        if (splitLines[j][i] !== "") {
            column.push(splitLines[j][i]);
        }
    }
    columns.push(column);
}

console.log(`==== ${day}: PART 1 ====`);
timedExecute(() => {
    let total = 0;
    columns.forEach(c => {
        // get and remove the last item in the column
        let op = c.pop();
        if (op === "+") {
            // perform addition on the remaining items in the column
            let sum = c.reduce((acc, val) => acc + Number(val), 0);
            total += sum;
            console.log(sum);
        } else if (op === "*") {
            // perform multiplication on the remaining items in the column
            let product = c.reduce((acc, val) => acc * Number(val), 1);
            total += product;
            console.log(product);
        }
    });
    console.log(`Total: ${total}`);
});