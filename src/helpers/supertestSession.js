import getModels from '../models';
import connect from '../db';

const { User } = getModels(connect);

export default async (email) => {
  const user = await User.findOne({
    where: {
      email,
    },
  });
  const [id, name] = user !== null ? [user.id, user.fullName] : [null, null];
  return { id, name };
};
