import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class CreateUser1613564604857 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    await  queryRunner.query(`CREATE UNIQUE INDEX user_idx ON users (gateway, apikey)`);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX user_idx ON users`);
  }
}

