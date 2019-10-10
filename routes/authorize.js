// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE.txt in the project root for license information.
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { getTokenFromCode, clearCookies, getIdFromToken } = require('../helpers/auth');
const { divideEvents } = require('../helpers/cal');

// Handles returned authentication code from Microsoft's OAuth2 login
router.get('/authorize', async function(req, res, next) {
  // Get auth code
  const code = req.query.code;

  // If there is no code, send error
  if (!code) {
    res.json({ title: 'Error', message: 'Authorization error', error: { status: 'Missing code parameter' } });
    // Use to prevent code below from running
    return next();
  }

  // There is a code, so attempt to exchange it for a token
  try {
    let token = await getTokenFromCode(code, res);
    res.redirect(`${process.env.CROSS_ORIGIN}/candidateLink`);
  } catch (error) {
    res.json({ title: 'Error', message: 'Error exchanging code for token', error });
  }
});



// Get interviewer calendar URL
router.get('/authorize/calendar', async function(req, res) {
  const id = await getIdFromToken(req.cookies)
  const url = `${process.env.CROSS_ORIGIN}/dashboard/${id}`

  const user = jwt.decode(req.cookies.graph_id_token)
  const name = user.name

  // Divide the events before the link is shared
  divideEvents(id)

  res.json({ calendarUrl: url, interviewerName: name });
});



// Signs the user out by clearing cookies
router.get('/authorize/signout', function(req, res) {
  clearCookies(res);
  // Redirect to home
  res.redirect('/');
});

module.exports = router;
