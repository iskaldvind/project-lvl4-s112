import Sequelize from 'sequelize';
import encrypt from '../helpers/secure';

export default connect => connect.define('User', {
  email: {
    type: Sequelize.STRING,
    unique: {
      args: true,
      msg: 'user with this email already registered',
    },
    validate: {
      isEmail: {
        args: true,
        msg: 'email has invalid format',
      },
      notEmpty: {
        args: true,
        msg: 'please enter your email',
      },
    },
  },
  passwordDigest: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: {
        args: true,
        msg: 'password cannot be empty',
      },
    },
  },
  firstName: {
    type: Sequelize.STRING,
    field: 'first_name',
  },
  lastName: {
    type: Sequelize.STRING,
    field: 'last_name',
  },
  password: {
    type: Sequelize.VIRTUAL,
    set: function set(value) {
      this.setDataValue('passwordDigest', encrypt(value));
      this.setDataValue('password', value);
      return value;
    },
    validate: {
      len: [1, +Infinity],
    },
  },
}, {
  getterMethods: {
    fullName: function fullName() {
      return `${this.firstName} ${this.lastName}`;
    },
  },
  freezeTableName: true,
});
