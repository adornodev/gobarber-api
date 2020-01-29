import Sequelize, { Model } from 'sequelize';

class User extends Model {
  static init(connection) {
    // Não é necessário enviar as colunas de PK, FK, created_at, updated_at para o sequelize
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        connection,
      }
    );
  }
}

export default User;
