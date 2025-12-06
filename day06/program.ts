import { loadInput, dayName, Difficulty } from "../utils/readUtils";
import { timedExecute } from "../utils/miscUtils";

let day = dayName(__dirname);
let contents = loadInput(__dirname, Difficulty.HARD);
let lines = contents.split("\n");

console.log(`==== ${day}: PART 1 ====`);
timedExecute(() => {
    let splitLines = lines.map(line => line.split(/\s+/));
    splitLines = splitLines.map(line => line.filter(item => item !== ""));

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

    let total = 0;
    columns.forEach(c => {
        // get and remove the last item in the column
        let op = c.pop();
        if (op === "+") {
            // perform addition on the remaining items in the column
            let sum = c.reduce((acc, val) => acc + Number(val), 0);
            total += sum;
            //console.log(sum);
        } else if (op === "*") {
            // perform multiplication on the remaining items in the column
            let product = c.reduce((acc, val) => acc * Number(val), 1);
            total += product;
            //console.log(product);
        }
    });
    console.log(`Total: ${total}`);
});

console.log(`==== ${day}: PART 2 ====`);
timedExecute(() => {
    let curIndex = lines[0].length - 1;
    let total = 0;
    let vals: number[] = [];
    while (curIndex >= 0) {
        let num = "";
        for (let i = 0; i < lines.length - 1; i++) {
            num += lines[i][curIndex];
        }
        vals.push(Number(num));
        
        let op = lines[lines.length - 1][curIndex].trim();
        if (op === "+" || op === "*") {
            total += op === "*" ? vals.reduce((acc, val) => acc * val, 1) : vals.reduce((acc, val) => acc + val, 0);
            curIndex--;
            vals = [];
        }
        curIndex--;
    }
    console.log(`Total: ${total}`);
});