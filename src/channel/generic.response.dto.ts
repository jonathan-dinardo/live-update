import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GenericResponseDto {
  @ApiProperty({
    description: 'id',
    example: 'f2519b72-0b62-4c6e-ae3e-45866a3dee1c',
  })
  @Expose()
  id?: string;
}
