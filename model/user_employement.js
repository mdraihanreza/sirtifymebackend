var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserEmployementSchema = new Schema({
	user_id: { type: String, default: null },
	job_name: { type: String, default: null },
	c_job_from_year: { type: String, default: null },
	c_job_name: { type: String, default: null },
	employment_start_date: { type: String, default: null },
	employment_end_date: { type: String, default: null },
	doc: { type: Date, default: Date.now },
	dom: { type: Date, default: null }
});

module.exports = mongoose.model('UserEmployement', UserEmployementSchema);