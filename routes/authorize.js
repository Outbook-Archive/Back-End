// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE.txt in the project root for license information.
var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');

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

  // There is a code, so attempt to exchange it for a token
  try {
    let token = await authHelper.getTokenFromCode(code, res);
    res.redirect('/');
  } catch (error) {
    res.json({ title: 'Error', message: 'Error exchanging code for token', error: error });
  }
});

// Signs the user out by clearing cookies
router.get('/authorize/signout', function(req, res, next) {
  authHelper.clearCookies(res);

  // Redirect to home
  res.redirect('/');
});

module.exports = router;
