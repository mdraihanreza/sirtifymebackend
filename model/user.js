var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	user_type: { type: Number, default: 0 }, //1=physican assistant,2=nurse,3=physican,4=Private Recruiters,5=Hospitals,6=Third Party
	parent_id: { type: String, default: null },
	sub_user_type: { type: Number, default: 0 },//1= HR,2=Recruiter
	name: { type: String, default: null },
	email: { type: String, default: null },
	country_code: { type: String, default: null },
	only_mobile_no: { type: String, default: null },
	mobile_no: { type: String, default: null },
	password: { type: String, default: null },
	otp: { type: String, default: null },
	social_id: { type: String, default: null },
	registered_from: { type: Number, default: 1 }, //1=email, 2=Google, 3=Facebook
	status: { type: Number, default: 1 },
	added_by: { type: String, default: null },
	profile_picture: { type: String, default: null },
	cv: { type: String, default: null },
	doc: { type: Date, default: Date.now },
	dom: { type: Date, default: null }
});

module.exports = mongoose.model('User', UserSchema);