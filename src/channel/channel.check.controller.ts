import { Body, Controller, Param, Post } from '@nestjs/common';
import { CheckChannelDto } from './check.channel.dto';
import { CheckChannelResponseDto } from './check.channel.response.dto';
import { ChannelService } from './channel.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller(ChannelCheckController.CHECK_CHANNEL_URL)
export class ChannelCheckController {
  public static CHECK_CHANNEL_URL = 'apps/:appId/channels/check-device';
  constructor(private channelService: ChannelService) {}

  @ApiExcludeEndpoint()
  @Post()
  public async check(
    @Param('appId') applicationId,
    @Body() checkChannelDto: CheckChannelDto,
  ): Promise<CheckChannelResponseDto> {
    return this.channelService.check(
      checkChannelDto.app_id,
      checkChannelDto.channel_name,
      checkChannelDto.device.build,
    );
  }
}
