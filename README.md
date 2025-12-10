# A Repo for Advent of Code 2025 in TypeScript

## Structure

Each day has a folder (`day01`, `day02` etc.) with at least 3 files:
  - `easy-input.txt` for the sample data
  - `input.txt` for the real data
  - `program.ts` for the code

## Run the day

Edit `program.ts` for the day, pasting in the sample and real data. Then simply run:
`DAY=x yarn run go` to execute the solution for day x.

## Setup for a new year

- Edit the files in `day00` which is the template
- remove the old days from previous year (if any)
- run the `setup.sh` script (changing the day range if needed) to setup the year

## Debugging

Set a breakpoint in the `program.ts` file for the day you're working on and fire up the VSCode debugger with the profile `Debug Program`.