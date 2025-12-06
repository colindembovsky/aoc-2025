import { loadInput, dayName, Difficulty } from "../utils/readUtils";
import { timedExecute } from "../utils/miscUtils";
import { CharMap } from "../utils/mapUtils";

let day = dayName(__dirname);
let contents = loadInput(__dirname, Difficulty.HARD);
let lines = contents.split("\n");
let map = new CharMap(lines);

console.log(`==== ${day}: PART 1 ====`);
timedExecute(() => {
    let atPositions = map.getAllPositionsWithValue('@');
    
    let result = atPositions.filter(pos => {
        let neighbors = pos.getNeighborsIncludingDiagonal(0, map.height, 0, map.width);
        let adjacentAtCount = neighbors.filter(n => map.get(n) === '@').length;
        return adjacentAtCount < 4;
    });
    
    console.log(`Found ${result.length} positions with @ that have fewer than 4 adjacent @`);
});

console.log(`==== ${day}: PART 2 ====`);
timedExecute(() => {
    let atPositions = map.getAllPositionsWithValue('@');
    
    let result = atPositions.filter(pos => {
        let neighbors = pos.getNeighborsIncludingDiagonal(0, map.height, 0, map.width);
        let adjacentAtCount = neighbors.filter(n => map.get(n) === '@').length;
        return adjacentAtCount < 4;
    });
    
    console.log(`Found ${result.length} positions with @ that have fewer than 4 adjacent @`);
});