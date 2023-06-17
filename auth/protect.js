
const checkAuthenticateds = (req1, res1, next1) => {
    if (req1.isAuthenticated() && req1.user!=undefined) {
        if(!req1.user.isHOD){
            return next1();
        }
    }
    res1.redirect("/Staff/login");
}

const checkAuthenticatedh = (req2,res2,next2)=>{
    if (req2.isAuthenticated() && req2.user!=undefined ) {
        if(req2.user.isHOD){
            return next2();
        }
    }
    return res2.redirect("/HOD/login");
}


const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated() && req.user!=undefined ) {
        if(req.user.isStaffAdmin){
            return next();
        }
    }
    return res.redirect("/Staff-Admin/login");
}

const checkNotAuthenticated = async (req, res, next) => {
    if (req.isAuthenticated() && req.user!=undefined && req.user.isStaffAdmin) {
        return res.redirect("/Staff-Admin/dashboard");
    }
    else if(req.isAuthenticated() && req.user!=undefined && req.user.isHOD){
        return res.redirect("/HOD/dashboard");
    }
    else if(req.isAuthenticated() && req.user!=undefined && !req.user.isHOD){
        return res.redirect("/Staff/dashboard");
    }
    next()
}

module.exports = { checkAuthenticated, checkNotAuthenticated,checkAuthenticateds,checkAuthenticatedh };