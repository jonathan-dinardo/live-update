import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseBoolPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BuildService } from './build.service';
import { CreateBuildDto } from './create.build.dto';
import { GenericResponseDto } from '../channel/generic.response.dto';
import { checkExists } from '../functions/controller.utils';
import { BuildSearchDto } from './build.search.dto';
import { BuildDto } from './build.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApplicationDto } from '../application/application.dto';
import {
  EXAMPLE_APPLICATION_ID,
  EXAMPLE_BUILD_ID,
  EXAMPLE_BUILD_NAME,
  EXAMPLE_CHANNEL_ID,
} from '../functions/constants';

@ApiTags('3.0 - builds')
@ApiResponse({ status: 403, description: 'Forbidden.' })
@Controller('apps/:appId/channels/:channelId/builds')
export class BuildController {
  private static readonly RESOURCE_NAME = 'Build';
  constructor(private buildService: BuildService) {}

  @ApiOperation({
    description: 'Fetch all builds',
    summary: 'Fetch all builds of a specific application and channel',
  })
  @ApiResponse({
    status: 200,
    description: 'Build list',
    isArray: true,
    type: ApplicationDto,
  })
  @ApiParam({
    name: 'name',
    description: 'name',
    type: 'string',
    example: EXAMPLE_BUILD_NAME,
    required: false,
  })
  @ApiParam({
    name: 'text',
    description: 'text',
    type: 'string',
    required: false,
  })
  @ApiParam({
    name: 'channelId',
    description: 'Channel id',
    type: 'string',
    example: EXAMPLE_CHANNEL_ID,
    required: true,
  })
  @ApiParam({
    name: 'appId',
    description: 'Application id',
    type: 'string',
    example: EXAMPLE_APPLICATION_ID,
    required: true,
  })
  @Get()
  public async list(
    @Param('appId') applicationId,
    @Param('channelId') channelId,
    @Query() buildSearchDto: BuildSearchDto,
  ): Promise<BuildDto[]> {
    buildSearchDto.applicationId = applicationId;
    buildSearchDto.channelId = channelId;
    return await this.buildService.search(buildSearchDto);
  }

