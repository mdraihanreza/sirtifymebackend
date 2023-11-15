var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FAQSchema = new Schema({
	question: { type: String, default: null },
	answer: { type: String, default: null },
	doc: { type: Date, default: Date.now },
	dom: { type: Date, default: null }
});

module.exports = mongoose.model('FAQ', FAQSchema);