const moment = require('moment');
const Interviewer = require('../models/interviewer');
const graph = require('@microsoft/microsoft-graph-client');


async function divideEvents(interviewerId) {
  // Get the access token from the database
  const interviewer = await Interviewer.findById(interviewerId).then((interviewer) => {
    return interviewer
  }).catch((err) => {
    res.status(400).json({ message: err.message })
  });

  // Get access token from interviewer object
  const accessToken = interviewer.tokens[0].access_token;

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

  try {
    // Get the first [numberOfEvents] events for the coming week
    const result = await client
      .api(`/me/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`)
      .filter(`contains(Subject, '${subject}')`)
      .top(numberOfEvents)
      .select('subject,start,end,attendees')
      .orderby('start/dateTime ASC')
      .get();

    events = result.value;

    events.map(async function(event) {
      let startTime = moment(event.start.dateTime);
      let endTime = moment(event.end.dateTime);
      let duration = endTime.diff(startTime, 'minutes');
      let numOfDividedEvents = Math.floor(duration / 15);
      let previousEndDateTime;
      // Only divide events if they are 30 minutes or longer
      if (numOfDividedEvents > 1) {

        for(let i = 0; i < numOfDividedEvents; i++){
          let thisStartTime;
          let thisEndTime;
          if(previousEndDateTime){ //Runs after the first event
            thisStartTime = moment(previousEndDateTime);
            thisEndTime = moment(previousEndDateTime);
          }else{ //Runs for the first event only
            thisStartTime = moment(event.start.dateTime).subtract(8, "hours");
            thisEndTime = moment(event.start.dateTime).subtract(8, "hours");
          }
          // Makes the appointments 15 minutes long by adding 15 minutes at the end
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

          previousEndDateTime = thisEndTime.utc().format()
        }

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
  } catch (err) {
    params.message = 'Error retrieving events';
    params.error = { status: `${err.code}: ${err.message}` };
    params.debug = JSON.stringify(err.body, null, 2);
    console.log(params);
  }
}

module.exports = {
  divideEvents
}
