const start = new Date("2026-07-01");
const end = new Date("2026-07-31");
const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
console.log("diffDays =", diffDays);
