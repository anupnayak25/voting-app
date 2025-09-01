const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  singletonKey: { type: String, unique: true, default: 'singleton' },
  registrationDueDate: { type: Date },
  votingStart: { type: Date },
  votingEnd: { type: Date }
}, { timestamps: true });

settingsSchema.statics.getSettings = async function() {
  let doc = await this.findOne({ singletonKey: 'singleton' });
  if (!doc) doc = await this.create({});
  return doc;
}

module.exports = mongoose.model('Settings', settingsSchema);