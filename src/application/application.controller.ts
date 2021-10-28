import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApplicationDto } from './application.dto';
import { ApplicationService } from './application-service';
import { ApplicationSearchDto } from './application.search.dto';
import { checkExists } from '../functions/controller.utils';
import { User } from '../user.decorator';
import { UserDto } from '../user/user.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EXAMPLE_APPLICATION_ID } from '../functions/constants';
import { GenericResponseDto } from '../channel/generic.response.dto';

@ApiTags('1.0 - applications')
@Controller('apps')
@ApiResponse({ status: 403, description: 'Forbidden.' })
export class ApplicationController {
  private static readonly RESOURCE_NAME = 'Application';

  constructor(private applicationService: ApplicationService) {}
  @ApiResponse({
    status: 200,
    description: 'Application list',
    isArray: true,
    type: ApplicationDto,
  })
  @ApiOperation({
    description: 'Fetch all applications',
    summary: 'Fetch all applications',
  })
  @Get('/')
  public async list(
    @Query() applicationSearchDto: ApplicationSearchDto,
    @User() user: UserDto,
  ): Promise<ApplicationDto[]> {
    applicationSearchDto.userId = user.id;
    return this.applicationService.search(applicationSearchDto);
  }
  @ApiOperation({
    description: 'Create a new application',
    summary: 'Create a new application',
  })
  @ApiResponse({
    status: 201,
    description: 'The application has been successfully created.',
    type: ApplicationDto,
  })
  @Post('/')
  public async post(@Body() applicationDto: ApplicationDto, @User() user: UserDto): Promise<ApplicationDto> {
    return await this.applicationService.insert(user, applicationDto);
  }
  @ApiOperation({
    description: 'Fetch an application',
    summary: 'Fetch an application',
  })
  @ApiResponse({
    status: 200,
    description: 'The application has found.',
    type: ApplicationDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Application id',
    type: 'string',
    example: EXAMPLE_APPLICATION_ID,
  })
  @Get('/:id')
  public async get(@Param('id') id): Promise<ApplicationDto> {
    const result = await this.applicationService.findOne(id);
    checkExists(result, ApplicationController.RESOURCE_NAME, id);
    return Promise.resolve(result);
  }
  @ApiOperation({
    description: 'Delete an application',
    summary: 'Delete an application',
  })
  @ApiResponse({
    status: 200,
    description: 'id of application deleted',
    type: GenericResponseDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Application id',
    type: 'string',
    example: EXAMPLE_APPLICATION_ID,
  })
  @Delete('/:id')
  public async delete(@Param('id') id): Promise<GenericResponseDto> {
    const result = await this.applicationService.delete(id);
    checkExists(result, ApplicationController.RESOURCE_NAME, id);
    return Promise.resolve({ id: id });
  }
  @ApiOperation({
    description: 'Update an application',
    summary: 'Update an application',
  })
  @ApiResponse({
    status: 200,
    description: 'updated application',
    type: ApplicationDto,
  })
  @Put('/:id')
  @ApiParam({
    name: 'id',
    description: 'Application id',
    type: 'string',
    example: EXAMPLE_APPLICATION_ID,
  })
  public async put(@Param('id') id, @Body() applicationDto: ApplicationDto): Promise<ApplicationDto> {
    applicationDto.id = id;
    const result = await this.applicationService.update(applicationDto);
    checkExists(result, ApplicationController.RESOURCE_NAME, id);
    return Promise.resolve(result);
  }
}
