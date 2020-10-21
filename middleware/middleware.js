
// Redirect logged users
function loggedOut(req,res,next){
  if(req.session && req.session.userId){
    return res.redirect("/");
  }
  return next()
}



module.exports = loggedOut;