import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserApplicationEntity } from '../user-application/user-application.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  @Column({
    name: 'id',
    length: 36,
    primary: true,
  })
  id?: string;

  @Column({
    name: 'username',
  })
  username: string;

  @Column({
    name: 'gateway',
  })
  gateway: string;

  @Column({
    name: 'apikey',
  })
  apikey: string;

  @OneToMany(() => UserApplicationEntity, (userApplicationEntity) => userApplicationEntity.user)
  userApplications: Promise<UserApplicationEntity[]>
}
