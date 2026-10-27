import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config({ path: __dirname + '/../../../.env.development.local' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRESQL_DB_HOST,
  port: Number(process.env.POSTGRESQL_DB_PORT),
  username: process.env.POSTGRESQL_DB_USERNAME,
  password: process.env.POSTGRESQL_DB_PASSWORD,
  database: process.env.DB_NAME,
  /*Указываем путь ко всем сущностям в приложении, так как опция "autoLoadEntities" не работает вне NestJS.*/
  entities: [__dirname + '/../../**/*.entity.ts'],
  /*Указываем папку для миграций.*/
  migrations: [__dirname + '/../*.ts'],
  synchronize: false,
});
