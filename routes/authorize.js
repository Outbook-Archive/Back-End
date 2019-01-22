// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE.txt in the project root for license information.
const express = require('express');
const router = express.Router();
const { getTokenFromCode, clearCookies, getIdFromToken } = require('../helpers/auth');

// Get authroize route
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

  // This URL will be used to redirect to
  const redirectAfterLogin = "http://localhost:3000/"

  // There is a code, so attempt to exchange it for a token
  try {
    let token = await getTokenFromCode(code, res);
    res.redirect(redirectAfterLogin); // <- this might be your bug for it not allowing it to redirect.
  } catch (error) {
    res.json({ title: 'Error', message: 'Error exchanging code for token', error: error });
  }
});



// Get interviewer calendar URL
router.get('/authorize/calendar', async function(req, res) {
  const id = await getIdFromToken(req.cookies)

  const url = `/calendar/interviewer/${id}`

  res.json({ calendarUrl: url });
});



// Signs the user out by clearing cookies
router.get('/authorize/signout', function(req, res) {
  clearCookies(res);
  // Redirect to home
  res.redirect('/');
});

module.exports = router;
