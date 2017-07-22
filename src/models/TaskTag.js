import Sequelize from 'sequelize';

export default connect => connect.define('Satatus', {
  name: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: true,
    },
  },
}, {
  freezeTableName: true,
  timestamps: false,
});
