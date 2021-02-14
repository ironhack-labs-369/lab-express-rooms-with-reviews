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
    // loginCheck,
    uploader.single('image'),
    (req, res, next) => {
        console.log('', req.file);
        const { name, description, reviews } = req.body;
        const publicId = req.file.filename;
        const imageUrl = req.file.path;

        Room.create({
            name,
            description,
            imageUrl,
            // owner: req.user.id,
            reviews,
            publicId,
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

// @desc      Delete room
// @route     GET /rooms/delete/:id
// @access    Private
router.get('/rooms/delete/:id', loginCheck, (req, res) => {
    Book.findByIdAndDelete(req.params.id).then((room) => {
        console.log('This room was removed', room);
        res.redirect('/rooms').catch((err) => {
            console.log(err);
        });
    });
});
// @desc      Edit room
// @route     POST /rooms/edit/:id
// @access    Private
router.post('/books/edit/:id', loginCheck, (req, res) => {
    const { name, description, price } = req.body;
    Book.findbyIdAndUpdate(req.params.id, {
        title,
        description,
        price,
    })
        .then((room) => {
            console.log('This room was updated', room);
            res.redirect(`/rooms/${room._id}`);
        })
        .catch((err) => {
            console.log(err);
        });
});

// @desc      Write review
// @route     POST /rooms/:id/reviews
// @access    Private
router.post('/rooms/:id/reviews', (req, res) => {
    const { user, comments } = req.body;
    Book.findOneAndUpdate(
        { _id: req.params.id },
        {
            $push: { reviews: { user, comments } },
        }
    )
        .then(() => {
            res.redirect(`/rooms`);
        })
        .catch((err) => {
            console.log(err);
        });
});
