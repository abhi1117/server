/*
const passport=require('passport');
//const ProgramManager = require('../models/ProgramManager');
const JWTStrategy=require('passport-jwt').Strategy;
const ExtractJwt=require('passport-jwt').ExtractJwt;
const cookieParser = require('cookie-parser');
const SuperAdmin=require('../models/Superadmin');
const opts={
    jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies.token]),
    secretOrKey:  process.env.JWT_SECRET,
    
};

passport.use(new JWTStrategy(opts,async(jwtPayload,done)=>{
    try{
    //    console.log('JWT PAYLOAD:',jwtPayload)
        const user=await SuperAdmin.findById(jwtPayload._id);
      //  console.log('pass********:',user);
        if(user){
            return done(null,user);
        }else{
            return done(null,false);
        }
    }catch(err){
        return done(err,false);
    }
}));
module.exports=passport;
*/
/*
const passport = require('passport');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const SuperAdmin = require('../models/Superadmin');
const Organization = require('../models/Organization'); // Adjust this based on your actual Admin model
const ProgramManager = require('../models/ProgramManager'); // Adjust this based on your actual ProgramManager model
//const User=require('../models/User')

const opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies.token]),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JWTStrategy(opts, async (jwtPayload, done) => {
    try {
      //  console.log('jwt:',jwtPayload);
      // Attempt to find the user in each collection to determine their role
      let user = await SuperAdmin.findById(jwtPayload._id);
      if (user) {
        user.role = "Super Admin"; // Manually set the role in memory
        return done(null, user);
      }
      user = await Organization.findById(jwtPayload._id);
      //  console.log('user admin:',user)
        if (user) {
          user.role = "Admin"; // Manually set the role in memory
          return done(null, user);
        }
      
    
    user = await ProgramManager.findById(jwtPayload.user._id);
    //  console.log('user pm:',user)
      if (user) {
        user.role = "Program Manager"; // Manually set the role in memory
        return done(null, user);
      }
    
   // user= await  User.findById(jwtPayload.)
    
      // If no user is found in any of the collections
      return done(null, false);
    } catch (err) {
      return done(err, false); // Error handling
    }
  })
);

module.exports = passport;
*/

const passport = require('passport');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const SuperAdmin = require('../models/Superadmin');
const Organization = require('../models/Organization'); // Admin model
const ProgramManager = require('../models/ProgramManager'); // Program Manager model

/*
// Custom extractor function to handle multiple token names
const cookieExtractor = async (req,res) => {
  let token = null;
  if (req && req.cookies) {
   // console.log("body:",req);
    // Check for tokens based on roles
    if (req.cookies.superAdminToken) {
      token = req.cookies.superAdminToken; // Token for Super Admin
    } else if (req.cookies.adminToken) {
     //  let user=await Organization.findOne({email:req.body.email})
     // console.log('user:',user);
      token = req.cookies.adminToken; // Token for Admin
    } else if (req.cookies.programManagerToken) {
      token = req.cookies.programManagerToken; // Token for Program Manager
    }
  }
  return token;
};
*/
const cookieExtractor = (req) => {
  let token = null;
  //console.log(req.cookies)
  if (req && req.cookies) {
    // Loop through cookies and find the token for a role
    for (const cookieName in req.cookies) {
      if (cookieName.startsWith('superAdminToken')) {
        token = req.cookies[cookieName];
        break;
      } else if (cookieName.startsWith('adminToken')) {
        token = req.cookies[cookieName];
        break;
      } else if (cookieName.startsWith('programManagerToken')) {
      //  console.log(req.cookies)

        token = req.cookies[cookieName];
       // console.log(token)
        break;
      }
    }
  }
  return token;
};

const opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]), // Use the custom cookie extractor
  secretOrKey: process.env.JWT_SECRET, // Your secret key
};

passport.use(
  new JWTStrategy(opts, async (jwtPayload, done) => {
    try {
      let user = null;
    //  console.log(jwtPayload._id)
      // Attempt to find the user in each collection to determine their role
      if (jwtPayload._id) {
        // Find Super Admin
        user = await SuperAdmin.findById(jwtPayload._id);
        if (user) {
          user.role = "Super Admin"; // Manually set the role
          return done(null, user);
        }

        // Find Admin
        user = await Organization.findById(jwtPayload._id);
        if (user) {
          user.role = "Admin"; // Manually set the role
          return done(null, user);
        }

        // Find Program Manager
        user = await ProgramManager.findById(jwtPayload._id);
       // console.log("****:",user)
        if (user) {
          user.role = "Program Manager"; // Manually set the role
          return done(null, user);
        }
      }

      // If no user is found in any of the collections
      return done(null, false);
    } catch (err) {
      return done(err, false); // Error handling
    }
  })
);

module.exports = passport;
