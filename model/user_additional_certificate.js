var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserAdditonalCertificateSchema = new Schema({
	user_id: { type: String, default: null },
	certificate_name: { type: String, default: null },
	certificate_file: { type: String, default: null },
	certificate_issue_date: { type: String, default: null },
	certificate_expiry_date: { type: String, default: null },
	doc: { type: Date, default: Date.now },
	dom: { type: Date, default: null }
});

module.exports = mongoose.model('UserAdditonalCertificate', UserAdditonalCertificateSchema);