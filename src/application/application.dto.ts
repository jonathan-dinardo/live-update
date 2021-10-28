import { Expose } from 'class-transformer';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { EXAMPLE_APPLICATION_ID } from '../functions/constants';
@ApiTags('application')
export class ApplicationDto {
  @ApiProperty({
    readOnly: true,
    description: 'Application id',
    example: EXAMPLE_APPLICATION_ID,
  })
  @Expose()
  @ApiProperty({ readOnly: true })
  id?: string;
  @ApiProperty({
    description: 'Application name',
    example: 'My eshop app',
  })
  @Expose()
  readonly name: string;
  @ApiProperty({ readOnly: true })
  @Expose()
  readonly createdAt?: Date;
  @ApiProperty({ readOnly: true })
  @Expose()
  readonly updatedAt?: Date;
}
