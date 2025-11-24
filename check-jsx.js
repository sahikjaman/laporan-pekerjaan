const fs = require('fs');

const content = fs.readFileSync('src/App.jsx', 'utf8');
const lines = content.split('\n');

let openDivs = 0;
let unbalancedLines = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Count opening <div
    const openMatches = line.match(/\<div[\s>]/g);
    if (openMatches) {
        openDivs += openMatches.length;
    }

    // Count closing </div>
    const closeMatches = line.match(/\<\/div\>/g);
    if (closeMatches) {
        openDivs -= closeMatches.length;
    }

    // Track if unbalanced at this line
    if (openDivs < 0) {
        unbalancedLines.push({ line: lineNum, balance: openDivs, content: line.trim() });
    }
}

console.log(`Final div balance: ${openDivs}`);
console.log(`\nLines with negative balance:`);
unbalancedLines.forEach(item => {
    console.log(`Line ${item.line} (balance: ${item.balance}): ${item.content.substring(0, 80)}`);
});

if (openDivs !== 0) {
    console.log(`\nERROR: There are ${openDivs > 0 ? 'unclosed' : 'extra closing'} div tags!`);
}
