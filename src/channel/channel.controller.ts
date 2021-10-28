import { Controller, Get, Param, Post, Body, Query, Put, Delete, Header } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelSearchDto } from './channel.search.dto';
import { ChannelDto } from './channel.dto';
import { checkExists } from '../functions/controller.utils';
import { GenericResponseDto } from './generic.response.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApplicationDto } from '../application/application.dto';
import { EXAMPLE_APPLICATION_ID, EXAMPLE_CHANNEL_ID } from '../functions/constants';

@ApiTags('2.0 - channels')
@Controller('/apps/:appId/channels')
@ApiResponse({ status: 403, description: 'Forbidden.' })
export class ChannelController {
  private static readonly RESOURCE_NAME = 'Channel';

  constructor(private channelService: ChannelService) {}

  @ApiResponse({
    status: 200,
    description: 'A channel list',
    isArray: true,
    type: ChannelDto,
  })
  @ApiOperation({
    description: 'Fetch all channels of a specific application',
    summary: 'Fetch all channels',
  })
  @ApiParam({
    name: 'appId',
    description: 'Application id',
    type: 'string',
    example: EXAMPLE_APPLICATION_ID,
  })
  @Get()
  public async list(@Param('appId') applicationId, @Query() channelSearchDto: ChannelSearchDto): Promise<ChannelDto[]> {
    channelSearchDto.applicationId = applicationId;
    return await this.channelService.search(channelSearchDto);
  }

  @ApiOperation({
    description: 'Create a new channel for a specific application',
    summary: 'Create a new channel',
  })
  @ApiResponse({
    status: 201,
    description: 'The channel has been successfully created.',
    type: ApplicationDto,
  })
  @ApiParam({
    name: 'appId',
    description: 'Application id',
    type: 'string',
    example: EXAMPLE_APPLICATION_ID,
  })
  @Post()
  public async post(@Param('appId') applicationId, @Body() channelDto: ChannelDto): Promise<GenericResponseDto> {
    return await this.channelService.insert(applicationId, channelDto);
  }

  @ApiOperation({
    description: 'Fetch a channel of a specific application',
    summary: 'Fetch a channel',
  })
  @ApiResponse({
    status: 200,
    description: 'the channel',
    type: ChannelDto,
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
  @Get('/:channelId')
  public async get(@Param('channelId') channelId): Promise<ChannelDto> {
    const result = await this.channelService.findOne(channelId);
    checkExists(result, ChannelController.RESOURCE_NAME, channelId);
    return Promise.resolve(result);
  }

  @ApiOperation({
    description: 'Fetch information for ionic deploy command line',
    summary: 'Fetch a info for ionic app',
  })
  @ApiResponse({
    status: 200,
    description: 'the channel',
    type: ChannelDto,
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
  @Get('/:channelId/updateinfo')
  @Header('content-type', 'text/html')
  public async getUpdateInfo(@Param('appId') appId, @Param('channelId') channelId): Promise<string> {
    const result = await this.channelService.getInfo(appId, channelId);
    return Promise.resolve(result.message);
  }
  @Get('/:channelId/updateurl')
  @Header('content-type', 'application/json')
  public async getUpdateUrl(@Param('appId') appId, @Param('channelId') channelId): Promise<{ url: string }> {
    return await this.channelService.getUpdateApi();
  }

  @ApiOperation({
    description: 'Delete a channel of a specific application',
    summary: 'Delete a channel',
  })
  @ApiResponse({
    status: 200,
    description: 'id of channel deleted',
    type: GenericResponseDto,
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
  @Delete('/:channelId')
  public async delete(@Param('channelId') channelId): Promise<GenericResponseDto> {
    const result = await this.channelService.delete(channelId);
    checkExists(result, ChannelController.RESOURCE_NAME, channelId);
    return Promise.resolve({ id: channelId });
  }

  @ApiOperation({
    description: 'Update a channel of a specific application',
    summary: 'Update a channel',
  })
  @ApiResponse({
    status: 200,
    description: 'updated channel',
    type: ApplicationDto,
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
  @Put('/:channelId')
  public async put(
    @Param('appId') applicationId,
    @Param('channelId') channelId,
    @Body() channelDto: ChannelDto,
  ): Promise<ChannelDto> {
    channelDto.id = channelId;
    const result = await this.channelService.update(channelDto);
    checkExists(result, ChannelController.RESOURCE_NAME, channelId);
    return Promise.resolve(result);
  }
}
