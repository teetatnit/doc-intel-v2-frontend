import jwt from 'jsonwebtoken';

export default {
  get() {
    return sessionStorage.getItem('sso');
  },
  sign(payload) {
    return jwt.sign(payload, 'scgpopkg', { algorithm: 'HS512', expiresIn: '4h' });
  },
  save(token) {
    sessionStorage.setItem('sso', token);
  },
  decode(token) {
    let payload = [];
    return jwt.verify(token, 'scgpopkg', { algorithms: ['HS512'], maxAge: '4h' }, (err, decode) => {
      if (!err && decode.currentAuthority) {
        // const { currentAuthority, fullname } = decode;
        payload = decode;
      } else {
        this.remove();
      }
      return payload;
    });
  },
  remove() {
    sessionStorage.removeItem('sso');
  },
};
