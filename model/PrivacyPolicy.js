var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PrivacyPolicySchema = new Schema({
	slug: { type: String, default: null },
	content: { type: String, default: null },
	doc: { type: Date, default: Date.now },
	dom: { type: Date, default: null }
});

module.exports = mongoose.model('PrivacyPolicyData', PrivacyPolicySchema);