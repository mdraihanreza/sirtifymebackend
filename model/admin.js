var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AdminSchema = new Schema({
	name: { type: String, default: null },
	user_name: { type: String, default: null },
	email: { type: String, default: null },
	password: { type: String, default: null },
	status: { type: Number, default: 1 },
	doc: { type: Date, default: Date.now },
	dom: { type: Date, default: null }
});

module.exports = mongoose.model('Admin', AdminSchema);