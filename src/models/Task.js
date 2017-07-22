import Sequelize from 'sequelize';

export default connect => connect.define('Task', {
  name: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: {
        args: true,
        msg: 'The name of task should not be empty.',
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
      notEmpty: {
        args: true,
        msg: 'The status should not be empty.',
      },
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
      notEmpty: {
        args: true,
        msg: 'The assignedTo should not be empty.',
      },
    },
  },
}, {
  freezeTableName: true,
});