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
            SELECT aca_nic_id, aca_nic_id_nivel, aca_nic_id_campus, aca_nic_desc_nivel, aca_nic_id_nivel_si
            FROM [INTEGRACION].[academico].[aca_niveles_campus]
            WHERE aca_nic_id = @ID
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

  async create(data: Omit<NivelCampus, 'aca_nic_id'>): Promise<void> {
    const connectionMSSQL = new mssql.ConnectionPool(dbSettingsMMSQL);

    await connectionMSSQL.connect()
      .then(pool => {
        return pool.request()
          .input('aca_nic_id_nivel', mssql.Int, data.aca_nic_id_nivel)
          .input('aca_nic_id_campus', mssql.Int, data.aca_nic_id_campus)
          .input('aca_nic_desc_nivel', mssql.VarChar, data.aca_nic_desc_nivel)
          .input('aca_nic_id_nivel_si', mssql.Int, data.aca_nic_id_nivel_si)
          .query(`
            INSERT INTO [INTEGRACION].[academico].[aca_niveles_campus]
            (aca_nic_id_nivel, aca_nic_id_campus, aca_nic_desc_nivel, aca_nic_id_nivel_si)
            VALUES (@aca_nic_id_nivel, @aca_nic_id_campus, @aca_nic_desc_nivel, @aca_nic_id_nivel_si)
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

  async update(id: number, data: Omit<NivelCampus, 'aca_nic_id'>): Promise<void> {
    const connectionMSSQL = new mssql.ConnectionPool(dbSettingsMMSQL);

    await connectionMSSQL.connect()
      .then(pool => {
        return pool.request()
          .input('ID', mssql.Int, id)
          .input('aca_nic_id_nivel', mssql.Int, data.aca_nic_id_nivel)
          .input('aca_nic_id_campus', mssql.Int, data.aca_nic_id_campus)
          .input('aca_nic_desc_nivel', mssql.VarChar, data.aca_nic_desc_nivel)
          .input('aca_nic_id_nivel_si', mssql.Int, data.aca_nic_id_nivel_si)
          .query(`
            UPDATE [INTEGRACION].[academico].[aca_niveles_campus]
            SET aca_nic_id_nivel = @aca_nic_id_nivel,
                aca_nic_id_campus = @aca_nic_id_campus,
                aca_nic_desc_nivel = @aca_nic_desc_nivel,
                aca_nic_id_nivel_si = @aca_nic_id_nivel_si
            WHERE aca_nic_id = @ID
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
            DELETE FROM [INTEGRACION].[academico].[aca_niveles_campus]
            WHERE aca_nic_id = @ID
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