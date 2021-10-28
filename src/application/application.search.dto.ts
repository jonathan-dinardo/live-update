import { ApiProperty } from '@nestjs/swagger';

export class ApplicationSearchDto {
  @ApiProperty({ description: 'text to search', required: false })
  text?: string;
  @ApiProperty({ description: 'application name', required: false })
  name?: string;
  userId: string;
}
