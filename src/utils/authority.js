import tokenManager from './token';
import { reloadAuthorized } from './Authorized'; // use localStorage to store the authority info, which might be sent from server in actual project.

export function getAuthority(str) {
  const authorityString = 
    typeof str === 'undefined' && tokenManager.get() ? tokenManager.decode(tokenManager.get()).currentAuthority : str; // authorityString could be admin, "admin", ["admin"]

  let authority;

  try {
    if (authorityString) {
      authority = JSON.parse(authorityString);
    }
  } catch (e) {
    authority = authorityString;
  }

  if (typeof authority === 'string') {
    return [authority];
  }

  return authority;
}
export function setAuthority(authority) {
  const Authority = typeof authority === 'string' ? [authority] : authority;

  tokenManager.save(tokenManager.sign(authority));
  reloadAuthorized();
}
