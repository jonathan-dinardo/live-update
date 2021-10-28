import { Expose } from 'class-transformer';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
@ApiTags('channel')
export class ChannelDto {
  @ApiProperty({
    description: 'A channel id',
  })
  @Expose()
  @ApiProperty({ readOnly: true })
  id?: string;
  @ApiProperty({
    description: 'Channel name',
    example: 'Production',
  })
  @Expose()
  readonly name?: string;
  @ApiProperty({ readOnly: true })
  @Expose()
  readonly createdAt?: Date;
  @ApiProperty({ readOnly: true })
  @Expose()
  readonly updatedAt?: Date;
}
