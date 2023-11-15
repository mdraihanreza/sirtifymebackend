var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
	transaction_user_id: { type: String, default: null },
	user_type: { type: Number, default: 0 },
	transaction_amount: { type: String, default: null },
	sub_user_type: { type: Number, default: 0 },//1= HR,2=Recruiter
	transaction_status: { type: String, default: null },
	transaction_details: { type: String, default: null },
	transaction_date: { type: Date, default: Date.now },
	doc: { type: Date, default: Date.now },
	dom: { type: Date, default: null }
});

module.exports = mongoose.model('Transaction', TransactionSchema);