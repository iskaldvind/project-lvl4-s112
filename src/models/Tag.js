import Sequelize from 'sequelize';

export default connect => connect.define('Tag', {
  name: {
    type: Sequelize.STRING,
    unique: {
      args: true,
      msg: 'tag with this name already exists',
    },
    validate: {
      notEmpty: {
        args: true,
        msg: 'please enter tag name',
      },
    },
  },
}, {
  freezeTableName: true,
  timestamps: false,
});
