const Interviewer = require('../models/interviewer');
const jwt = require('jsonwebtoken');

// Create object that holds credentials
const credentials = {
  client: {
    id: process.env.APP_ID,
    secret: process.env.APP_PASSWORD,
  },
  auth: {
    tokenHost: 'https://login.microsoftonline.com',
    authorizePath: 'common/oauth2/v2.0/authorize',
    tokenPath: 'common/oauth2/v2.0/token'
  }
};
const oauth2 = require('simple-oauth2').create(credentials);

// Use REDIRECT_URI and APP_SCOPES to generate sign-in URL
function getAuthUrl() {
  const returnVal = oauth2.authorizationCode.authorizeURL({
    redirect_uri: process.env.REDIRECT_URI, // redirects to save the tokens into the DB
    scope: process.env.APP_SCOPES
  });
  return returnVal;
}

// Using the autorization code from OAuth2 login,
// generate a token using OAuth2 library
async function getTokenFromCode(auth_code, res) {
  let result = await oauth2.authorizationCode.getToken({
    code: auth_code,
    redirect_uri: process.env.REDIRECT_URI,
    scope: process.env.APP_SCOPES
  });

  const token = oauth2.accessToken.create(result);

  saveValuesToCookie(token, res);

  return token.token;
}



// Gets or refreshes token used for accessing calendar data
// Returns nothing if there are no useful cookies
async function getAccessToken(cookies, res) {
  // Do we have an access token cached?
  let token = cookies.graph_access_token;
  if (token) {
    // We have a token, but is it expired?
    // Expire 5 minutes early to account for clock differences
    const FIVE_MINUTES = 300000;
    const expiration = new Date(parseFloat(cookies.graph_token_expires - FIVE_MINUTES));
    if (expiration > new Date()) {
      // Token is still good, just return it
      return token;
    }
  }

  // Either no token or it's expired, do we have a refresh token?
  const refresh_token = cookies.graph_refresh_token;
  if (refresh_token) {
    const newToken = await oauth2.accessToken.create({refresh_token}).refresh();
    saveValuesToCookie(newToken, res);
    return newToken.token.access_token;
  }
  // Nothing in the cookies that helps, return empty
  return null;
}



// Function to refresh tokens
function refreshTokens() {
  // Get all interviewers and create object with new tokens
  Interviewer
    .find({})
    .then((interviewers) => {
      interviewers.forEach(async function(interviewer) {
        const refresh_token = interviewer.tokens[0].refresh_token;
        const newToken = await oauth2.accessToken.create({refresh_token}).refresh();
        if (newToken) {
          const update = {
            tokens: [{
              access_token: newToken.token.access_token,
              refresh_token: newToken.token.refresh_token,
              id_token: newToken.token.id_token
            }],
            expires: newToken.token.expires_at.getTime()
          }
          // Update the tokens in the database
          Interviewer
            .findByIdAndUpdate(interviewer._id, update)
            .then((interviewer) => {
              console.log(`Successfully updated interviewer: ${interviewer.username}`);
            }).catch((err) => {
              console.log(err.message)
            })
        } else {
          console.log("refresh_token is not valid");
        }
      })
    }).catch((err) => {
      console.log(err.message)
    })
}



// Decode cookie into something stored in database and return corresponding id
async function getIdFromToken(cookies) {
  const user = jwt.decode(cookies.graph_id_token);
  const Id = await Interviewer
    .findOne({ username: user.name })
    .then((interviewer) => {
      return interviewer._id
    })
    .catch(err => {
      console.log(err.message)
    })
  return Id
}



function saveValuesToCookie(token, res) {
  // Parse the identity token
  const user = jwt.decode(token.token.id_token);
  // ********************************************
  // Saving the tokens we need into our database: will switch later to MySQL
  const newInterviewer = new Interviewer({
    username: user.name,
    email: user.preferred_username,
    tokens: [{
      access_token: token.token.access_token,
      refresh_token: token.token.refresh_token,
      id_token: token.token.id_token
    }],
    expires: token.token.expires_at.getTime()
  })

  newInterviewer.save().then((_user) => {
    console.log('Successfully saved this user:', _user);
  })
  .catch(err => res.status(400).send({ message: err.message }))
  // ********************************************

  // Save the access token in a cookie -> every 3 months to refresh
  res.cookie('graph_id_token', token.token.id_token, { maxAge: 3628800000, httpOnly: true });
}



// Logout
function clearCookies(res) {
  res.clearCookie('graph_id_token', { maxAge: 3600000, httpOnly: true });
}

module.exports = {
  getAuthUrl,
  getTokenFromCode,
  refreshTokens,
  getIdFromToken,
  getAccessToken,
  clearCookies
}
