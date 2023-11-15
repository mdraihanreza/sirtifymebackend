var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserAdditionalEducationSchema = new Schema({
	user_id: { type: String, default: null },
	education_name: { type: String, default: null },
	edu_name: { type: String, default: null },
	from_year: { type: String, default: null },
	to_year: { type: String, default: null },
	doc: { type: Date, default: Date.now },
	dom: { type: Date, default: null }
});

module.exports = mongoose.model('UserAdditionalEducation', UserAdditionalEducationSchema);