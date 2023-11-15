var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConnectionSchema = new Schema({
	provider_id: { type: String, default: null }, //1=physican assistant,2=nurse,3=physican
	non_provider_id: { type: String, default: null }, //4=Private Recruiters,5=Hospitals,6=Third Party
	doc: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Connection', ConnectionSchema);