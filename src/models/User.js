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
    validate: {
      notEmpty: {
        args: true,
        msg: 'first name cannot be empty',
      },
    },
  },
  lastName: {
    type: Sequelize.STRING,
    field: 'last name cannot be empty',
    validate: {
      notEmpty: {
        args: true,
        msg: 'password cannot be empty',
      },
    },
  },
  password: {
    type: Sequelize.VIRTUAL,
    set: function set(value) {
      this.setDataValue('passwordDigest', encrypt(value));
      this.setDataValue('password', value);
      return value;
    },
    validate: {
      len: {
        args: [3, +Infinity],
        msg: 'password must be at least 3 symbols',
      },
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
