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
  const assignee = await task.getAssignedTo();
  const assignedTo = assignee.fullName;
  const assignedToId = assignee.id;
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
    status: status.name,
    statusId: status.id,
    tags: tagsNames,
    // make tags as string option
    tagsIds,
    createdAt,
    creatorId,
    assignedToId,
    assignedTo,
  };
};

const getFilterParams = query =>
  Object.keys(query).reduce((acc, key) => {
    if (query[key].split(' ')[0] !== 'All' && query[key] !== '') {
      if (key !== 'tagId') {
        return { where: { ...acc.where, [key]: Number(query[key]) }, tag: { ...acc.tag } };
      }
      return { where: { ...acc.where }, tag: { [key]: Number(query[key]) } };
    }
    return acc;
  }, { where: {}, tag: {} });

const filterByTag = (tasks, tagId) =>
  tasks.filter(task => task.tagsIds.indexOf(tagId) !== -1);

export const filterTasks = async (Task, query = {}) => {
  const { where, tag } = getFilterParams(query);
  const tasksFilteredByWhere = await Task.findAll({ where });
  const formattedTasksData =
    await Promise.all(tasksFilteredByWhere.map(async task => getTaskData(task)));
  return Object.keys(tag).length === 0 ?
    formattedTasksData :
    filterByTag(formattedTasksData, tag.tagId);
};

export const updateTags = async (newTagsNames, Tag, taskObj) => {
  const oldTags = await taskObj.getTags();
  const oldTagsNames = oldTags.map(tagObj => tagObj.name);
  const tagsToDeleteNames = oldTagsNames
    .filter(eachOldTagName => newTagsNames.indexOf(eachOldTagName) === -1);
  await newTagsNames.map(newTagName => Tag.findOne({ where: { name: newTagName } })
    .then(async nextTagObj => (nextTagObj ? taskObj.addTag(nextTagObj) :
      taskObj.createTag({ name: newTagName }))));
  await tagsToDeleteNames.map(deleteTagName => Tag.findOne({ where: { name: deleteTagName } })
    .then(async (nextTagObj) => {
      taskObj.removeTag(nextTagObj);
      const tasksOfDeletedTag = await nextTagObj.getTasks();
      const obsoleteTagObj = await Tag.findOne({ where: { name: nextTagObj.name } });
      const id = obsoleteTagObj.id;
      if (tasksOfDeletedTag.length === 0) {
        await Tag.destroy({ where: { id } });
      }
    }));
};

export const isExist = entity => !(entity === null || entity.createdAt === undefined);
