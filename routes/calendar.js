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

  // console.log(interviewer)
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
      .filter(`contains(Subject, '${subject}')`)
      .top(numberOfEvents)
      .select('subject,start,end,attendees')
      .orderby('start/dateTime ASC')
      .get();

    // Dirty test code starts here
    const event = {
      subject: "Appointment Made",
        start: {
          dateTime: "2018-11-12T18:30:00.0000000",
          timeZone: "UTC"
        },
        end: {
          dateTime: "2018-11-12T19:00:00.0000000",
          timeZone: "UTC"
        },
        attendees: [
          {
            "EmailAddress": {
              "Address": "iamansel@gmail.com",
              "Name": "Ansel Bridgewater"
            },
            "Type": "Required"
          }
        ]
      }

    params.events = result.value;

    params.events.forEach(async function(event) {
      let startTime = moment(event.start.dateTime);
      let endTime = moment(event.end.dateTime);
      let duration = endTime.diff(startTime, 'minutes');
      let numOfDividedEvents = Math.floor(duration / 15);
      let newEventsArr = [];
      // Only divide events if they are 30 minutes or longer
      if (numOfDividedEvents > 1) {

        for(let i = 0; i < numOfDividedEvents; i++){
          let thisStartTime;
          let thisEndTime;
          if(newEventsArr.length > 0){
            thisStartTime = moment(newEventsArr[newEventsArr.length-1].end.dateTime);
            thisEndTime = moment(newEventsArr[newEventsArr.length-1].end.dateTime);
          }else{
            thisStartTime = moment(event.start.dateTime).subtract(8, "hours");
            thisEndTime = moment(event.start.dateTime).subtract(8, "hours");
          }
          thisEndTime.add(15, "minutes");
          newEvent = {
            subject : "Interview Appointment",
            start: {
              dateTime : thisStartTime.utc().format(),
              timeZone : "UTC"
            },
            end : {
              dateTime : thisEndTime.utc().format(),
              timeZone : "UTC"
            },
            attendees : event.attendees
          }
          const testAdd = await client
            .api("/me/events")
            .post(newEvent);
          newEventsArr.push(newEvent);
        }
        console.log(newEventsArr);
        const testDelete = await client
          .api(`/me/events/${event.id}`)
          .delete((err, res) => {
            if (err) {
              console.log(err)
              return;
            }
          })

      }
    })
    // Dirty test code ends here


    res.json(params)
  } catch (err) {
    params.message = 'Error retrieving events';
    params.error = { status: `${err.code}: ${err.message}` };
    params.debug = JSON.stringify(err.body, null, 2);
    res.json(params);
  }
});

router.post('/calendar/interviewer/:interviewerId', async function(req, res, next) {
  // Create new user
  const newCandidate = new Candidate({
    fullName: req.body.fullName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
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

    res.status(200).send('<script>window.close();</script>')
  } catch (err) {
    params.message = 'Error updating event';
    params.error = { status: `${err.code}: ${err.message}` };
    params.debug = JSON.stringify(err.body, null, 2);
    res.json(params);
  }
});

module.exports = router;
