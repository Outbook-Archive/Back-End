const router = require('express').Router();
const { getAuthUrl, getAccessToken } = require('../helpers/auth');

// Get homepage for OAuth2 login
router.get('/', async function(req, res) { // why are we using "async"
    // TODO: checks if the user is authenticated and will redirect to the "dashboard"
    let params = {} // what we are going to send to the frontend
    // TODO: Prevent accessToken from getting sent to front end before shipping final version
    const accessToken = await getAccessToken(req.cookies, res); // save into localStorage
    const userName = req.cookies.graph_user_name;

    if (accessToken && userName) {
        params.user = userName;
        params.debug = `User: ${userName}\nAccess Token: ${accessToken}`;
    } else {
        params.signInUrl = getAuthUrl();
    }
    
    res.json(params)
})

module.exports = router;
