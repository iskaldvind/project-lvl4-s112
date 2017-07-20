import Sequelize from 'sequelize';

export default connect => connect.define('TaskStatus', {
  name: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: {
        args: true,
        msg: 'please enter your email',
      },
      isIn: [['open', 'processing', 'testing', 'closed']],
    },
  },
}, {
  freezeTableName: true,
});
