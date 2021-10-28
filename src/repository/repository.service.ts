import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { FileRepositoryServiceImpl } from './file-repository-service-impl.service';
import { FileRepositoryInterface } from './file-repository-interface';
@Injectable()
export class RepositoryService {
  constructor(private moduleRef: ModuleRef) {}
  public async publishBundle(
    appId: string,
    channel: string,
    buildId: string,
    buffer: Buffer,
  ) {
    await this.getRepositoryImpl().publishBundle(
      appId,
      channel,
      buildId,
      buffer,
    );
  }
  public async setActiveBuild(appId: string, channel: string, buildId: string) {
    return this.getRepositoryImpl().setActiveBuild(appId, channel, buildId);
  }
  public getResource(appId: string, channel: string, href: string): string {
    return this.getRepositoryImpl().getResource(appId, channel, href);
  }
  deleteBuild(appId: string, channel: string, buildId: string) {
    return this.getRepositoryImpl().deleteBuild(appId, channel, buildId);
  }

  private getRepositoryImpl(): FileRepositoryInterface {
    return this.moduleRef.get(FileRepositoryServiceImpl);
  }
}
