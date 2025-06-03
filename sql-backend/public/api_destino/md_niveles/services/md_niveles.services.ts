import { NivelCampus } from '../interfaces/md_niveles.interface';
import mssql from 'mssql';
import { dbSettingsMMSQL } from '../../../global/db/mssql_db_config';

export default class MdNivelesService {
  async getAll(): Promise<NivelCampus[]> {
    let data: NivelCampus[] = [];
    const connectionMSSQL = new mssql.ConnectionPool(dbSettingsMMSQL);

    await connectionMSSQL.connect()
      .then(pool => {
        return pool.request().query(`
          SELECT [academico].[aca_niveles_campus].[aca_nic_id], [academico].[aca_niveles_campus].[aca_nic_id_nivel], [academico].[aca_niveles_campus].[aca_nic_id_campus], [academico].[aca_niveles_campus].[aca_nic_desc_nivel], [academico].[aca_niveles_campus].[aca_nic_id_nivel_si]
          FROM [INTEGRACION].[academico].[aca_niveles_campus]
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
            SELECT [academico].[aca_niveles_campus].[aca_nic_id], [academico].[aca_niveles_campus].[aca_nic_id_nivel], [academico].[aca_niveles_campus].[aca_nic_id_campus], [academico].[aca_niveles_campus].[aca_nic_desc_nivel], [academico].[aca_niveles_campus].[aca_nic_id_nivel_si]
            FROM [INTEGRACION].[academico].[aca_niveles_campus]
            WHERE [academico].[aca_niveles_campus].[aca_nic_id] = @ID
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


  async create(data: Omit<NivelCampus, '[academico].[aca_niveles_campus].[aca_nic_id]'>): Promise<void> {
  const connectionMSSQL = new mssql.ConnectionPool(dbSettingsMMSQL);

  await connectionMSSQL.connect()
    .then(pool => {
      return pool.request()
        // Aquí puedes dejar los .input() como marcadores si quieres automatizarlo aún más
        // o bien, que el backend los reemplace por los campos correctos
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


async update(id: number, data: Omit<NivelCampus, '[academico].[aca_niveles_campus].[aca_nic_id]'>): Promise<void> {
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
          WHERE [academico].[aca_niveles_campus].[aca_nic_id] = @ID
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
          WHERE [academico].[aca_niveles_campus].[aca_nic_id] = @ID
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