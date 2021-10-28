import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { ServerResponse } from 'http';
import { ChannelService } from '../channel/channel.service';

@Injectable()
export class CheckChannelMiddleware implements NestMiddleware {
  constructor(private channelService: ChannelService) {}

  async use(req: any, res: ServerResponse, next: () => void) {
    const applicationId: string = req.params.appId;
    const channelId = req.params.channelId;
    await this.checkChannel(channelId, applicationId);
    next();
  }
  private async checkChannel(channelId: string, applicationId: string) {
    if (!(await this.channelService.isChannelOfApplication(channelId, applicationId))) {
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
