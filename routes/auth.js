const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const passport = require('passport');

// @desc      Google social login
// @route     GET /auth/google
// @access    Public
router.get(
    '/auth/google',
    passport.authenticate('google', {
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ],
    })
);
router.get(
    '/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login',
    })
);

/// @desc     Sign up
// @route     GET /signup
// @access    Public
router.get('/signup', (req, res, next) => {
    res.render('auth/signup');
});

// @desc      Log in
// @route     GET /login
// @access    Public
router.get('/login', async (req, res, next) => {
    res.render('auth/login');
});

// @desc      Log in
// @route     POST /login
// @access    Public
router.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        passReqToCallback: true,
    })
);

// @desc      Log in
// @route     POST /signup
// @access    Public
router.post('/signup', (req, res, next) => {
    const { username, password } = req.body;
    if (password.length < 8) {
        res.render('auth/signup', {
            message: 'Your password must be 8 characters minimun.',
        });
        return;
    }
    if (username === '') {
        res.render('auth/signup', { message: 'Your username cannot be empty' });
        return;
    }
    User.findOne({ username: username }).then((found) => {
        if (found !== null) {
            res.render('auth/signup', {
                message: 'This username is already taken',
            });
        } else {
            // we can create a user with the username and password pair
            const salt = bcrypt.genSaltSync();
            const hash = bcrypt.hashSync(password, salt);

            User.create({ username: username, password: hash })
                .then((dbUser) => {
                    // login with passport
                    req.login(dbUser, (err) => {
                        if (err) {
                            next(err);
                        } else {
                            res.redirect('/');
                        }
                    });
                })
                .catch((err) => {
                    next(err);
                });
        }
    });
});

// @desc      Log out
// @route     GET /logout
// @access    Private
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});
module.exports = router;
