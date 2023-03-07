const varifyUser = (req,res,next)=>{
    if(req.session.authenticated){
      next()

    }else{
      
      res.status(401).json({error: "Not authorized"});
    }
  }
  
  module.exports={varifyUser}
  