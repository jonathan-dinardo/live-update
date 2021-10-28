import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ApplicationEntity } from '../application/application.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelEntity } from '../channel/channel.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as chokidar from 'chokidar';
import { BuildService } from '../build/build.service';
import { Inject, OnApplicationBootstrap } from '@nestjs/common';
import { CreateBuildDto } from '../build/create.build.dto';

export class DeployerService implements OnApplicationBootstrap {
  @InjectRepository(ApplicationEntity)
  applicationRepository: Repository<ApplicationEntity>;

  @InjectRepository(ChannelEntity)
  channelRepository: Repository<ChannelEntity>;

  @Inject()
  public buildService: BuildService;

  @Inject()
  public configService: ConfigService;

  private async preparePaths(
    fileRepositoryRootPath: string,
  ): Promise<string[]> {
    const paths = [];
    const applications = await this.applicationRepository.find();
    for (const application of applications) {
      const channels = await application.channels;
      for (const channel of channels) {
        const deployPath = path.join(
          fileRepositoryRootPath,
          'apps',
          application.id,
          'channels',
          channel.id,
          'deploy',
        );
        if (!fs.existsSync(deployPath)) {
          fs.mkdirSync(deployPath, { recursive: true });
        }
        paths.push(deployPath);
        console.log(`Listening on ${deployPath}`);
      }
    }
    return Promise.resolve(paths);
  }

  async onApplicationBootstrap(): Promise<any> {
    const fileRepositoryRootPath = this.configService.get('FILE_REPOSITORY');
    const paths = await this.preparePaths(fileRepositoryRootPath);
    chokidar
      .watch(paths, {
        persistent: true,
        awaitWriteFinish: {
          stabilityThreshold: 3000,
          pollInterval: 500,
        },
      })
      .on('add', async (uploadedFile) => {
        const buffer = fs.readFileSync(uploadedFile);
        fs.unlinkSync(uploadedFile);
        const elements = uploadedFile.split('/');
        const createBuildDto: CreateBuildDto = {
          appId: elements[elements.length - 5],
          channelId: elements[elements.length - 3],
          buffer: buffer,
        };
        const buildDto = await this.buildService.create(createBuildDto);

        await this.buildService.setActiveBuild(
          createBuildDto.appId,
          createBuildDto.channelId,
          buildDto.id,
        );
      });
  }
}
