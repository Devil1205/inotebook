var jwt = require('jsonwebtoken');
const secret = "this is PK's JWT";

const fetchuser = (req, res, next)=>{
    const authToken = req.header("auth-token");
    if(authToken===null)
    {
        res.status(401).send("Please authenticate using valid token");
    }
    try{
        const data = jwt.verify(authToken, secret);
        req.user = data.user;
        next();
    }
    catch(err)
    {
        res.status(401).send("Please authenticate using valid token");
    }
}

module.exports = fetchuser; 