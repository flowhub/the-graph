/**
 * This generates ../the-graph/font-awesome-unicode-map.js for use in our SVG
 */

const fs = require('fs');

function generateFile(err, data) {
  if (err) {
    throw err;
  }

  const linePattern = /@fa-var-[^;]*/g;
  const lines = data.match(linePattern);
  const icons = {};
  lines.forEach((line) => {
    const namePattern = /@fa-var-(.*): "\\(.*)"/;
    const match = namePattern.exec(line);
    if (match) {
      const key = match[1];
      let u = `%u${match[2]}`;
      u = unescape(u);
      icons[key] = u;
    }
  });

  const output = `// This file is generated via \`npm run fontawesome\`\nmodule.exports = ${JSON.stringify(icons, null, 2).replace(/"/g, '\'')};`;

  fs.writeFile(`${__dirname}/../the-graph/font-awesome-unicode-map.js`, output, (writeErr) => {
    if (writeErr) {
      throw writeErr;
    }
    console.log(`Font Awesome icons map saved with ${Object.keys(icons).length} icons and aliases.`);
  });
}

fs.readFile(`${__dirname}/../node_modules/font-awesome/less/variables.less`, 'utf8', generateFile);
