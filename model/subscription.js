var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SubscriptionSchema = new Schema({
	subscription_user_id: { type: String, default: null },
	user_type: { type: Number, default: 0 },
	subscription_amount: { type: String, default: null },
	sub_user_type: { type: Number, default: 0 },//1= HR,2=Recruiter
	subscription_status: { type: String, default: null },
	subscription_duration: { type: String, default: null },
	subscription_start_date: { type: Date, default: Date.now },
	subscription_end_date: { type: Date,  default: function() {
      // Calculate the default date value by adding 30 days to the creation date
      const thirtyDaysFromNow = new Date(this.subscription_start_date);
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return thirtyDaysFromNow;
      }
   },
	doc: { type: Date, default: Date.now },
	dom: { type: Date, default: null }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);