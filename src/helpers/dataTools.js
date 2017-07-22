import _ from 'lodash';

const formatId = id => `${'0'.repeat(6 - id.toString().length)}${id}`;

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
  const createdAt = task.createdAt;
  return {
    id: task.dataValues.id,
    formattedId: formatId(task.dataValues.id),
    name: task.dataValues.name,
    description: task.dataValues.description,
    creator: creator.fullName,
    assignedTo: assignedTo.fullName,
    status: status.name,
    tags: tagsNames,
    createdAt,
    creatorId,
  };
};

export const getQueryParams = query =>
  Object.keys(query).reduce((acc, key) => {
    if (query[key] !== 'All' && query[key] !== '') {
      return { ...acc, [key]: Number(query[key]) };
    }
    return acc;
  }, {});
