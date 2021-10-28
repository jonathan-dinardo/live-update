import { Controller, Get, HttpException, HttpStatus, Req } from '@nestjs/common';
import { UserDto } from './user.dto';
import { Request } from 'express';
import { User } from '../user.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@Controller('profile')
@ApiTags('4.0 - profile')
@ApiResponse({ status: 403, description: 'Forbidden.' })
export class UserController {
  @ApiOperation({
    description: 'Fetch user profile',
    summary: 'Fetch user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'current user profile info',
    isArray: false,
    type: UserDto,
  })
  @Get()
  async currentUser(@Req() req: Request, @User() userDto: UserDto): Promise<UserDto> {
    if (!userDto) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'Not authorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return userDto;
  }
}
