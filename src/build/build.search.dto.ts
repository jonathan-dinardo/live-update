import { ApiProperty } from '@nestjs/swagger';

export class BuildSearchDto {
  applicationId?: string;
  channelId?: string;
  @ApiProperty({ description: 'text to search', required: false })
  readonly text?: string;
  @ApiProperty({ description: 'application name', required: false })
  readonly name?: string;
}
