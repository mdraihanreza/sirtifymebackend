var cron = require('node-cron');
const moment = require('moment');
const subscription = require('./model/subscription');


const subscriptionEmailSendTask=cron.schedule('0 */5 * * * * ', async() => {
    // console.log('running a task every minute');

    // ======== fetch subscription details =========== //
    var subscription_data = await subscription.find().exec();


    // subscription end date
    const subscription_end_date = "2023-11-20T05:55:43.633+00:00"; 

    // Get the current date
    const currentDate = moment();

    // Convert the timestamp to a moment object
    const targetDate = moment(subscription_end_date);

    // Calculate the difference in days
    const remainingDays = targetDate.diff(currentDate, 'days');

    console.log(`Remaining days: ${remainingDays} days`);

    if(remainingDays===3){
        // ============= cron_logs check email send or not ======= //
        console.log(`Email send`);
    }

});

module.exports={subscriptionEmailSendTask};