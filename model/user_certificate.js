var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserCertificateSchema = new Schema({
	user_id: { type: String, default: null },
	bls_file: { type: String, default: null },
	bls_issue_date: { type: String, default: null },
	bls_expiry_date: { type: String, default: null },
	bls_status: { type: String, default: null },
	acls_file: { type: String, default: null },
	acls_issue_date: { type: String, default: null },
	acls_expiry_date: { type: String, default: null },
	acls_status: { type: String, default: null },
	pls_file: { type: String, default: null },
	pls_issue_date: { type: String, default: null },
	pls_expiry_date: { type: String, default: null },
	pls_status: { type: String, default: null },
	doc: { type: Date, default: Date.now },
	dom: { type: Date, default: null }
});

module.exports = mongoose.model('UserCertificate', UserCertificateSchema);