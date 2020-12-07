import Cookies from 'universal-cookie';

const cookies = new Cookies();

export const isLoggedIn = () => (
  Boolean(cookies.get('token'))
);

export const logout = (router) => {
  cookies.remove('token');
  cookies.remove('username');
  return router ? router.push('/login') : location.reload();
};

export const login = ({ user }) => {
  cookies.set('token', `token ${user.token}`);
  cookies.set('username', user.username);
};

export const getUser = () => ({
  username: cookies.get('username'),
});

export const getAuth = () => ({
  Authorization: cookies.get('token'),
});

export default {};
