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

export const deleteObsoleteTags = async (Tag) => {
  const tags = await Tag.findAll();
  console.log('RRRRRRRRRRRRRRRRRR all tags:');
  console.log(tags);
  await tags.forEach( async (tag) => {
    console.log('QQQQQQQQQQQQQQ current tag');
    console.log(tag);
    const tasks = await tag.getTasks();
    console.log('OOOOOOOOOOOOOOOOO tag tasks');
    console.log(tasks);
    if (tasks.length === 0) {
      console.log('PPPPPPPPPPPPPPP tasks length:');
      console.log(tasks.length);
      console.log('AAAAAAAAAAAAAA');
      await tag.destroy();
      console.log('BBBBBBBBBBB');
    }
  });
};

export const updateTags = async (tags, Tag, task) => {
  console.log('YYYYYYYYYYYY tags:');
  console.log(tags);
  console.log('IIIIIIIIIIIII task:');
  console.log(task);
  // const currentTaskTags = await task.tags;
  // const deletedTags = await currentTaskTags.filter(currentTag => tags.indexOf(currentTag) === 1);
  console.log('KKKKKKKKKKKKKKKKKKk deleted tags:');
  // console.log(deletedTags);
  await tags.map(tag => Tag.findOne({ where: { name: tag } })
    .then(async result => (result ? task.addTag(result) :
      task.createTag({ name: tag }))));
  console.log('FFFFFFFFFFFFFFFF');
};

export const isExist = entity => !(entity === null || entity.createdAt === undefined);
