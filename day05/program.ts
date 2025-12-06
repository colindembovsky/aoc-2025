import { loadInput, dayName, Difficulty } from "../utils/readUtils";
import { timedExecute } from "../utils/miscUtils";

let day = dayName(__dirname);
let contents = loadInput(__dirname, Difficulty.HARD);
let lines = contents.split("\n");

// Split into ranges (before empty line) and ids (after empty line)
let emptyLineIndex = lines.findIndex(line => line === "");
let rangeLines = lines.slice(0, emptyLineIndex);
let idLines = lines.slice(emptyLineIndex + 1);

// Parse ranges into {min, max} objects
let ranges = rangeLines.map(line => {
    let [min, max] = line.split("-").map(Number);
    return { min, max };
});

// Parse ids as numbers
let ids = idLines.map(Number);

console.log(`==== ${day}: PART 1 ====`);
timedExecute(() => {
    // find the fresh ingredients: ids that are within any range
    let freshIngredients = ids.filter(id => {
        return ranges.some(range => id >= range.min && id <= range.max);
    });
    console.log(`Number of fresh ingredients: ${freshIngredients.length}`);
});

console.log(`==== ${day}: PART 2 ====`);
timedExecute(() => {
    let sortedRanges = [...ranges].sort((a, b) => a.min - b.min);
    
    let mergedRanges: { min: number; max: number }[] = [];
    for (let range of sortedRanges) {
        if (mergedRanges.length === 0) {
            mergedRanges.push({ ...range });
        } else {
            let last = mergedRanges[mergedRanges.length - 1];
            if (last.max >= range.min - 1) {
                last.max = Math.max(last.max, range.max);
            } else {
                mergedRanges.push({ ...range });
            }
        }
    }
    
    let totalUnique = mergedRanges.reduce((sum, range) => sum + (range.max - range.min + 1), 0);
    console.log(`Total unique numbers within any range: ${totalUnique}`);
});