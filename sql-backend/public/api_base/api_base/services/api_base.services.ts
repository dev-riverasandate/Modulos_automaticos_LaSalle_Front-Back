import { NivelCampus } from '../interfaces/[nom_proy].interface';
import mssql from 'mssql';
import { dbSettingsMMSQL } from '../../../global/db/mssql_db_config';

export default class ApiBaseService {
  async getAll(): Promise<NivelCampus[]> {
    let data: NivelCampus[] = [];
    const connectionMSSQL = new mssql.ConnectionPool(dbSettingsMMSQL);

    await connectionMSSQL.connect()
      .then(pool => {
        return pool.request().query(`
          SELECT [COLUMNS]
          FROM [[DATABASE]].[[TABLE_SCHEMA]].[[TABLE_NAME]]
        `);
      })
      .then(result => {
        data = result.recordset;
      })
      .catch(err => {
        console.log("ERROR:", err);
        throw err;
      })
      .finally(() => {
        connectionMSSQL.close();
      });

    return data;
}

  async getById(id: number): Promise<NivelCampus | null> {
    let data: NivelCampus | null = null;
    const connectionMSSQL = new mssql.ConnectionPool(dbSettingsMMSQL);

    await connectionMSSQL.connect()
      .then(pool => {
        return pool.request()
          .input('ID', mssql.Int, id)
          .query(`
            SELECT [COLUMNS]
            FROM [[DATABASE]].[[TABLE_SCHEMA]].[[TABLE_NAME]]
            WHERE [ID_COLUMN] = @ID
          `);
      })
      .then(result => {
        if (result.recordset.length > 0) {
          data = result.recordset[0];
        }
      })
      .catch(err => {
        console.log("ERROR:", err);
        throw err;
      })
      .finally(() => {
        connectionMSSQL.close();
      });

    return data;
  }


  async create(data: Omit<NivelCampus, '[ID_COLUMN]'>): Promise<void> {
  const connectionMSSQL = new mssql.ConnectionPool(dbSettingsMMSQL);

  await connectionMSSQL.connect()
    .then(pool => {
      return pool.request()
        // Aquí puedes dejar los .input() como marcadores si quieres automatizarlo aún más
        // o bien, que el backend los reemplace por los campos correctos
        [INPUTS]
        .query(`
          INSERT INTO [[DATABASE]].[[TABLE_SCHEMA]].[[TABLE_NAME]]
          ([INSERT_COLUMNS])
          VALUES ([INSERT_VALUES])
        `);
    })
    .catch(err => {
      console.log("ERROR:", err);
      throw err;
    })
    .finally(() => {
      connectionMSSQL.close();
    });
}


async update(id: number, data: Omit<NivelCampus, '[ID_COLUMN]'>): Promise<void> {
  const connectionMSSQL = new mssql.ConnectionPool(dbSettingsMMSQL);

  await connectionMSSQL.connect()
    .then(pool => {
      return pool.request()
        .input('ID', mssql.Int, id)
        [INPUTS]
        .query(`
          UPDATE [[DATABASE]].[[TABLE_SCHEMA]].[[TABLE_NAME]]
          SET [UPDATE_SET]
          WHERE [ID_COLUMN] = @ID
        `);
    })
    .catch(err => {
      console.log("ERROR:", err);
      throw err;
    })
    .finally(() => {
      connectionMSSQL.close();
    });
}

async delete(id: number): Promise<void> {
  const connectionMSSQL = new mssql.ConnectionPool(dbSettingsMMSQL);

  await connectionMSSQL.connect()
    .then(pool => {
      return pool.request()
        .input('ID', mssql.Int, id)
        .query(`
          DELETE FROM [[DATABASE]].[[TABLE_SCHEMA]].[[TABLE_NAME]]
          WHERE [ID_COLUMN] = @ID
        `);
    })
    .catch(err => {
      console.log("ERROR:", err);
      throw err;
    })
    .finally(() => {
      connectionMSSQL.close();
    });
}
}