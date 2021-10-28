import { Controller, Get, Param, Req, Res, UploadedFile } from '@nestjs/common';
import { BuildService } from './build.service';
import { Response, Request } from 'express';
import { RepositoryService } from '../repository/repository.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('resources/:appId/channels/:channelId/builds')
export class BuildResourceController {
  private static RESOURCE_URL = 'resources/:appId/channels/:channelId/builds';

  constructor(private buildService: BuildService, private repositoryService: RepositoryService) {}

  @ApiExcludeEndpoint()
  @Get(':buildId/*')
  async download(
    @Param('appId') appId,
    @Param('channelId') channelId,
    @Param('buildId') buildId: string,
    @UploadedFile() file,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const urlPath = this.getUrl(appId, channelId, buildId);
    const startIndex = request.url.indexOf(urlPath);
    const endIndex = startIndex + urlPath.length;
    const fileHref = request.url.substring(endIndex);
    const resourceLink = await this.repositoryService.getResource(appId, channelId, fileHref);
    response.sendFile(resourceLink);
  }

  getUrl(appId: string, channelId: string, buildId: string): string {
    let url = '/' + BuildResourceController.RESOURCE_URL;
    url = url.replace(':appId', appId);
    url = url.replace(':channelId', channelId);
    url = url + '/' + buildId;
    return url;
  }
}
