import * as path from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { ZipBundleService } from '../build/zip.bundle.service';
import * as extract from 'extract-zip';
import { emptyDir, mkdir } from '../functions/filesystem';
import { FileRepositoryInterface } from './file-repository-interface';

@Injectable()
export class FileRepositoryServiceImpl implements FileRepositoryInterface {
  private readonly fileRepositoryRootPath: string;

  constructor(
    configService: ConfigService,
    private zipBundleService: ZipBundleService,
  ) {
    this.fileRepositoryRootPath = configService.get('FILE_REPOSITORY');
  }

  public async publishBundle(
    appId: string,
    channel: string,
    buildId: string,
    buffer: Buffer,
  ) {
    const temp_zipFile = await this.zipBundleService.bundleZip(buffer);
    const builds_dir = this.resolvePath(appId, channel, 'builds');
    mkdir(builds_dir);
    const target_file = path.join(builds_dir, `${buildId}.zip`);
    fs.renameSync(temp_zipFile, target_file);
  }

  public getResource(appId: string, channel: string, href: string): string {
    const builds_dir = this.resolvePath(appId, channel, 'builds');
    const activeBuildDir = path.join(builds_dir, 'active');
    return path.join(activeBuildDir, href);
  }

  public async setActiveBuild(appId: string, channel: string, buildId: string) {
    const builds_dir = this.resolvePath(appId, channel, 'builds');
    const activeBuildDir = path.join(builds_dir, 'active');
    emptyDir(activeBuildDir);
    const source_file = path.join(builds_dir, `${buildId}.zip`);
    return await extract(source_file, { dir: activeBuildDir });
  }

  private resolvePath(
    appId: string,
    channelId: string,
    buildPath?: string,
  ): string {
    const channelPath = path.join(
      this.fileRepositoryRootPath,
      'apps',
      appId,
      'channels',
      channelId,
    );
    return buildPath ? path.join(channelPath, buildPath) : channelPath;
  }
  deleteBuild(appId: string, channel: string, buildId: string) {
    const builds_dir = this.resolvePath(appId, channel, 'builds');
    const target_file = path.join(builds_dir, `${buildId}.zip`);
    try {
      fs.unlinkSync(target_file);
    } catch (e) {
      console.warn(e);
    }
  }
}
