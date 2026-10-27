import { MigrationInterface, QueryRunner } from 'typeorm';

export class TestMigration011793123987621 implements MigrationInterface {
  name = 'TestMigration011793123987621';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sessions" ADD "test" character varying(100)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "test"`);
  }
}
