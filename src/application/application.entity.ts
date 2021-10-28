import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChannelEntity } from '../channel/channel.entity';
import { UserApplicationEntity } from '../user-application/user-application.entity';

@Entity('applications')
export class ApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  @Column({
    name: 'id',
    length: 36,
    primary: true,
  })
  id?: string;

  @Column({
    name: 'name',
  })
  name: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;

  // Add this column to your entity!
  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt?: Date;

  @OneToMany(() => ChannelEntity, (channel) => channel.application)
  channels: Promise<ChannelEntity[]>;

  @OneToMany(
    () => UserApplicationEntity,
    (userApplication) => userApplication.application,
  )
  userApplications: UserApplicationEntity[];
}
