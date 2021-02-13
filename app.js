// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require('dotenv/config');

// ℹ️ Connects to the database
require('./db');

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require('express');

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require('hbs');

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most middlewares
require('./config')(app);

// passport configuration
const User = require('./models/User');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// we serialize only the `_id` field of the user to keep the information stored minimum
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// when we need the information for the user, the deserializeUser function is called with the id that we previously serialized to fetch the user from the database
passport.deserializeUser((id, done) => {
    User.findById(id)
        .then((dbUser) => {
            done(null, dbUser);
        })
        .catch((err) => {
            done(err);
        });
});

passport.use(
    new LocalStrategy((username, password, done) => {
        // login
        User.findOne({ username: username })
            .then((userFromDB) => {
                if (userFromDB === null) {
                    // there is no user with this username
                    done(null, false, { message: 'Wrong Credentials' });
                } else if (!bcrypt.compareSync(password, userFromDB.password)) {
                    // the password is not matching
                    done(null, false, { message: 'Wrong Credentials' });
                } else {
                    // the userFromDB should now be logged in
                    done(null, userFromDB);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    })
);

app.use(passport.initialize());
app.use(passport.session());

// google login

const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_KEY,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
        },
        (accessToken, refreshToken, profile, done) => {
            // to see the structure of the data in received response:
            console.log('Google account details:', profile);

            User.findOne({ googleID: profile.id })
                .then((user) => {
                    if (user) {
                        done(null, user);
                        return;
                    }

                    User.create({
                        googleID: profile.id,
                        username: profile._json.name,
                        email: profile._json.email,
                        picture: profile._json.picture,
                        // password: req.params.password,
                    })
                        .then((newUser) => {
                            done(null, newUser);
                        })
                        .catch((err) => done(err)); // closes User.create()
                })
                .catch((err) => done(err)); // closes User.findOne()
        }
    )
);

// end passport
// default value for title local
const projectName = 'lab-express-rooms-with-reviews';
const capitalized = (string) =>
    string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.title = `${capitalized(projectName)}- Generated with IronGenerator`;

// 👇 Start handling routes here
const index = require('./routes/index');
app.use('/', index);

const auth = require('./routes/auth');
app.use('/', auth);

const rooms = require('./routes/rooms');
app.use('/', rooms);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app);

module.exports = app;
