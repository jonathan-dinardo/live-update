import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import {ENV_FILE, ENV_GLOBAL_FILE} from "./functions/constants";

const validateConfig = (): boolean => {
  const missingConfigs = [ENV_FILE, ENV_GLOBAL_FILE].filter( f => !fs.existsSync(f));
  if ( missingConfigs.length === 0 ){
    return true;
  }
  missingConfigs.forEach( c => console.error (`\x1b[31m Missing configuration ${c}`));
  return false;
}

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const configService: ConfigService = app.get(ConfigService);
  const port = await configService.get('EXPRESS_PORT');
  const api =  await configService.get('DOC_API');
  const envDescription =  await configService.get('ENV_DESCRIPTION');
  const config = new DocumentBuilder()
    .setTitle('Liveupdate assets api')
    .setDescription(
      'Liveupdate api is a set of api used to manage updates for ionic application. Liveupdate does not work with native layer',
    )
    .setVersion('1.0')
    .build();


  config.servers.push({
    description: envDescription,
    url: api,
  });
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/3.47.1/swagger-ui.css',
  });
  console.log(`Starting ${envDescription} on ${port}`);
  await app.listen(port);
}
if (validateConfig()){
  bootstrap();
}



