import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChannelEntity } from '../channel/channel.entity';

@Entity('builds')
export class BuildEntity {
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

  @Column({
    name: 'active',
  })
  active: boolean;

  @ManyToOne(() => ChannelEntity, (channel) => channel.builds)
  @JoinColumn({ name: 'channel_id' })
  channel: ChannelEntity;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt?: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt?: Date;
}
