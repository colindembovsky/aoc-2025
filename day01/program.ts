import { loadInput, dayName, Difficulty } from "../utils/readUtils";
import { timedExecute } from "../utils/miscUtils";
import { count } from "console";

let day = dayName(__dirname);
let contents = loadInput(__dirname, Difficulty.HARD);
let lines = contents.split("\n");

console.log(`==== ${day}: PART 1 ====`);
timedExecute(() => {
    let counter = 50;
    let numZeros = 0;

    for (let line of lines) {
        let left = line[0] === "L";
        let num = parseInt(line.slice(1));

        if (left) {
            if (num <= counter) {
                counter -= num;
            } else {
                counter = 100 - (num - counter);
            }
        } else {
            counter += num;
            if (counter > 100) {
                counter -= 100;
            }
        }
        console.log(`Counter: ${counter}`);
        if (counter % 100 === 0) {
            numZeros++;
        }
    }
    console.log(`Number of zeros: ${numZeros}`);
});

console.log(`==== ${day}: PART 2 ====`);
timedExecute(() => {
    let counter = 50;
    let numZeros = 0;

    for (let line of lines) {
        let left = line[0] === "L";
        let num = parseInt(line.slice(1));
        
        if (left) {
            if (counter > 0) {
                if (num >= counter) {
                    numZeros += 1 + Math.floor((num - counter) / 100);
                }
            } else {
                if (num > 100) {
                    numZeros += Math.floor((num - 1) / 100);
                }
            }
            counter = ((counter - num) % 100 + 100) % 100;
        } else {
            if (counter > 0) {
                if (counter + num >= 100) {
                    numZeros += 1 + Math.floor((counter + num - 100) / 100);
                }
            } else {
                if (num >= 100) {
                    numZeros += Math.floor(num / 100);
                }
            }
            counter = (counter + num) % 100;
        }
        console.log(`Counter: ${counter}`);
    }
    console.log(`Password: ${numZeros}`);
});