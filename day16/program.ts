import { loadInput, dayName, Difficulty } from "../utils/readUtils";
import { timedExecute } from "../utils/miscUtils";

let day = dayName(__dirname);
let contents = loadInput(__dirname, Difficulty.EASY);
let lines = contents.split("\n");

console.log(`==== ${day}: PART 1 ====`);
timedExecute(() => {
    
});