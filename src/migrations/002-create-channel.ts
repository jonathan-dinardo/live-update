import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateChannel1613564604854 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'channels',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'DATETIME',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'DATETIME',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'DATETIME',
            isNullable: true,
          },
          {
            name: 'application_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
        ],
      }),
      false,
    );

    await queryRunner.createForeignKey(
      'channels',
      new TableForeignKey({
        columnNames: ['application_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'applications',
        onDelete: 'cascade',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE channels`);
  }
}
