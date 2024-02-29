var express = require('express');
var router = express.Router();
var userModel = require('./users');
var postModel = require('./post');
const passport = require('passport');
const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));
const upload = require("./multer");
const flash = require("connect-flash");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {nav:false , error:req.flash("error")});
});

router.get('/register', function(req, res, next) {
  res.render('register',{nav:false});
});

router.get('/profile',isLoggedIn,async function(req, res, next) {
  let user = await userModel
  .findOne({username: req.session.passport.user})
  .populate("posts");
  
  res.render('profile',{user , nav:true});
});

router.get('/feed',isLoggedIn,async function(req, res, next) {
  let user = await userModel.findOne({username: req.session.passport.user})
  let post = await postModel.find()
  .populate("user");

  res.render('feed',{post ,user, nav:true});
});

router.get('/show',isLoggedIn,async function(req, res, next) {
  let postId = req.query._id;
  let post = await postModel.findOne({ _id: postId });

  res.render("show",{post,nav:true});
});

router.get('/add',isLoggedIn ,async function(req, res, next) {
  let user = await userModel.findOne({username: req.session.passport.user});
  res.render('add',{user , nav:true});
});

router.post('/createpost',isLoggedIn , upload.single('postimage'),async function(req, res, next) {
  let user = await userModel.findOne({username: req.session.passport.user});
  let post = await postModel.create({
    user        : user._id,
    title       : req.body.title,
    description : req.body.description,
    image       : req.file.filename
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.post('/fileupload',isLoggedIn, upload.single('image'),async(req,res)=>{
  if(!req.file){
    return res.status(400).send("No File were Uploaded.")
  }
  let user = await userModel.findOne({username: req.session.passport.user});
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect("/profile")
  // res.send('file uploaded succesfully');
})

router.post('/register', function(req, res, next) {
  const userdata = new userModel({
    username : req.body.username,
    email    : req.body.email,
    contact  : req.body.contact,
    name     : req.body.fullname,
  });

  userModel.register(userdata, req.body.password)
  .then(function(registerduser){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile")
    })
  })
});

router.post('/login', passport.authenticate("local",{
  failureRedirect : "/",
  successRedirect : "/profile",
  failureFlash:true,
}),function(req,res,next){
});

router.get('/logout', function(req,res,next){
  req.logout(function(err){
    if(err){return next(err);}
    res.redirect('/');
  });
});

function isLoggedIn(req , res , next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}





module.exports = router;
