var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConnectionRequestSchema = new Schema({
	provider_id: { type: String, default: null }, //1=physican assistant,2=nurse,3=physican
	non_provider_id: { type: String, default: null }, //4=Private Recruiters,5=Hospitals,6=Third Party
	connection_status: { type: Number, default: 0 }, // 0=No action, 1=Accepted, 2=Rejected
	doc: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ConnectionRequest', ConnectionRequestSchema);