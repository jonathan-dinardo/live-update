import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BuildService } from '../build/build.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ChannelEntity } from './channel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { ChannelSearchDto } from './channel.search.dto';
import { CheckChannelResponseDto } from './check.channel.response.dto';
import { ChannelDto } from './channel.dto';
import { ApplicationEntity } from '../application/application.entity';
import { ChannelInfoDto } from './channel.info.dto';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class ChannelService {
  //'http://app-build.apps.appit-online.de/apps/177bf66b52f040008782c897ef1c8700/Production/2/manifest',

  @InjectRepository(ChannelEntity)
  private channelRepository: Repository<ChannelEntity>;

  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  private readonly resourceUrl: string;

  private readonly updateApi: string;

  private readonly updateMessage: string;

  constructor(private configService: ConfigService, private buildService: BuildService) {
    this.resourceUrl = configService.get('UPDATE_API_RESOURCE_URL');
    this.updateApi = configService.get('UPDATE_API');
    this.updateMessage = configService.get('UPDATE_MESSAGE');
  }

  public async check(appId: string, channelId: string, buildId: string): Promise<CheckChannelResponseDto> {
    const build = await this.buildService.getActiveBuild(appId, channelId);
    const channelDto: CheckChannelResponseDto = this.buildChannelDto();

    if (build && build.id !== buildId) {
      const manifestURL = this.createManifestUrl(appId, channelId, build.id);
      channelDto.data.compatible = true;
      channelDto.data.snapshot = build.id;
      channelDto.data.url = manifestURL;
      channelDto.data.available = true;
      channelDto.data.build = build.id;
    }
    return Promise.resolve(channelDto);
  }

  async search(channelSearchDto: ChannelSearchDto): Promise<ChannelDto[]> {
    let queryBuilder: SelectQueryBuilder<ChannelEntity>;
    queryBuilder = await this.channelRepository
      .createQueryBuilder('channels')
      .innerJoin('channels.application', 'application')
      .where('application.id = :applicationId', {
        applicationId: channelSearchDto.applicationId,
      });
    if (channelSearchDto.name) {
      queryBuilder = queryBuilder.andWhere('channels.name =:name', {
        name: channelSearchDto.name,
      });
    }
    if (channelSearchDto.text) {
      queryBuilder = queryBuilder.andWhere('channels.name like (:text)', {
        text: `%${channelSearchDto.text}%`,
      });
    }
    const result = await queryBuilder.addOrderBy('channels.created_at', 'DESC').getMany();
    return plainToClass(ChannelDto, result, {
      excludeExtraneousValues: true,
    });
  }
  private createManifestUrl(appId: string, channelId: string, buildId: string) {
    let url = `${this.resourceUrl}/pro-manifest.json`;
    url = url.replace('{{updateApi}}', this.updateApi);
    url = url.replace('{{appId}}', appId);
    url = url.replace('{{channelId}}', channelId);
    url = url.replace('{{buildId}}', buildId);
    return url;
  }

  buildChannelDto(): CheckChannelResponseDto {
    return {
      data: {
        available: false,
        partial: false,
        compatible: false,
        incompatibleUpdateAvailable: false,
        snapshot: null,
        url: null,
        build: null,
      },
    };
  }

  async insert(applicationId: string, channelDto: ChannelDto): Promise<ChannelDto> {
    const channelEntity = plainToClass(ChannelEntity, channelDto);
    channelEntity.application = new ApplicationEntity();
    channelEntity.application.id = applicationId;
    const result = await this.channelRepository.save(channelEntity);
    return plainToClass(ChannelDto, result, {
      excludeExtraneousValues: true,
    });
  }

  async update(channelDto: ChannelDto): Promise<ChannelDto> {
    const result = await this.channelRepository
      .createQueryBuilder()
      .update(ChannelEntity)
      .set({ name: channelDto.name })
      .where('id = :id', { id: channelDto.id })
      .andWhere('deletedAt is null')
      .execute();
    return result.affected > 0 ? this.findOne(channelDto.id) : null;
  }

  async delete(id: string): Promise<boolean> {
    const element = await this.channelRepository.findOne(id);
    element && (await this.channelRepository.softDelete(id));
    return Promise.resolve(!!element);
  }

  async findOne(id): Promise<ChannelDto> {
    const result = await this.channelRepository.findOne(id);
    return plainToClass(ChannelDto, result, {
      excludeExtraneousValues: true,
    });
  }

  async getUpdateApi(): Promise<{ url: string }> {
    return {
      url: this.updateApi,
    };
  }

  async getInfo(applicationId: string, channelId: string): Promise<ChannelInfoDto> {
    let message = this.updateMessage;
    message = message.replace('{{updateApi}}', this.updateApi);
    message = message.replace('{{appId}}', applicationId);
    message = message.replace('{{channelId}}', channelId);
    return Promise.resolve({ message: message });
  }
  public async isChannelOfApplication(channelId: string, applicationId: string): Promise<boolean> {
    return (
      (await this.channelRepository
        .createQueryBuilder('channels')
        .innerJoin('channels', 'channel')
        .innerJoin('channel.application', 'application')
        .where('application.id = :applicationId', { applicationId: applicationId })
        .andWhere('channel.id = :channelId', { channelId: channelId })
        .getCount()) > 0
    );
  }
}
