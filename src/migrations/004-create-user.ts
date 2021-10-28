import {
  MigrationInterface,
  QueryRunner,
  Table,
} from 'typeorm';

export class CreateUser1613564604856 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'username',
            type: 'varchar',
            length: '36',
            isPrimary: false,
            generationStrategy: 'uuid',
          },
          {
            name: 'gateway',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'apikey',
            type: 'varchar',
            length: '256',
            isNullable: false,
          },
          {
            name: 'active',
            type: 'boolean',
            isNullable: false,
            default: '1'
          }
        ],
      }),
      false,
    );

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE users`);
  }
}
