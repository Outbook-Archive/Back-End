// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE.txt in the project root for license information.
var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var graph = require('@microsoft/microsoft-graph-client');

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

  // Set start of the calendar view to today at midnight
  const start = new Date(new Date().setHours(0,0,0));
  // Set end of the calendar view to [daysIntoFuture] days from start
  const end = new Date(new Date(start).setDate(start.getDate() + daysIntoFuture));

  let params = { user: userName };

  try {
    // Get the first [numberOfEvents] events for the coming week
    const result = await client
      .api(`/me/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`)
      .top(numberOfEvents)
      .select('subject,start,end,attendees')
      .orderby('start/dateTime ASC')
      .get();

    params.events = result.value;
<<<<<<< HEAD
    for (let event_index = 0; event_index < params.events.length; event_index++) {
      params.events[event_index].start.dateTime = new Date(params.events[event_index].start.dateTime).getTime() / 1000
      params.events[event_index].start.timeZone = 'Unix Timestamp'
      params.events[event_index].end.dateTime = new Date(params.events[event_index].end.dateTime).getTime() / 1000
      params.events[event_index].end.timeZone = 'Unix Timestamp'
    }

=======
>>>>>>> 05eef81901fd374e9cf4fba3e96428f48d8e1fe2
    res.json(params)
  } catch (err) {
    params.message = 'Error retrieving events';
    params.error = { status: `${err.code}: ${err.message}` };
    params.debug = JSON.stringify(err.body, null, 2);
    res.json(params);
  }
});

module.exports = router;
