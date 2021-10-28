import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelEntity } from '../channel/channel.entity';
import { BuildEntity } from '../build/build.entity';
import { ApplicationEntity } from '../application/application.entity';
import { ApplicationService } from '../application/application-service';
import { BuildService } from '../build/build.service';
import { ChannelService } from '../channel/channel.service';
import { ApplicationController } from '../application/application.controller';
import { BuildController } from '../build/build.controller';
import { ChannelController } from '../channel/channel.controller';
import { DeployerService } from '../deployer/deployer.service';
import { ZipBundleService } from '../build/zip.bundle.service';
import { RepositoryService } from '../repository/repository.service';
import { FileRepositoryServiceImpl } from '../repository/file-repository-service-impl.service';
import { ChannelCheckController } from '../channel/channel.check.controller';
import { BuildResourceController } from '../build/build.resource.controller';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';
import { UserApplicationEntity } from '../user-application/user-application.entity';
import { UserController } from '../user/user.controller';
import { CheckApplicationMiddleware } from '../middleware/check.application.middleware';
import { CheckChannelMiddleware } from '../middleware/check.channel.middleware';
import { CheckBuildMiddleware } from "../middleware/check.build.middleware";
import {SecurityMiddleware} from "../middleware/security.middleware";

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, BuildEntity, ChannelEntity, UserEntity, UserApplicationEntity]),
  ],
  providers: [
    ApplicationService,
    ZipBundleService,
    BuildService,
    ChannelService,
    DeployerService,
    FileRepositoryServiceImpl,
    RepositoryService,
    UserService,
  ],
  controllers: [
    ApplicationController,
    BuildController,
    BuildResourceController,
    ChannelController,
    ChannelCheckController,
    UserController,
  ],
})
export class SharedModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(SecurityMiddleware)
      .forRoutes(UserController, BuildController, ApplicationController, ChannelController)
      .apply(CheckApplicationMiddleware)
      .exclude(ChannelCheckController.CHECK_CHANNEL_URL)
      .forRoutes({ path: '/apps/:appId', method: RequestMethod.ALL })
      .apply(CheckChannelMiddleware)
      .exclude(ChannelCheckController.CHECK_CHANNEL_URL)
      .forRoutes({ path: '/apps/:appId/channels/:channelId', method: RequestMethod.ALL })
      .apply(CheckBuildMiddleware)
      .forRoutes({ path: '/apps/:appId/channels/:channelId/builds/:buildId', method: RequestMethod.ALL });
  }
}
