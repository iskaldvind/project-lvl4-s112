import _ from 'lodash';
import dateFormat from 'dateformat';

export const buildFormObj = (object, error = { errors: [] }) => ({
  name: 'form',
  object,
  errors: _.groupBy(error.errors, 'path'),
});

export const getTaskData = async (task) => {
  const creator = await task.getCreator();
  const creatorId = creator.id;
  const assignedTo = await task.getAssignedTo();
  const status = await task.getStatus();
  const tags = await task.getTags();
  const tagsNames = tags.map(tag => tag.name);
  const createdAtLong = task.createdAt;
  const createdAtShort = dateFormat(createdAtLong, 'isoUtcDateTime');
  return {
    id: task.dataValues.id,
    name: task.dataValues.name,
    description: task.dataValues.description,
    creator: creator.fullName,
    assignedTo: assignedTo.fullName,
    status: status.name,
    tags: tagsNames,
    createdAt: createdAtShort,
    creatorId,
  };
};

export const getUserData = (user) => {
  const createdAtLong = user.dataValues.createdAt;
  const createdAtShort = dateFormat(createdAtLong, 'isoUtcDateTime');
  return {
    fullName: user.fullName,
    email: user.dataValues.email,
    createdAt: createdAtShort,
  };
};

export const getQueryParams = query =>
  Object.keys(query).reduce((acc, key) => {
    if (query[key] !== 'All' && query[key] !== '') {
      return { ...acc, [key]: Number(query[key]) };
    }
    return acc;
  }, {});
