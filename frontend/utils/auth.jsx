import Cookies from 'universal-cookie';

const cookies = new Cookies();

export const validateToken = (defaultRoute = null) => (
  (nextState, replace) => (!cookies.get('token') ?
    nextState.location.pathname === '/login' ? null :

    // if no token send to login
    replace({
      pathname: '/login',
    }) :

    // if there is a default route redirect to that
    defaultRoute && replace({
      pathname: defaultRoute,
    })
  )
);

export const logout = (router) => {
  cookies.remove('token');
  cookies.remove('username');
  return router ? router.push('/login') : location.reload();
};

export const login = ({ user, router }) => {
  cookies.set('token', `token ${user.token}`);
  cookies.set('username', user.username);
  router.push('/clients');
};

export const getUser = () => ({
  username: cookies.get('username'),
});

export const getAuth = () => ({
  Authorization: cookies.get('token'),
});

export default {};
