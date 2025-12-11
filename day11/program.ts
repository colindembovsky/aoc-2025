import { loadInput, dayName, Difficulty } from "../utils/readUtils";
import { timedExecute } from "../utils/miscUtils";

let day = dayName(__dirname);
let contents = loadInput(__dirname, Difficulty.HARD);
let lines = contents.split("\n");
let instructions = new Map<string, string[]>();
lines.forEach(line => {
    let [key, ...vals] = line.split(": ");
    instructions.set(key, vals[0].split(" "));
});

console.log(`==== ${day}: PART 1 ====`);
timedExecute(() => {
   // find all the paths that lead from "you" to "out"
   // each instruction name is the key, and the values are the possible outputs
   // memoize path counts only
   let memo = new Map<string, number>();
   function countPaths(start: string, end: string, visited: Set<string>): number {
       if (start === end) return 1;
       if (visited.has(start)) return 0;
       if (memo.has(start)) return memo.get(start)!;

       visited.add(start);
       let count = 0;
       let nextSteps = instructions.get(start) || [];
       for (let next of nextSteps) {
           count += countPaths(next, end, visited);
       }
       visited.delete(start);
       memo.set(start, count);
       return count;
   }

   let pathCount = countPaths("you", "out", new Set<string>());
   console.log(`Total paths from 'you' to 'out': ${pathCount}`); 
});

console.log(`==== ${day}: PART 1 ====`);
timedExecute(() => {
//    let input = `svr: aaa bbb
// aaa: fft
// fft: ccc
// bbb: tty
// tty: ccc
// ccc: ddd eee
// ddd: hub
// hub: fff
// eee: dac
// dac: fff
// fff: ggg hhh
// ggg: out
// hhh: out`;
//    lines = input.split("\n");
//    lines.forEach(line => {
//        let [key, ...vals] = line.split(": ");
//        instructions.set(key, vals[0].split(" "));
//    });

    // find all the paths that lead from "svr" to "out" that also visit 'dac' and 'fft' in any order
   // each instruction name is the key, and the values are the possible outputs
   // memoize path counts only

    let memo = new Map<string, number>();
    function countPathsWithConstraints(start: string, end: string, visited: Set<string>, constraints: Set<string>): number {
        if (start === end) {
            return constraints.size === 0 ? 1 : 0;
        }
        if (visited.has(start)) return 0;
        
        // Create a composite memo key that includes both start and remaining constraints
        let constraintKey = Array.from(constraints).sort().join(",");
        let memoKey = `${start}|${constraintKey}`;
        if (memo.has(memoKey)) return memo.get(memoKey)!;
        
        visited.add(start);
        let count = 0;
        let nextSteps = instructions.get(start) || [];
        for (let next of nextSteps) {
            let newConstraints = new Set(constraints);
            if (newConstraints.has(next)) {
                newConstraints.delete(next);
            }
            count += countPathsWithConstraints(next, end, visited, newConstraints);
        }
        visited.delete(start);
        memo.set(memoKey, count);
        return count;
    }

    let constraints = new Set<string>(['dac', 'fft']);
    let pathCount = countPathsWithConstraints("svr", "out", new Set<string>(), constraints);
    console.log(`Total paths from 'svr' to 'out' visiting 'dac' and 'fft': ${pathCount}`);

});