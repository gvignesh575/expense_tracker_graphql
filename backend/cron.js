import cron from "cron";

import https from "https";

const URL = "https://expense-tracker-graphql-o8iz.onrender.com/";

const job = new cron.CronJob("*/14 * * * *", function () {
  https
    .get(URL, (res) => {
      if (res.statusCode === 200) {
        console.log("GET request send successfully");
      } else {
        console.log("GET request failed", res.statusCode);
      }
    })
    .on("error", (e) => {
      console.error("Error while sendign request", e);
    });
});

export default job;

// CRON JOB EXPLANATION:
// Cron Jobs are scheduled tasks that run periodically at fixed intervals or specific times

// send 1 GET request for every 14 minutes

// Schedule:

// You define a schedule using a cron expression, which consists of five fields representing

// MINUTE, HOUR, DAY OF THE MONTH, MONTH, DAY OF THE WEEK

// =>  14 * * * * - Every 14 Minutes
// =>  0 0 * * 0 - At Midnight on every sunday
// =>  30 3 15 * * - At 3:30 AM, on the 15th of every month
// =>  0 0 1 1 * - At Midnight, on January 1st
// =>  0 * * * * - Every Hour
