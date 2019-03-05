const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const bcrypt = require('bcrypt');
var models = require('./models');
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
},
    function (username, password, cb) {
        console.log(username)
        console.log(password)
        return models.User.findOne({
            where: {
                username: username
            }
        })
            .then(user => {
                console.log(user.password,password)
                if (!user) {
                    console.log('asdsadas')
                    return cb(null, false, { message: 'Incorrect email or password.' });
                }
                // bcrypt.genSalt(10, function (err, salt) {
                //     bcrypt.hash(password, salt, function (err, hash) {
                //         console.log(hash, user.password)
                //     })
                // });
                // if(user.password == password){
                //     return cb(null, user, { message: 'Logged In Successfully' });
                // }else{
                //     return cb(null, false, { message: 'Incorrect username or password.' });
                // }
                
                bcrypt.compare(password, user.password, function (err, res) {
                    console.log(res)
                    if (res) {
                        return cb(null, user, { message: 'Logged In Successfully' });
                    } else {
                        return cb(null, false, { message: 'Incorrect username or password.' });
                    }
                });

            })
            .catch(err => cb(err));
    }
));
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromHeader("authorization"),
    secretOrKey: 'your_jwt_secret'
},
    function (jwtPayload, cb) {
        return models.User.findOne({
            where: {
                id: jwtPayload.id
            }
        })
            .then(user => {
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            });
    }
));