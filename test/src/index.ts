import { randomUUID } from "crypto";
import SyncRs, { asyncTestFn } from "sync.rs";

// -----------------------------------------------
// -> Test: SyncRs

const test = (str: string) => {
  const sync = new SyncRs();

  const result = sync.runSync(async (tx) => {
    asyncTestFn(tx, str);
  });

  return result;
};

// -----------------------------------------------

/// -> Test runner

console.log("\n\n-----------------------------------------------");
console.log("Running tests...");
console.log("-----------------------------------------------\n\n");

const str = randomUUID();
const time_range = [4500, 5500];

const start = performance.now();
const result = test(str);
const end = performance.now();

const time = end - start;

console.log("\n\n-----------------------------------------------");

console.log("Test: SyncRs");
console.log("Time: " + time + "ms");
console.log("Result:", result);
console.log("Expected:", str);

let passed = result === str && time >= time_range[0] && time <= time_range[1];

console.log("");
if (passed) console.log("> Test passed!");
else console.log("> Test failed!");

console.log("-----------------------------------------------\n\n");

if (!passed) process.exit(1);
