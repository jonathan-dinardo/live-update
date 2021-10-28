import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserProvider1613564604858 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE UNIQUE INDEX user_idx_provider ON users (username, gateway)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX user_idx_provider ON users`);
  }
}
