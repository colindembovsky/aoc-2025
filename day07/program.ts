import { loadInput, dayName, Difficulty } from "../utils/readUtils";
import { timedExecute } from "../utils/miscUtils";
import { CharMap, Direction } from "../utils/mapUtils";

let day = dayName(__dirname);
let contents = loadInput(__dirname, Difficulty.HARD);
let lines = contents.split("\n");
let map = new CharMap(lines);

console.log(`==== ${day}: PART 1 ====`);
timedExecute(() => {
    let start = map.getAllPositionsWithValue("S")[0];
    let beams = [start.move(Direction.down)];
    let seen = new Set<string>();
    seen.add(beams[0].toString());
    let splits = 0;
    while (beams.length > 0) {
        let beam = beams.pop()!;
        let nextDown = beam.down();
        if (nextDown.row < map.height) {
            let nextDownValue = map.get(nextDown);
            if (nextDownValue == ".") {
                if (!seen.has(nextDown.toString())) {
                    seen.add(nextDown.toString());
                    beams.push(nextDown);
                }
            } else if (nextDownValue == "^") {
                splits++;
                let left = nextDown.left();
                if (left.col >= 0 && !seen.has(left.toString())) {
                    seen.add(left.toString());
                    beams.push(left);
                }
                let right = nextDown.right();
                if (right.col < map.width && !seen.has(right.toString())) {
                    seen.add(right.toString());
                    beams.push(right);
                }
            }
        }
    }
    console.log(`Number of splits: ${splits}`);
});