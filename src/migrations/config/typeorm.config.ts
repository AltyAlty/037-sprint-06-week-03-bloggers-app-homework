import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

export const AppDataSource = new DataSource({
  type: process.env.POSTGRESQL_DB_TYPE as 'postgres',
  host: process.env.POSTGRESQL_DB_HOST,
  port: Number(process.env.POSTGRESQL_DB_PORT),
  username: process.env.POSTGRESQL_DB_USERNAME,
  password: process.env.POSTGRESQL_DB_PASSWORD,
  database: process.env.DB_NAME,
  /*Указываем путь ко всем сущностям в приложении, так как опция "autoLoadEntities" не работает вне NestJS.*/
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  /*Указываем папку для миграций.*/
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
});
