import Sequelize from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();
const pgUri = 'postgres://ruxycfchvyavxx:81e4ec2c1fe618f31b69f05e5abe6cc40607897c2e1038b9353035375365123c@ec2-54-225-71-119.compute-1.amazonaws.com:5432/den7qhvrnm0ibd';
export default new Sequelize(process.env.DATABASE_URL || pgUri);
