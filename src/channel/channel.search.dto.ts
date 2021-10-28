import { ApiProperty } from '@nestjs/swagger';

export class ChannelSearchDto {
  applicationId?: string;
  @ApiProperty({ description: 'text to search', required: false })
  readonly text?: string;
  @ApiProperty({ description: 'channel name', required: false })
  readonly name?: string;
}
