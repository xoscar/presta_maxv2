import Rest from '../utils/rest';
import { logout } from '../utils/auth';

// static
const rest = Rest({ resource: `${process.env.BASE_URL}/users`, onFailAuth: logout });

const User = info => ({
  ...info,
});

User.login = async (body) => {
  const { data } = await rest.send({ url: `${process.env.BASE_URL}/users/login`, method: 'POST', body, redirect: false });

  return data;
};

export default User;
