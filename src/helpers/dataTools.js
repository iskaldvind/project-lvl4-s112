import _ from 'lodash';

export const buildFormObj = (object, error = { errors: [] }) => ({
  name: 'form',
  object,
  errors: _.groupBy(error.errors, 'path'),
});

export const extractTaskData = async (task) => {
  const creator = await task.getCreator();
  const creatorId = creator.id;
  const assignedTo = await task.getAssignedTo();
  const status = await task.statusName;
  const tags = await task.getTags();
  const tagsNames = tags.map(tag => tag.name);
  return {
    id: task.dataValues.id,
    name: task.dataValues.name,
    description: task.dataValues.description,
    creator: creator.fullName,
    assignedTo: assignedTo.fullName,
    creatorId,
    status,
    tags,
    tagsNames,
    createdAt,
  };
};