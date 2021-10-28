import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuildEntity } from './build.entity';
import { BuildDto } from './build.dto';
import { plainToClass } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { getConnection, Repository, SelectQueryBuilder } from 'typeorm';
import { ChannelEntity } from '../channel/channel.entity';
import { CreateBuildDto } from './create.build.dto';
import { ManifestDto } from './manifest.dto';
import * as md5 from 'md5-file';
import { RepositoryService } from '../repository/repository.service';
import { BuildSearchDto } from './build.search.dto';
import { UserEntity } from '../user/user.entity';
@Injectable()
export class BuildService {
  constructor(configService: ConfigService, private repositoryService: RepositoryService) {}

  @InjectRepository(BuildEntity)
  buildRepository: Repository<BuildEntity>;

  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  async search(buildSearchDto: BuildSearchDto): Promise<BuildDto[]> {
    let queryBuilder: SelectQueryBuilder<BuildEntity>;
    queryBuilder = await this.buildRepository
      .createQueryBuilder('builds')
      .innerJoin('builds.channel', 'channel')
      .innerJoin('channel.application', 'application')
      .where('application.id = :applicationId', {
        applicationId: buildSearchDto.applicationId,
      })
      .andWhere('channel.id = :channelId', {
        channelId: buildSearchDto.channelId,
      });
    if (buildSearchDto.name) {
      queryBuilder = queryBuilder.andWhere('builds.name =:name', {
        name: buildSearchDto.name,
      });
    }
    if (buildSearchDto.text) {
      queryBuilder = queryBuilder.andWhere('builds.name like (:text)', {
        text: `%${buildSearchDto.text}%`,
      });
    }
    const result = await queryBuilder.addOrderBy('builds.created_at', 'DESC').getMany();
    return plainToClass(BuildDto, result);
  }
  public async getActiveBuild(applicationId: string, channelId: string): Promise<BuildDto> {
    const buildEntity = await this.buildRepository
      .createQueryBuilder('builds')
      .innerJoin('builds.channel', 'channel')
      .innerJoin('channel.application', 'application')
      .where('application.id = :applicationId', {
        applicationId: applicationId,
      })
      .andWhere('channel.id = :channelId', { channelId: channelId })
      .andWhere('builds.active = :active', {
        active: true,
      })
      .getOne();
    return plainToClass(BuildDto, buildEntity, {
      excludeExtraneousValues: true,
    });
  }

  public async create(createChannelDto: CreateBuildDto): Promise<BuildDto> {
    return await getConnection().transaction(async (tx) => {
      const channelEntity: ChannelEntity = await tx.findOne(ChannelEntity, createChannelDto.channelId);
      const build: BuildEntity = {
        channel: channelEntity,
        active: false,
        name: '',
      };
      await tx.insert(BuildEntity, build);
      build.name = createChannelDto.name ? createChannelDto.name : build.id;
      await tx.save(BuildEntity, build);

      await this.repositoryService.publishBundle(
        createChannelDto.appId,
        createChannelDto.channelId,
        build.id,
        createChannelDto.buffer,
      );
      const result = plainToClass(BuildDto, build, {
        excludeExtraneousValues: true,
      });
      return Promise.resolve(result);
    });
  }

  public async setActiveBuild(appId: string, channelId: string, buildId: string): Promise<void> {
    await getConnection().transaction(async (tx) => {
      const channelEntity: ChannelEntity = await tx.findOne(ChannelEntity, channelId);
      const builds = await channelEntity.builds;
      for (const build of builds) {
        build.active = build.id === buildId;
        await tx.save(BuildEntity, build);
      }
      await this.repositoryService.setActiveBuild(appId, channelId, buildId);
    });
  }
  async update(buildDto: BuildDto): Promise<boolean> {
    const result = await this.buildRepository
      .createQueryBuilder()
      .update(BuildEntity)
      .set({ name: buildDto.name })
      .where('id = :id', { id: buildDto.id })
      .execute();
    return Promise.resolve(result.affected > 0);
  }

  public async delete(id: string): Promise<boolean> {
    return await getConnection().transaction(async (tx) => {
      const buildEntity = await tx
        .getRepository(BuildEntity)
        .createQueryBuilder('builds')
        .innerJoinAndMapOne('builds.channel', 'builds.channel', 'channels')
        .innerJoinAndMapOne('channels.application', 'channels.application', 'applications')
        .andWhere('builds.id = :id', { id: id })
        .getOne();

      if (!buildEntity) {
        return Promise.resolve(false);
      }
      await this.buildRepository.delete(id);
      this.repositoryService.deleteBuild(buildEntity.channel.application.id, buildEntity.channel.id, buildEntity.id);
      return Promise.resolve(true);
    });
  }

  private readonly PRO_MANIFEST_FILE = 'pro-manifest.json';

  async appendManifestFile(manifestFile: string) {
    const md5File = md5.sync(manifestFile);
    const stats = fs.statSync(manifestFile);
    const resultAsJson = fs.readFileSync(manifestFile).toString();
    const result: ManifestDto[] = JSON.parse(resultAsJson);
    result.push({
      size: stats.size,
      href: this.PRO_MANIFEST_FILE,
      integrity: `${md5File}`,
    });
    fs.writeFileSync(manifestFile, JSON.stringify(result));
  }

  async findOne(id): Promise<BuildDto> {
    const result = await this.buildRepository.findOne(id);
    return plainToClass(BuildDto, result, {
      excludeExtraneousValues: true,
    });
  }

  async isBuildOfChannel(buildId: string, channelId: string) {
    return (
      (await this.buildRepository
        .createQueryBuilder('builds')
        .innerJoin('builds.channel', 'channel')
        .where('builds.id = :buildId', { buildId: buildId })
        .andWhere('channel.id = :channelId', { channelId: channelId })
        .getCount()) > 0
    );
  }
}
