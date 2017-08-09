import models from '../models';

const { User } = models;

export default (email) => {
  /*
  const user = await User.findOne({
    where: {
      email,
    },
  });
  */
  const users = User.findAll();
  console.log('KKOKOKOKOKOKOK');
  console.log(users);
  return { userId: user.id, userName: user.fullName };
};
