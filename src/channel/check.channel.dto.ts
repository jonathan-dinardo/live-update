import { CheckChannelDeviceDto } from './check.channel.device.dto';

export class CheckChannelDto {
  app_id: string;
  channel_name: string;
  manifest: boolean;
  plugin_version: string;
  device: CheckChannelDeviceDto;
}
