import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './modules/shared.module';
import {ENV_FILE, ENV_GLOBAL_FILE} from "./functions/constants";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [ENV_FILE, ENV_GLOBAL_FILE],
    }),
    TypeOrmModule.forRoot({ loggerLevel: 'debug' }),
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
