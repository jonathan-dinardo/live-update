export class ChannelDataDto {
  available: boolean;
  partial: boolean;
  compatible: boolean;
  incompatibleUpdateAvailable: boolean;
  snapshot: string;
  url?: string;
  build?: string;
}
