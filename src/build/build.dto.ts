import { Expose } from 'class-transformer';
import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('build')
export class BuildDto {
  @ApiProperty({ readOnly: true })
  @Expose()
  id: string;
  @ApiProperty({
    description: 'Build name',
    example: '1.0 release',
  })
  @Expose()
  name: string;
  @ApiProperty({ readOnly: true })
  @Expose()
  active: boolean;
}
