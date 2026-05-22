class Part {
  constructor({ id, name, category, basePrice, material, region }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.basePrice = basePrice;
    this.material = material;
    this.region = region;
  }
}

module.exports = Part;
