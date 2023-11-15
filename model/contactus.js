var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ContactUsSchema = new Schema({
	name: { type: String, default: null },
	email: { type: String, default: null },
	phone_no: { type: String, default: null },
	comment: { type: String, default: null },
	doc: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactUs', ContactUsSchema);