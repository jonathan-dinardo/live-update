import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { ServerResponse } from 'http';
import { BuildService } from '../build/build.service';

@Injectable()
export class CheckBuildMiddleware implements NestMiddleware {
  constructor(private buildService: BuildService) {}

  async use(req: any, res: ServerResponse, next: () => void) {
    const channelId = req.params.channelId;
    const buildId = req.params.buildId;
    await this.checkBuild(buildId, channelId);
    next();
  }
  private async checkBuild(buildId: string, channelId: string) {
    if (!(await this.buildService.isBuildOfChannel(buildId, channelId))) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
