var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CronlogsSchema = new Schema({
	user_id: { type: String, default: null },
	email_send_status: { type: String, default: null },
	doc: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cronlogs', CronlogsSchema);