  @ApiOperation({
    description: 'Create a new build for a specific application and channel',
    summary: 'Create a new build',
  })
  @ApiResponse({
    status: 201,
    description: 'The build has been successfully created.',
    type: ApplicationDto,
  })
  @ApiParam({
    name: 'channelId',
    description: 'Channel id',
    type: 'string',
    required: true,
    example: EXAMPLE_CHANNEL_ID,
  })
  @ApiParam({
    name: 'appId',
    description: 'Application id',
    type: 'string',
    required: true,
    example: EXAMPLE_APPLICATION_ID,
  })
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        name: {
          type: 'string',
          example: EXAMPLE_BUILD_NAME,
        },
        active: {
          type: 'string',
        },
        replaceActive: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('appId') appId,
    @Param('channelId') channelId,
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name,
    @Body('active', new DefaultValuePipe('true'), new ParseBoolPipe())
    active = true,
    @Body('replaceActive', new DefaultValuePipe('false'), new ParseBoolPipe())
    replaceActive = false,
  ): Promise<GenericResponseDto> {
    if (!file) {
      throw new HttpException('file parameter is mandatory', HttpStatus.FORBIDDEN);
    }
    const buffer: Buffer = file.buffer;
    const createBuildDto = new CreateBuildDto();
    createBuildDto.buffer = buffer;
    createBuildDto.appId = appId;
    createBuildDto.channelId = channelId;
    createBuildDto.name = name;
    const buildDto = await this.buildService.create(createBuildDto);
    if (replaceActive) {
      const lastBuild = await this.buildService.getActiveBuild(appId, channelId);
      if (lastBuild) {
        await this.buildService.delete(lastBuild.id);
      }
    }

    if (active) {
      await this.buildService.setActiveBuild(appId, channelId, buildDto.id);
    }
    return Promise.resolve({ id: buildDto.id });
  }

  @ApiOperation({
    description: 'Update a build for a specific application and channel',
    summary: 'Update a build',
  })
  @ApiResponse({
    status: 200,
    description: 'The build has been successfully updated.',
    type: ApplicationDto,
  })
  @ApiParam({
    name: 'channelId',
    description: 'Channel id',
    type: 'string',
    required: true,
    example: EXAMPLE_CHANNEL_ID,
  })
  @ApiParam({
    name: 'appId',
    description: 'Application id',
    type: 'string',
    required: true,
    example: EXAMPLE_APPLICATION_ID,
  })
  @ApiParam({
    name: 'name',
    description: 'Build name',
    type: 'string',
    required: false,
    example: EXAMPLE_BUILD_NAME,
  })
  @Put('/:buildId')
  public async put(
    @Param('appId') appId,
    @Param('channelId') channelId,
    @Param('buildId') buildId,
    @Body() buildDto: BuildDto,
  ): Promise<GenericResponseDto> {
    buildDto.id = buildId;
    const result = await this.buildService.update(buildDto);
    checkExists(result, BuildController.RESOURCE_NAME, buildId);
    return Promise.resolve({ id: appId });
  }

  @ApiOperation({
    description: 'Fetch a build of a specific application and channel',
    summary: 'Fetch a build',
  })
  @ApiResponse({
    status: 200,
    description: 'the build',
    type: BuildDto,
  })
  @ApiParam({
    name: 'channelId',
    description: 'Channel id',
    type: 'string',
    example: EXAMPLE_CHANNEL_ID,
  })
  @ApiParam({
    name: 'appId',
    description: 'Application id',
    type: 'string',
    example: EXAMPLE_APPLICATION_ID,
  })
  @ApiParam({
    name: 'buildId',
    description: 'Build id',
    type: 'string',
    example: EXAMPLE_BUILD_ID,
  })
  @Get('/:buildId')
  public async get(@Param('buildId') id): Promise<BuildDto> {
    const result = await this.buildService.findOne(id);
    checkExists(result, BuildController.RESOURCE_NAME, id);
    return Promise.resolve(result);
  }

  @ApiOperation({
    description: 'Activate a build of a specific application and channel',
    summary: 'Activate a build',
  })
  @ApiResponse({
    status: 200,
    description: 'the active build id',
    type: GenericResponseDto,
  })
  @ApiParam({
    name: 'appId',
    description: 'Application id',
    type: 'string',
    example: EXAMPLE_APPLICATION_ID,
  })
  @ApiParam({
    name: 'appId',
    description: 'Channel id',
    type: 'string',
    example: EXAMPLE_CHANNEL_ID,
  })
  @ApiParam({
    name: 'buildId',
    description: 'Build id',
    type: 'string',
    example: EXAMPLE_BUILD_ID,
  })
  @Put(':buildId/active')
  async activeBuild(
    @Param('appId') appId,
    @Param('channelId') channelId,
    @Param('buildId') buildId: string,
  ): Promise<GenericResponseDto> {
    await this.buildService.setActiveBuild(appId, channelId, buildId);
    return Promise.resolve({ id: buildId });
  }
  @ApiOperation({
    description: 'Delete a build of a specific application and channel',
    summary: 'Delete a build',
  })
  @ApiResponse({
    status: 200,
    description: 'id of build deleted',
    type: GenericResponseDto,
  })
  @ApiParam({
    name: 'appId',
    description: 'Application id',
    type: 'string',
    example: EXAMPLE_APPLICATION_ID,
  })
  @ApiParam({
    name: 'appId',
    description: 'Channel id',
    type: 'string',
    example: EXAMPLE_CHANNEL_ID,
  })
  @ApiParam({
    name: 'buildId',
    description: 'Build id',
    type: 'string',
    example: EXAMPLE_BUILD_ID,
  })
  @Delete('/:buildId')
  public async delete(@Param('buildId') buildId): Promise<GenericResponseDto> {
    const result = await this.buildService.delete(buildId);
    checkExists(result, BuildController.RESOURCE_NAME, buildId);
    return Promise.resolve({ id: buildId });
  }
}
