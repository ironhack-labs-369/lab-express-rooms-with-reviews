const router = require('express').Router();
const User = require('../models/User');
const Room = require('../models/Room');
const { loginCheck } = require('../middleware/middleware');
const { uploader, cloudinary } = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

/// @desc     Get all rooms
// @route     GET /rooms
// @access    Public
router.get('/rooms', (req, res, next) => {
    Room.find()
        .populate('owner')
        .then((rooms) => {
            console.log('rooms', rooms);
            res.render('rooms/index', { rooms });
        })
        .catch((err) => {
            console.log(err);
            next(err);
        });
});

// @desc      Show add form
// @route     GET /rooms/new
// @access    Private
router.get('/rooms/add', (req, res) => {
    User.find()
        .populate('owner')
        .then((owners) => {
            res.render('rooms/add', { owners });
        });
});

// @desc      Add room
// @route     POST /rooms
// @access    Private
router.post(
    '/rooms/add',

    uploader.single('image'),
    (req, res, next) => {
        console.log('', req.file);
        const { name, description, reviews } = req.body;

        Room.create({
            name,
            description,
            imageUrl: req.file.path,
            // owner: req.user.id,
            reviews,
        })
            .then(() => {
                res.redirect('/rooms');
            })
            .catch((err) => {
                next(err);
            });
    }
);

// @desc      Show edit form
// @route     POST /rooms/edit/:id
// @access    Private
router.get('/rooms/edit/:id', loginCheck, (req, res) => {
    User.find()
        .populate('owner')
        .then((owners) => {
            Room.findById(req.params.id).then((room) => {
                console.log('room', room);
                res.render('roomEdit', { room, owners });
            });
        });
});
module.exports = router;
