import { loadInput, dayName, Difficulty } from "../utils/readUtils";
import { timedExecute } from "../utils/miscUtils";

let day = dayName(__dirname);
let contents = loadInput(__dirname, Difficulty.HARD);
let lines = contents.split("\n");

console.log(`==== ${day}: PART 1 ====`);
timedExecute(() => {
    let totalJolts = 0;
    for(let bank of lines) {
        let digits = bank.split("").map(Number);
        let max = Math.max(...digits);
        let maxIndex = bank.split("").indexOf(max.toString());
        if (maxIndex === digits.length - 1) {
            max = Math.max(...digits.slice(0, maxIndex));
            maxIndex = bank.split("").indexOf(max.toString());
        }
        let secondMax = Math.max(...digits.slice(maxIndex + 1));
        let jolts = parseInt(`${max}${secondMax}`);
        totalJolts += jolts;
    }
    console.log(`Total jolts: ${totalJolts}`);
});