var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserMedicalHistorySchema = new Schema({
	user_id: { type: String, default: null },
	covid_certificate: { type: String, default: null },
	covid_date_1: { type: String, default: null },
	covid_date_2: { type: String, default: null },
	covid_date_3: { type: String, default: null },
	covid_date_4: { type: String, default: null },
	flu_certificate: { type: String, default: null },
	flu_date: { type: String, default: null },
	tetanus: { type: String, default: null },
	tetanus_date: { type: String, default: null },
	mmr_vaccine: { type: String, default: null },
	mmr_immune: { type: String, default: null }, //yes or no option
	hepatitis_vaccine: { type: String, default: null },
	hepatitis_immune: { type: String, default: null }, //yes or no option
	covid_date_2_status: { type: String, default: null },
	covid_date_3_status: { type: String, default: null },
	covid_date_4_status: { type: String, default: null },
	doc: { type: Date, default: Date.now },
	dom: { type: Date, default: null }
});

module.exports = mongoose.model('UserMedicalHistory', UserMedicalHistorySchema);