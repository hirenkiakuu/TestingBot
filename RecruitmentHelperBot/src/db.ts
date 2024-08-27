import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
    dialect: 'mysql',
    logging: false
});

export async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection to database has been established successfully');
    } catch (err) {
        console.error('Unable to connect to the database', err);
    }
}

export default sequelize;