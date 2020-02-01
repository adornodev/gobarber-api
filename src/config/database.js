// sequelize cli não consegue ler como imports
require('dotenv').config();

module.exports = {
  dialect: 'postgres',
  host: process.env.MAIN_DATABASE_HOST,
  username: process.env.MAIN_DATABASE_USER,
  password: process.env.MAIN_DATABASE_PASSWORD,
  database: process.env.MAIN_DATABASE_NAME,
  port: process.env.MAIN_DATABASE_PORT,
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
