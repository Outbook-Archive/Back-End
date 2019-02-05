const router = require('express').Router();
const { getAuthUrl, getAccessToken } = require('../helpers/auth');

// Redirect to OAuth2 login
router.get('/', async function(req, res) {
    const signInUrl = await getAuthUrl();
    res.redirect(signInUrl);
})

module.exports = router;
