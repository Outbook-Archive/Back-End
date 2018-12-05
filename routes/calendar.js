// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE.txt in the project root for license information.
const express = require('express');
const router = express.Router();
const Interviewer = require('../models/interviewer');
const { getAccessToken } = require('../helpers/auth');
const graph = require('@microsoft/microsoft-graph-client');

// Get calendar events
router.get('/calendar/interviewer/:interviewerId', async function(req, res, next) {

  // Get the access token from the database
  const interviewer = await Interviewer.findById(req.params.interviewerId).then((interviewer) => {
    return interviewer
  }).catch((err) => {
    res.status(400).json({ message: err.message })
  });

  const accessToken = interviewer.tokens[0].access_token;
  const userName = interviewer.username;
  // const accessToken = await getAccessToken(req.cookies, res);


  // If accessToken and/or userName is not avaiable, redirect to home
  if (!(accessToken && userName)) {
    res.redirect('/');
    // Use to prevent code below from running
    return next();
  }

  // Initialize Microsoft Graph client
  const client = graph.Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    }
  });

  // How many days into the future you can see calendar events
  const daysIntoFuture = 7
  // Number of calendar events to return
  const numberOfEvents = 10
  // Query specific subjects
  const subject =  "Appointment"

  // Set start of the calendar view to today at midnight
  const start = new Date(new Date().setHours(0,0,0));
  // Set end of the calendar view to [daysIntoFuture] days from start
  const end = new Date(new Date(start).setDate(start.getDate() + daysIntoFuture));

  let params = { user: userName };

  try {
    // Get the first [numberOfEvents] events for the coming week
    const result = await client
      .api(`/me/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`)
      .filter(`startswith(Subject, '${subject}')`)
      .top(numberOfEvents)
      .select('subject,start,end,attendees')
      .orderby('start/dateTime ASC')
      .get();

    params.events = result.value;

    res.json(params)
  } catch (err) {
    params.message = 'Error retrieving events';
    params.error = { status: `${err.code}: ${err.message}` };
    params.debug = JSON.stringify(err.body, null, 2);
    res.json(params);
  }
});


router.post('/calendar/interviewer/:interviewerId', (req, res) => {
  // Dirty test code starts here
  // const event = {
  //   subject: "Appointment Made",
  //     start: {
  //       dateTime: "2018-11-12T18:30:00.0000000",
  //       timeZone: "UTC"
  //     },
  //     end: {
  //       dateTime: "2018-11-12T19:00:00.0000000",
  //       timeZone: "UTC"
  //     },
  //     attendees: [
  //       {
  //         "EmailAddress": {
  //           "Address": "iamansel@gmail.com",
  //           "Name": "Ansel Bridgewater"
  //         },
  //         "Type": "Required"
  //       }
  //     ]
  //   }
  //
  //   const testAdd = await client
  //     .api("/me/events")
  //     .post(event);
  // Dirty test code ends here
})



module.exports = router;
