import { loadInput, dayName, Difficulty } from "../utils/readUtils";
import { timedExecute } from "../utils/miscUtils";

let day = dayName(__dirname);
let contents = loadInput(__dirname, Difficulty.HARD);
let lines = contents.split("\n");

let points: { x: number, y: number }[] = [];
for (let line of lines) {
    let [x, y] = line.split(",").map(Number);
    points.push({ x, y });
}

function area(pointA: { x: number, y: number }, pointB: { x: number, y: number }) {
    return (Math.abs(pointA.x - pointB.x) + 1) * (Math.abs(pointA.y - pointB.y) + 1);
}

console.log(`==== ${day}: PART 1 ====`);
timedExecute(() => {
    let maxArea = 0;
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const currentArea = area(points[i], points[j]);
            if (currentArea > maxArea) {
                maxArea = currentArea;
            }
        }
    }

    console.log(`The maximum area is ${maxArea}`);
});

console.log(`==== ${day}: PART 2 ====`);
timedExecute(() => {

});