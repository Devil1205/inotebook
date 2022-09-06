const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/FetchUser');
const secret = "this is PK's JWT";

//Creating API endpoints

//Route - 1   Create new user *No Login Required
router.post("/create", [
  body('email', 'Please enter a valid email').isEmail(),
  body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
  body('name', 'Name must be atleast 3 characters').isLength({ min: 3 })
], async (req, res) => {
  //Try block to log any error
  try {
    //Express validator part
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //Checking if email already exists
    let user = await User.findOne({ email: req.body.email });
    if (user !== null) {
      return res.status(400).json("Sorry this email is already registerd")
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    //Creating new user
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass
    })

    const authToken = jwt.sign({
      user: {
        id: user.id
      }
    }, secret);

    res.status(200).json({ authToken: authToken });
  }
  //Catching any error if occured
  catch (err) { console.log(err) };
})


//Route - 2   Login User *No Login Required 
router.post("/login", [
  body('email', 'Please enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists()
], async (req, res) => {
  const {email,password} = req.body;
  let user = await User.findOne({email: email});
  if(user===null)
  {
    return res.status(400).json("Please check the credentials");
  }
  const passCheck = await bcrypt.compare(password, user.password);
  if(passCheck===false)
  {
    return res.status(400).json("Please check the credentials");
  }
  const authToken = jwt.sign({
    user : {
      id: user.id
    }},secret)
    res.status(200).json({authToken: authToken})
})

//Route - 3   Fetching User with JWT *Login Required
router.post("/getuser", fetchuser ,async (req, res) => {
  try{
  const id= req.user.id;
  const user = await User.findById(id).select("-password");
  res.status(200).send(user);
}
catch(err)
{
  res.status(500).send("Some error occured");
}
})

module.exports = router;