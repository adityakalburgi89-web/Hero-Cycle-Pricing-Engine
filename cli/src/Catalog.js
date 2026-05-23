const fs = require('fs');
const path = require('path');
const Part = require('./Part');

class Catalog {
  constructor() {
    this.parts = [];
  }

  /**
   * Loads the catalog parts from a JSON file.
   * @param {string} [filePath] Optional path to a JSON file. Defaults to cli/catalog.json.
   */
  load(filePath) {
    const targetPath = filePath || path.join(__dirname, '../catalog.json');
    const rawData = fs.readFileSync(targetPath, 'utf8');
    const parsedData = JSON.parse(rawData);

    this.parts = parsedData.map(partData => new Part(partData));
  }

  /**
   * Finds a part in the catalog by its name.
   * @param {string} name The unique name of the part.
   * @returns {Part|null} The matched Part, or null if not found.
   */
  getPart(name) {
    return this.parts.find(part => part.name === name) || null;
  }
}

module.exports = Catalog;
