const router = require('express').Router();
const loginCheck = require('../middleware/middleware');

/* GET home page */
router.get('/', (req, res, next) => {
    console.log('user', req.user); /// is undefined
    res.render('index', { user: req.user });
});
router.get('/rooms', loginCheck, (req, res, next) => {
    res.render('rooms/index');
});

module.exports = router;
