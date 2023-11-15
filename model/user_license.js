var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserLicenseSchema = new Schema({
	user_id: { type: String, default: null },
	national_license_file: { type: String, default: null },
	national_license_issue_date: { type: String, default: null },
	national_license_expiry_date: { type: String, default: null },
	national_license_status:{ type: String, default: null },
	state_license_file: { type: String, default: null },
	state_license_issue_date: { type: String, default: null },
	state_license_expiry_date: { type: String, default: null },
	state_license_status:{ type: String, default: null },
	cds_license_file: { type: String, default: null },
	cds_license_issue_date: { type: String, default: null },
	cds_license_expiry_date: { type: String, default: null },
	cds_license_status:{ type: String, default: null },
	dea_license_file: { type: String, default: null },
	dea_license_issue_date: { type: String, default: null },
	dea_license_expiry_date: { type: String, default: null },
	dea_license_status:{ type: String, default: null },
	doc: { type: Date, default: Date.now },
	dom: { type: Date, default: null }
});

module.exports = mongoose.model('UserLicense', UserLicenseSchema);