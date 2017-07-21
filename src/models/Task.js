import Sequelize from 'sequelize';

export default connect => connect.define('Task', {
  name: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: {
        args: true,
        msg: 'please enter task name',
      },
    },
  },
  description: {
    type: Sequelize.TEXT,
  },
  statusId: {
    type: Sequelize.INTEGER,
    defaultValue: 1,
    validate: {
      notEmpty: true,
    },
  },
  creatorId: {
    type: Sequelize.INTEGER,
    validate: {
      notEmpty: true,
    },
  },
  assignedToId: {
    type: Sequelize.INTEGER,
    validate: {
      notEmpty: true,
    },
  },
}, {
  getterMethods: {
    statusName: async function statusName() {
      const status = await this.getStatus();
      return status.dataValues.name;
    },
  },
  freezeTableName: true,
});
