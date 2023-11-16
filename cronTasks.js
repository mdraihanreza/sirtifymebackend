var cron = require('node-cron');
const moment = require('moment');
const subscription = require('./model/subscription');
const cron_logs = require('./model/cron_logs');
const mail = require("./mailconfig");
const user = require('./model/user');


const subscriptionEmailSendTask = cron.schedule('0 */2 * * * * ', async () => {
    // console.log('running a task every minute');

    // ======== fetch subscription details =========== //
    var subscription_data = await subscription.find({ "sub_user_type": "0" }).exec();

    if (subscription_data) {

        for (var item of subscription_data) {

            // subscription end date
            const subscription_end_date = item.subscription_end_date;

            // Get the current date
            const currentDate = moment();

            // Convert the timestamp to a moment object
            const targetDate = moment(subscription_end_date);

            // Calculate the difference in days
            const remainingDays = targetDate.diff(currentDate, 'days');

            console.log(`Remaining days: ${remainingDays} days`);

            if (remainingDays == 3) {

                console.log("cron start");

                // ============= cron_logs check email send or not ======= //
                var cron_data = await cron_logs.find({
                    "user_id": item.subscription_user_id,
                    "email_send_status": "1",
                    "doc": moment().format("DD-MM-YY")
                }).exec();

                console.log("cron_logs ");
                console.log(cron_data);

                if (cron_data.length === 0) {

                    var userData = await user.findOne({ '_id': item.subscription_user_id }).exec();

                    let mailDetails = {
                        from: "jagan@elvirainfotech.com",
                        to: userData.email,
                        subject: "Subscription Expired Reminder",
                        html: `<table><tr><td>Your Subscription will Expired within 3 days.</td></tr></table>`,
                    };

                    mail.sendMail(mailDetails, function (error, info) {
                        if (error) {
                            console.error(error);
                        } else {

                            const cornData = new cron_logs({
                                user_id: item.subscription_user_id,
                                email_send_status: "1",
                            });

                            cornData.save();

                            console.log("Email sent: " + userData.email);
                        }
                    });
                }


            }

        }

    }


});

module.exports = { subscriptionEmailSendTask };