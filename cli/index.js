const fs = require('fs');
const path = require('path');
const Catalog = require('./src/Catalog');
const PricingEngine = require('./src/PricingEngine');

function printUsage() {
  console.log(`
Hero Cycle CLI Pricing Engine
=============================
Usage:
  1. Via JSON Configuration File:
     node cli/index.js <path-to-json-file>

     Example:
     node cli/index.js cli/example_input.json

  2. Via Command Line Arguments:
     node cli/index.js --date <YYYY-MM-DD> --parts <comma-separated-parts>

     Example:
     node cli/index.js --date 2016-12-15 --parts steel_frame,standard_handlebar,v_brakes,basic_saddle,tubeless_tyre,standard_rim,tube,spokes,4_gear_assembly
`);
}

function formatDate(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatCurrency(val) {
  // Use Indian localization format (en-IN) for rupee currency rendering
  return '₹' + Number(val).toLocaleString('en-IN');
}

function parseCliArgs(args) {
  const result = {
    date: null,
    parts: null,
    filePath: null
  };

  if (args.length === 1 && !args[0].startsWith('--')) {
    result.filePath = args[0];
    return result;
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--date' && i + 1 < args.length) {
      result.date = args[i + 1];
      i++;
    } else if (args[i] === '--parts' && i + 1 < args.length) {
      result.parts = args[i + 1].split(',').map(p => p.trim());
      i++;
    }
  }

  return result;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const parsed = parseCliArgs(args);

  let pricingDate = null;
  let partNames = [];

  if (parsed.filePath) {
    // Read from JSON file
    try {
      const fullPath = path.resolve(parsed.filePath);
      if (!fs.existsSync(fullPath)) {
        console.error(`Error: File not found at path: ${parsed.filePath}`);
        process.exit(1);
      }
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      const inputData = JSON.parse(fileContent);

      if (!inputData.parts || !Array.isArray(inputData.parts)) {
        console.error('Error: Invalid JSON input format. "parts" must be an array.');
        process.exit(1);
      }

      pricingDate = inputData.date ? new Date(inputData.date) : new Date();
      partNames = inputData.parts;
    } catch (err) {
      console.error(`Error reading or parsing JSON file: ${err.message}`);
      process.exit(1);
    }
  } else if (parsed.parts) {
    pricingDate = parsed.date ? new Date(parsed.date) : new Date();
    partNames = parsed.parts;
  } else {
    console.error('Error: Insufficient arguments. Provide either a config file or --parts option.');
    printUsage();
    process.exit(1);
  }

  // Load catalog
  const catalog = new Catalog();
  try {
    catalog.load();
  } catch (err) {
    console.error(`Error loading part catalog: ${err.message}`);
    process.exit(1);
  }

  // Initialize engine and calculate
  const engine = new PricingEngine(catalog);
  const report = engine.calculate({ date: pricingDate, partNames });

  // Render output
  const formattedDate = formatDate(report.date);
  console.log(`Cycle Price Breakdown — ${formattedDate}`);
  console.log('------------------------------------');

  // Print high-level component lines in logical order
  // Frame, Handle Bar/Brakes, Seating, Wheels, Chain Assembly
  const orderedComponents = ['Frame', 'Handle Bar/Brakes', 'Seating', 'Wheels', 'Chain Assembly'];

  orderedComponents.forEach(comp => {
    const compData = report.breakdown[comp] || { total: 0, parts: [] };
    let note = '';

    // Special note for wheels component if tubeless tyre pricing is dynamically loaded
    if (comp === 'Wheels') {
      const tubelessTyre = compData.parts.find(p => p.name === 'tubeless_tyre');
      if (tubelessTyre && tubelessTyre.priceEntry) {
        const fromDate = tubelessTyre.priceEntry.validFrom;
        const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthStr = shortMonths[fromDate.getMonth()];
        const yearStr = fromDate.getFullYear();
        note = ` ← tubeless tyre priced at ${monthStr} ${yearStr} rate`;
      }
    }

    console.log(`${comp.padEnd(18)} : ${formatCurrency(compData.total)}${note}`);
  });

  console.log('------------------------------------');
  console.log(`TOTAL              : ${formatCurrency(report.total)}`);
}

if (require.main === module) {
  main();
}
