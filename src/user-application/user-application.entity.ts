import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { ApplicationEntity } from '../application/application.entity';

@Entity('user_application')
export class UserApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  @Column({
    name: 'id',
    length: 36,
    primary: true,
  })
  id?: string;

  @ManyToOne(
    () => ApplicationEntity,
    (applicationEntity) => applicationEntity.channels,
  )
  @JoinColumn({ name: 'application_id' })
  application: ApplicationEntity;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.userApplications)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
