var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserReferenceSchema = new Schema({
	user_id: { type: String, default: null },
	first_reference: { type: String, default: null },
	second_reference: { type: String, default: null },
	third_reference: { type: String, default: null },
	doc: { type: Date, default: Date.now },
	dom: { type: Date, default: null }
});

module.exports = mongoose.model('UserReference', UserReferenceSchema);