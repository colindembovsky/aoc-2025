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

console.log(`==== ${day}: PART 2 ====`);
timedExecute(() => {
    const TARGET_LENGTH = 12;
    let totalJolts = BigInt(0);
    
    for (let bank of lines) {
        let digits = bank.split("");
        let result = "";
        let startIndex = 0;
        
        for (let i = 0; i < TARGET_LENGTH; i++) {
            const remainingToFind = TARGET_LENGTH - i - 1;
            const maxStartIndex = digits.length - remainingToFind - 1;
            
            let bestDigit = "";
            let bestIndex = startIndex;
            
            for (let j = startIndex; j <= maxStartIndex; j++) {
                if (digits[j] > bestDigit) {
                    bestDigit = digits[j];
                    bestIndex = j;
                }
            }
            
            result += bestDigit;
            startIndex = bestIndex + 1;
        }
        
        totalJolts += BigInt(result);
    }
    
    console.log(`Total jolts: ${totalJolts}`);
});