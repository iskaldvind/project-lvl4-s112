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
    type: Sequelize.STRING,
  },
  status: {
    type: Sequelize.STRING,
    defaultValue: 'open',
    isIn: [['open', 'processing', 'testing', 'closed']],
  },
  creator: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: true,
    },
  },
  assignedTo: {
    type: Sequelize.STRING,
  },
  tags: {
    type: Sequelize.STRING,
  },
}, {
  getterMethods: {
    fullName: function fullName() {
      return `${this.firstName} ${this.lastName}`;
    },
  },
  freezeTableName: true,
});
