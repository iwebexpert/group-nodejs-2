const jwt = require('jsonwebtoken');

const { SECRET_KEY } = require( '../config' );

module.exports = {
  checkAuth: (req, res, next) => {
    if ( !req.headers.authorization ) {
      return res.status(403).send();
    }
    const [ type, token ] = req.headers.authorization.split(' ');

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if( err ) {
        return res.status(403).send();
      }
      req.user = decoded;
      next();
    });
  }
}