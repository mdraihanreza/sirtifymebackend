var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserEducationSchema = new Schema({
	user_id: { type: String, default: null },
	ug_institute_name: { type: String, default: null },
	ug_from_year: { type: String, default: null },
	ug_to_year: { type: String, default: null },
	g_institute_name: { type: String, default: null },
	g_from_year: { type: String, default: null },
	g_to_year: { type: String, default: null },
	g_status: { type: String, default: null },
	med_institue_name: { type: String, default: null },
	med_school_from_year: { type: String, default: null },
	med_school_to_year: { type: String, default: null },
	med_status: { type: String, default: null },
	doc: { type: Date, default: Date.now },
	dom: { type: Date, default: null }
});

module.exports = mongoose.model('UserEducation', UserEducationSchema);