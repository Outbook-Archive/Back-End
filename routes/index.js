// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE.txt in the project root for license information.
const express = require('express');
const router = express.Router();
const { getAuthUrl, getAccessToken } = require('../helpers/auth');

// Get homepage for OAuth2 login
router.get('/', async function(req, res, next) {
  let params = {}

  //TODO: Prevent accessToken from getting sent to front end before shipping final version
  const accessToken = await getAccessToken(req.cookies, res);
  const userName = req.cookies.graph_user_name;

  if (accessToken && userName) {
    params.user = userName;
    params.debug = `User: ${userName}\nAccess Token: ${accessToken}`;
  } else {
    params.signInUrl = getAuthUrl();
    params.debug = params.signInUrl;
  }

  res.json(params)
})

module.exports = router;
