import { MigrationInterface, QueryRunner } from 'typeorm';

export class TestMigration021793124058857 implements MigrationInterface {
  name = 'TestMigration021793124058857';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "test"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sessions" ADD "test" character varying(100)`);
  }
}
