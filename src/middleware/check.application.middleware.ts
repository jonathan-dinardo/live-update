import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { ServerResponse } from 'http';
import { UserDto } from '../user/user.dto';
import { ApplicationService } from '../application/application-service';

@Injectable()
export class CheckApplicationMiddleware implements NestMiddleware {
  constructor(private applicationService: ApplicationService) {}

  async use(req: any, res: ServerResponse, next: () => void) {
    const user: UserDto = req.user;
    const applicationId = req.params.appId;
    await this.checkApplicationId(applicationId, user);
    req.applicationId = applicationId;
    next();
  }
  private async checkApplicationId(applicationId: string, user: UserDto) {
    if (!(await this.applicationService.isOwner(user.id, applicationId))) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
