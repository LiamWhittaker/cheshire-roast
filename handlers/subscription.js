// ==================================
// Every day at 00:01 we need to check if there is a new subscription due to be processed
// ==================================
const CronJob = require('cron').CronJob;
const mongoose = require('mongoose');
const Subscription = mongoose.model("Subscription");
const sub = require('../controllers/subscriptionController');


// sec, min, hr, day, month, day of week
// 1min, 00hrs, everyday, every month, every day of week
const checkSubscriptions = new CronJob('1 0 * * *', function() {
	const d = new Date();
	console.log('Every second:', d);
});

//every minute
const test = new CronJob('* * * * *', async function() {

  const todaysSubscriptions = await sub.getTodaysSubscriptions();

  if(todaysSubscriptions < 1) {
    console.log('No subscriptions found for today.');
    return;
  }

  sub.processSubscriptions(todaysSubscriptions);

  console.log('SUBS PROCESSED')
});

checkSubscriptions.start();
test.start();

