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

export const updateTags = async (tags, Tag, task) => {
  const currentTaskTags = await task.getTags();
  const removingTagNames = currentTaskTags.map(tag => tag.name);
  const deletedTags = removingTagNames.filter(currentTag => tags.indexOf(currentTag) === -1);
  await tags.map(tag => Tag.findOne({ where: { name: tag } })
    .then(async result => (result ? task.addTag(result) :
      task.createTag({ name: tag }))));
  await deletedTags.map(tag => Tag.findOne({ where: { name: tag } })
    .then(async result => {
      task.removeTag(result);
      const tasksStillWithTag = await result.getTasks();
      const obsoleteTag = await Tag.findOne({ where: { name: result.name } });
      const id = obsoleteTag.id;
      if (tasksStillWithTag.length === 0) {
        await Tag.destroy({ where: { id } });
      }
    }));
};

export const isExist = entity => !(entity === null || entity.createdAt === undefined);
