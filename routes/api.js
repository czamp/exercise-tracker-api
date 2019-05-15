var Users = require('../models/users');
var Exercises = require('../models/exercises');
var router = require('express').Router();

// Create a new user
// POST /api/exercise/new-user
router.post('/new-user', (req, res, next) => {
  var username = req.body.username;
  
  // create a user document
  var user = new Users({username: username});
  
  // save the user document
  user.save((err, doc) => {
    if (err) {
      // unique property warning 
      if (err.code === 11000) { 
       return({status: 400, message: "Username Already Exists."})
      } 
      else { return next(err) }
    }
    
    res.json(doc); // respond with the generated user document
  })
})

// GET /api/exercise/users list of users
router.get('/users', (req, res, next) => {
  Users.find({}, (err, docs) => {
    if (err) { return next(err) };
    res.json(docs);
  })
});

// POST /api/exercise/add
router.post('/add', (req, res, next) => {
  
  // Find a User with the same _id as the submitted userId
  Users.findById(req.body.userId, (err, user) => {
    if (err) { return next(err)}
    if (!user) {
      return next({
        status: 400,
        message: "User Not Found."
      })  
    }
    
    // Create exercise document
    const exercise = new Exercises(req.body);
    // Set the document username to the found username
    exercise.username = user.username;
    
    // If no date specified, use today's date
    if (exercise.date === null) {
      exercise.date = new Date()
    }
    
    // Save the exercise document
    exercise.save((err, doc) => {
      if (err) { return next(err) }
      // Convert doc to an object to allow manipulation of date format
      doc = doc.toObject()
      // Format date with .toDateString()
      doc.date = (new Date(doc.date)).toDateString()
      res.json(doc);
    })
  })
})

// GET users's exercise log: GET /api/exercise/log?{userId}[&from][&to][&limit]
// { } = required, [ ] = optional
// from, to = dates (yyyy-mm-dd); limit = number
// example: http://nonstop-month.glitch.me/api/exercise/log?userId=emFY7Lwnn&from=2019-05-01&to=2019-05-15&limit=2

router.get('/log?', (req, res, next) => {
  var userId = req.query.userId;
  var from = new Date(req.query.from);
  var to = new Date(req.query.to);
  var limit = req.query.limit;
  console.log(userId + ' ' + from + ' ' + to + ' ' + limit)
  
  // Find the user with the queried userId
  Users.findById({_id: userId}, (err, user) => {
    // console.log(user);
    if (err) { return next(err) };
    if (!user) {
      return next({status: 400, message: "Error: User Not Found"})
    }
    
    Exercises.find({
      userId: userId,
      date: {
        $lt: to != "Invalid Date" ? to.getTime() : Date.now(), // if no to, use current date
        $gt: from != "Invalid Date" ? from.getTime() : 0 // if no from, use 0
      }
    })
    .sort("-date")
    .limit(parseInt(limit))
    .exec((err, exercises) => {
      if (err) { return next(err) };
      
      const result = {
        username: user.username,
        _id: userId,
        to: to != "Invalid Date" ? to.toDateString() : undefined,
        from: from != "Invalid Date" ? from.toDateString() : undefined,
        exerciseCount: exercises.length,
        log: exercises.map(e => ({
          description: e.description,
          duration: e.duration,
          date: e.date
        }))
      };
      
      res.json(result);
      
    })
    
  });
  
})

module.exports = router;
