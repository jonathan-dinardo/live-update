import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertData1613564604860 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO applications (id, name) VALUES( 'cd1bfa80-748f-11eb-9439-0242ac130002', 'demo-app')`,
    );
    await queryRunner.query(
      `INSERT INTO channels (id, name, application_id ) VALUES( 'e5100fdc-748f-11eb-9439-0242ac130002', 'demo-channel', 'cd1bfa80-748f-11eb-9439-0242ac130002')`,
    );

    await queryRunner.query(
      `INSERT INTO users (id, username, gateway, apikey, active ) VALUES( 
            '63b8291c-ada4-11eb-8529-0242ac130003', 
            'admin', 
            'DEFAULT_API',
            'ea1f02a5-e02b-4ffc-9c36-c0f1a2f134c4',
            '1'
            )`,
    );

    await queryRunner.query(
      `INSERT INTO user_application (id, user_id, application_id ) VALUES( 
            'b147a00e-ada4-11eb-8529-0242ac130003', 
            '63b8291c-ada4-11eb-8529-0242ac130003',  
            'cd1bfa80-748f-11eb-9439-0242ac130002' 
            )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM applications WHERE id = 'cd1bfa80-748f-11eb-9439-0242ac130002' )`,
    );
  }
}
