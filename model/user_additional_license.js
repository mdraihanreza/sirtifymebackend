var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserAdditonalLicenseSchema = new Schema({
	user_id: { type: String, default: null },
	license_name: { type: String, default: null },
	license_file: { type: String, default: null },
	license_issue_date: { type: String, default: null },
	license_expiry_date: { type: String, default: null },
	doc: { type: Date, default: Date.now },
	dom: { type: Date, default: null }
});

module.exports = mongoose.model('UserAdditonalLicense', UserAdditonalLicenseSchema);