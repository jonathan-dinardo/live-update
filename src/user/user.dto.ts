import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @Expose()
  @ApiProperty({
    readOnly: true,
    description: 'Username',
    example: 'mario.rossi',
  })
  username?: string;
  @Expose()
  id: string;
}
