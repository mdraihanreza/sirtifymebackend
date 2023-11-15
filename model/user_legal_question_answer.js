var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserLegalQuestionAnswerSchema = new Schema({
	user_id: { type: String, default: null },
	question_id: { type: String, default: null },
	answer: { type: String, default: null },
	explain: { type: String, default: null },
	doc: { type: Date, default: Date.now },
	dom: { type: Date, default: null }
});

module.exports = mongoose.model('UserLegalQuestionAnswer', UserLegalQuestionAnswerSchema);