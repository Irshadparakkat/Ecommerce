
const varifyAdmin = (req,res,next)=>{
    if(req.session.adminauthenticated){
        next()
    }else{
        res.redirect('/admin')
    }
}
module.exports={varifyAdmin}