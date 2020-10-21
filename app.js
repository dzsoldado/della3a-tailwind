const express = require('express');
const exphbs  = require('express-handlebars');
const mongoose = require("mongoose")
const bcrypt = require('bcryptjs');
const session = require("express-session")
const mid = require("./middleware/middleware");
const app = express();

PORT = process.env.PORT || 5000;


mongoose.connect("mongodb://localhost:27017/della3a", {useNewUrlParser: true, useUnifiedTopology: true})

// USER MODEL
let User = require("./models/User")


// Middlewares
app.use(session({
  secret: "another secret",
  resave: true,
  saveUninitialized: false
}))

app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(express.static(__dirname+"/public"))

// TEMPLATE ENGINE
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


// Endpoints
app.get("/", (req,res,next)=>{

  if(req.session.userId){
    User.findById(req.session.userId)
    .then(doc=>{
      res.render("index", {title: `Della3a | ${doc.name}`, name: doc.name});
    })

  }else{
    res.render("index", {title: "Della3a | Home"});
  }

})

app.get("/login", mid, (req,res, next)=>{
  res.render("login", {title: "Login To Della3a"})
})

app.get("/register", mid,(req,res, next)=>{
  res.render("register", {title: "Register New Della3a"})
})


app.get("/logout", (req,res,next)=>{
  if(req.session){
    req.session.destroy(err=>{
      if(err){
        return next(err)
      }else{
        res.redirect("/")
      }
    })
  }
})

app.post("/login", (req,res,next)=>{
  if(req.body.email && req.body.pwd){
    // Check if email exists
    User.findOne({email: req.body.email}, (err, data)=>{
      if(err){
        return next(err);
      }else{
        // If email exists
        if(data){
           bcrypt.compare(req.body.pwd, data.password)
          .then(match=>{
            // If password is correct ===> Auth
            if(match){
              // Create session
              req.session.userId = data._id;
              res.redirect("/"); 

            }else{
            // IF password is  wrong
              let err = new Error("Invalid Credentials.")
              err.status = 401;
              return next(err);
            }
          })
          .catch(err=>{
            return next(err)
          })
        // If email doesn't exist
        }else{
          let err = new Error("Invalid Credentials.")
          err.status = 401;
          return next(err);
        }
      }
    })

  }else{
    let err = new Error("Please enter both email and password.")
    err.status = 400;
    return next(err);
  }
})

// Register new user
app.post("/register", (req,res, next)=>{
  if(req.body.name &&
    req.body.email &&
    req.body.pwd &&
    req.body.pwd2){

      // Short password
      if(req.body.pwd.length <= 5){
        let err = new Error("Password too short.")
        err.status = 400;
        return next(err);
      }
      
      // Check password confirmation
      if(req.body.pwd != req.body.pwd2){
        let err = new Error("Passwords must be the same.")
        err.status = 400;
        return next(err);
      }

      // Create new user
      bcrypt.hash(req.body.pwd, 10, (err, hash)=>{
        if(err){
          err.status = 500;
          return next(err);
        }
        else{
          let newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password : hash
          })

          newUser.save((err,data)=>{
            if(err){
              let err = new Error("Could not create user.")
              err.status = 500;
              return next(err);
            }else{
              req.session.userId = data._id;
              res.redirect("/")
            }
          })
        }
      })
  }
  else{
    let err = new Error("All fields are required.")
    err.status = 400;
    return next(err);
  }
})

// ALL REMAINING ENDPOINTS
app.all("*", (req,res,next)=>{
  res.status(404).send("404 Page not found")
})


// ERROR HANDLER
app.use((err, req, res, next)=>{
  if(err){
    
    res.status(err.status || 500)
    res.render(req.originalUrl.slice(1), {
      message: err.message,
    });
  }
})




app.listen(PORT, ()=>{
  console.log(`Serveer started at port ${PORT}`)
})


