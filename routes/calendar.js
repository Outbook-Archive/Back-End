const express = require('express');
const router = express.Router();
const Interviewer = require('../models/interviewer');
const Candidate = require('../models/candidate');
const { getAccessToken } = require('../helpers/auth');
const graph = require('@microsoft/microsoft-graph-client');
const moment = require('moment');

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

  // How many days into the future you can start to see calendar events
  const startDaysIntoFuture = 7
  // How many days into the future from [startDaysIntoFuture] you can see calendar events
  const endDaysIntoFuture = 21
  // Number of calendar events to return
  const numberOfEvents = 100
  // Query specific subjects
  const subject =  "Appointment"

  // Set start of the calendar view to [startDaysIntoFuture] days from today at midnight
  const start = new Date(new Date().setHours(0,0,0));
  start.setDate(start.getDate() + startDaysIntoFuture)
  // Set end of the calendar view to [daysIntoFuture] days from start
  const end = new Date(new Date(start).setDate(start.getDate() + endDaysIntoFuture));

  let params = { user: userName };

  try {
    // Get the first [numberOfEvents] events for the coming week
    const result = await client
      .api(`/me/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`)
      .header("Prefer", 'outlook.timezone="Pacific Standard Time"')
      .filter(`contains(Subject, '${subject}')`)
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

router.post('/calendar/interviewer/:interviewerId', async function(req, res, next) {
  // Remove any formatting from phone number before user is created
  number = req.body.phoneNumber.replace(/\D/g,'');

  // Create new user
  const newCandidate = new Candidate({
    fullName: req.body.fullName,
    email: req.body.email,
    phoneNumber: number,
    startDateTime: req.body.startDateTime,
    eventId: req.body.eventId
  })
  console.log(newCandidate);
  console.log(req.body);

  newCandidate
    .save()
    .then((candidate) => {
      console.log('Successfully saved this user:', candidate.fullName);
    })
    .catch((err) => {
      res.status(400).send({ message: err.message })
    })

  // Get the access token from the database
  const interviewer = await Interviewer
    .findById(req.params.interviewerId)
    .then((interviewer) => {
      return interviewer
    }).catch((err) => {
      res.status(400).json({ message: err.message })
    });

  const accessToken = interviewer.tokens[0].access_token;

  // Initialize Microsoft Graph client
  const client = graph.Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    }
  });

  // Find calendar event and save to calendar
  let params = {}
  try {
    const update = {
      "Subject": `Interview with ${req.body.fullName}`,
      "Attendees": [
        {
          "EmailAddress": {
            "Address": `${req.body.email}`,
            "Name": `${req.body.fullName}`
          },
          "Type": "Required"
        }
      ]
    }

    const result = await client
      .api(`/me/events/${req.body.eventId}`)
      .patch(update)

    // res.status(200).send('<script>window.close();</script>')
    res.redirect(`${process.env.CROSS_ORIGIN}/success`)
  } catch (err) {
    params.message = 'Error updating event';
    params.error = { status: `${err.code}: ${err.message}` };
    params.debug = JSON.stringify(err.body, null, 2);
    // res.json(params);
    res.redirect(`${process.env.CROSS_ORIGIN}/failure`)
  }
});

module.exports = router;
