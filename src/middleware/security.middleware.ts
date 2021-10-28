import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { IncomingMessage, ServerResponse } from 'http';
import { UserDto } from '../user/user.dto';
import { ConfigService } from '@nestjs/config';
import { Md5 } from 'ts-md5';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  public static readonly RAPID_API_PROVIDER = 'RAPID_API';
  public static readonly DEFAULT_API_PROVIDER = 'DEFAULT_API';
  constructor(private userService: UserService, private configService: ConfigService) {}

  async use(req: any, res: ServerResponse, next: () => void) {
    const gateway = this.resolveGateway(req);
    const xApiKey = SecurityMiddleware.resolveApiKey(gateway, req);
    let user = await this.userService.getUserByKeyAndProvider(xApiKey, gateway);
    if (gateway === SecurityMiddleware.RAPID_API_PROVIDER && !user) {
      user = await this.createUserRapidApi(req);
    }
    if (!user) {
      SecurityMiddleware.sendForbidden();
    }
    req.user = user;
    next();
  }

  private async createUserRapidApi(req: any): Promise<UserDto> {
    const user: string = SecurityMiddleware.getRapidApiUser(req);
    const apiKey = SecurityMiddleware.getApiKey(SecurityMiddleware.RAPID_API_PROVIDER, req);
    return await this.userService.createUser(user, apiKey, SecurityMiddleware.RAPID_API_PROVIDER);
  }

  private resolveGateway(req: any): string {
    const rapidXApiKey: string = req.headers['x-rapidapi-proxy-secret'];
    const internApiRapidKey: string = this.configService.get('RAPID_X-API-PROXY-SECRET');
    if (rapidXApiKey === internApiRapidKey) {
      return SecurityMiddleware.RAPID_API_PROVIDER;
    }
    return SecurityMiddleware.DEFAULT_API_PROVIDER;
  }

  private static resolveApiKey(gateway: string, req: IncomingMessage): string {
    const xApiKey = SecurityMiddleware.getApiKey(gateway, req);
    if (!xApiKey) {
      SecurityMiddleware.sendForbidden();
    }
    return xApiKey;
  }
  private static sendForbidden = () => {
    throw new HttpException(
      {
        status: HttpStatus.FORBIDDEN,
        error: 'invalid token',
      },
      HttpStatus.FORBIDDEN,
    );
  };
  private static getApiKey(gateway: string, req: IncomingMessage): string {
    switch (gateway) {
      case SecurityMiddleware.RAPID_API_PROVIDER:
        const md5 = new Md5();
        const secret = `${req.headers['x-rapidapi-proxy-secret']}`;
        const user = SecurityMiddleware.getRapidApiUser(req);
        const result = md5.appendAsciiStr(secret).appendAsciiStr(user).end();
        return <string>result;
      case SecurityMiddleware.DEFAULT_API_PROVIDER:
        return `${req.headers['x-api-key']}`;
      default:
        return `${req.headers['x-api-key']}`;
    }
  }

  private static getRapidApiUser(req: any): string {
    return `${req.headers['x-rapidapi-user']}`;
  }
}
