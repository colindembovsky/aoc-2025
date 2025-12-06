import { loadInput, dayName, Difficulty } from "../utils/readUtils";
import { timedExecute } from "../utils/miscUtils";

let day = dayName(__dirname);
let contents = loadInput(__dirname, Difficulty.HARD);
let ranges = contents.split(",").map((r) => r.split("-").map(Number));

console.log(`==== ${day}: PART 1 ====`);
timedExecute(() => {
    let sum = 0;
    for (let r in ranges) {
        let [min, max] = ranges[r];
        console.log(`Range ${r}: ${min} to ${max}`);
        for (let i = min; i <= max; i++) {
            let numStr = i.toString();
            let mid = Math.floor(numStr.length / 2);
            if (numStr.slice(0, mid) === numStr.slice(mid)) {
                sum += i;
                //console.log(`Number ${i} is a palindrome`);
            }
        }
    }
    console.log(`Sum of palindromes: ${sum}`);
});

console.log(`==== ${day}: PART 1 ====`);
timedExecute(() => {
    let sum = 0;
    for (let r in ranges) {
        let [min, max] = ranges[r];
        console.log(`Range ${r}: ${min} to ${max}`);
        for (let i = min; i <= max; i++) {
            let numStr = i.toString();
            let isInvalid = false;
            for (let seqLen = 1; seqLen <= numStr.length / 2; seqLen++) {
                if (numStr.length % seqLen === 0) {
                    let seq = numStr.slice(0, seqLen);
                    let repeated = seq.repeat(numStr.length / seqLen);
                    if (repeated === numStr) {
                        isInvalid = true;
                        break;
                    }
                }
            }
            if (isInvalid) {
                sum += i;
                //console.log(`Number ${i} has a repeated sequence of digits`);
            }
        }
    }
    console.log(`Sum of numbers with repeated digits: ${sum}`);
});