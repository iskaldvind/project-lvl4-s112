import Sequelize from 'sequelize';

export default connect => connect.define('Tag', {
  name: {
    type: Sequelize.STRING,
    unique: true,
    validate: {
      notEmpty: {
        args: true,
        msg: 'The tag should not be empty.',
      },
    },
  },
}, {
  freezeTableName: true,
  timestamps: false,
});
