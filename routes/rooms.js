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
            owner: req.user.id,
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
// @route     POST /rooms/:id/edit
// @access    Private
router.get('/rooms/:id/edit', (req, res) => {
    User.find()
        .populate('owner')
        .then((owners) => {
            Room.findById(req.params.id)
                .then((room) => {
                    console.log('room', room);
                    let options = '';
                    let selected = '';
                    owners.forEach((owner) => {
                        console.log('owner', owner);
                        selected = room.owner
                            .map((el) => el._id)
                            .includes(owner._id)
                            ? ' selected'
                            : '';
                        options += `<option value="${owner._id}" ${selected}>${owner.name}</option>`;
                    });
                    console.log('owners', owners);
                    res.render('rooms/edit', { room, options });
                    // res.render('rooms/edit', { room, owners });
                })
                .catch((err) => {
                    console.log(err);
                    next(err);
                });
        });
});

// @desc      Edit room
// @route     POST /rooms/:id/edit
// @access    Private
router.post('/rooms/:id/edit', loginCheck, (req, res) => {
    const { name, description, price } = req.body;
    const query = { _id: req.params.id };

    // if user is not admin they have to be the owner
    if (req.user.role !== 'admin') {
        query.owner = req.user._id;
    }
    console.log('query', query);
    Room.findbyIdAndUpdate(query, {
        title,
        description,
        price,
    })
        .then((room) => {
            console.log('This room was updated', room);
            res.redirect(`/rooms`);
        })
        .catch((err) => {
            console.log(err);
        });
});

// @desc      Delete room
// @route     POST /rooms/:id/delete
// @access    Private
router.post('/rooms/:id/delete', (req, res) => {
    console.log('req.params', req.params);
    const query = { _id: req.params.id };

    // if user is not admin they have to be the owner
    if (req.user.role !== 'admin') {
        query.owner = req.user._id;
    }
    console.log('query', query);
    Room.findByIdAndDelete(query).then((room) => {
        if (room.imageUrl) {
            cloudinary.uploader.destroy(room.publicId);
        }
        console.log('This room was removed', room);
        res.redirect('/rooms').catch((err) => {
            console.log(err);
        });
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

module.exports = router;
