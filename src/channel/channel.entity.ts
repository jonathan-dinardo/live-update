import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BuildEntity } from '../build/build.entity';
import { ApplicationEntity } from '../application/application.entity';

@Entity('channels')
export class ChannelEntity {
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

  @OneToMany(() => BuildEntity, (build) => build.channel)
  builds: Promise<BuildEntity[]>;

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

  @ManyToOne(
    () => ApplicationEntity,
    (applicationEntity) => applicationEntity.channels,
  )
  @JoinColumn({ name: 'application_id' })
  application: ApplicationEntity;
}
