var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LegalQuestionSchema = new Schema({
	question: { type: String, default: null },
	doc: { type: Date, default: Date.now },
	dom: { type: Date, default: null }
});

module.exports = mongoose.model('LegalQuestion', LegalQuestionSchema);