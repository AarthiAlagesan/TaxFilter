const mongoose = require('mongoose');

const taxDetailSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  salary: Number,
  houseProperty: Number,
  otherSources: Number,
  totalIncome: Number,
  taxPayable: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TaxDetail', taxDetailSchema);
