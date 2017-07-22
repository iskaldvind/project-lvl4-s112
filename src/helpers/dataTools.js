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
  const tagsIds = tags.map(tag => tag.id);
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
    tagsIds,
    createdAt,
    creatorId,
  };
};

export const getQueryParams = query =>
  Object.keys(query).reduce((acc, key) => {
    console.log('&&&&&&&&&&&&&&&&&&&&&&& key:');
    console.log(key);
    if (query[key].split(' ')[0] !== 'All' && query[key] !== '') {
      console.log('======== not All or empty');
      if (key !== 'tagId') {
        console.log('========== not tag ID');
        console.log(acc);
        const fug = { where: {...acc.where, [key]: Number(query[key])}, tag: { ...acc.tags } };
        console.log(fug);
        return { where: {...acc.where, [key]: Number(query[key])}, tag: { ...acc.tags } };
      }
      console.log('========== tag ID');
      console.log(acc);
      const fuk = { where: { ...acc.where }, tag: { [key]: Number(query[key]) }};
      console.log(fuk);
      return { where: { ...acc.where }, tag: { [key]: Number(query[key]) }};
    }
    return acc;
  }, { where: {}, tag: {}});

export const filterByTag = (tasks, tagId) =>
  tasks.filter(task => task.tagsIds.indexOf(tagId) !== -1);
