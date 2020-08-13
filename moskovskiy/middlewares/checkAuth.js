const jwt = require('jsonwebtoken');
const SECRET_KEY = require('../config').SECRET_KEY

const checkAuth = (req, res, next) => {
    if (req.headers.authorization) {
        const [type, token] = req.headers.authorization.split(' ');
        jwt.verify(token, SECRET_KEY, (err,decoded) => {
            if (err) { return res.status(403).send() }

            req.user = decoded;
            next();
        })
    } else {
        res.status(403).send();
    }
}

module.exports = checkAuth;