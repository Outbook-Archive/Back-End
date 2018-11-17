// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE.txt in the project root for license information.
var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var graph = require('@microsoft/microsoft-graph-client');
var moment = require('moment');

// Get calendar events
router.get('/', async function(req, res, next) {
  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userName = req.cookies.graph_user_name;

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
  const subject = "Time Block";

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
            console.log(res)
        })
    })
    // Dirty test code ends here

    // Unix timestamp not needed?
    // for (let event_index = 0; event_index < params.events.length; event_index++) {
    //   params.events[event_index].start.dateTime = new Date(params.events[event_index].start.dateTime).getTime() / 1000
    //   params.events[event_index].start.timeZone = 'Unix Timestamp'
    //   params.events[event_index].end.dateTime = new Date(params.events[event_index].end.dateTime).getTime() / 1000
    //   params.events[event_index].end.timeZone = 'Unix Timestamp'
    // }

    res.json(params)
  } catch (err) {
    params.message = 'Error retrieving events';
    params.error = { status: `${err.code}: ${err.message}` };
    params.debug = JSON.stringify(err.body, null, 2);
    res.json(params);
  }
});

module.exports = router;
