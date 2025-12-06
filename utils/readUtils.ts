import * as fs from "fs";

// define an enum with values EASY and HARD
export enum Difficulty {
    EASY,
    HARD
}

// read in a file and print it out to the console
export function readFile(fileName: string): string {
    return fs.readFileSync(fileName, "utf8");
}

export function dayName(dayDistDir: string) {
    return dayDistDir.split("/").pop();
}

export function loadInput(dayDistDir: string, difficulty: Difficulty) {
    let fileName = difficulty === Difficulty.EASY ? "easy-input.txt" : "input.txt";
    return readFile(`${dayName(dayDistDir)}/${fileName}`);
}