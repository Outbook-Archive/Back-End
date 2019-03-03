const router = require('express').Router();
const { getAuthUrl } = require('../helpers/auth');

// Redirect to OAuth2 login
router.get('/', async function(req, res) {
    const signInUrl = await getAuthUrl();
    res.redirect(signInUrl);
})

module.exports = router;
