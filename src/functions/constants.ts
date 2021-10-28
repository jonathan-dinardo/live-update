import * as path from 'path';

export const EXAMPLE_APPLICATION_ID = 'e5100fdc-748f-11eb-9439-0242ac130002';
export const EXAMPLE_CHANNEL_ID = 'f2519b72-0b62-4c6e-ae3e-45866a3dee1c';
export const EXAMPLE_BUILD_ID = '636086fc-d419-475a-9927-e5e3f39a2bcf';
export const EXAMPLE_BUILD_NAME = '1.2 release candidate';
export const ENV_GLOBAL_FILE = path.resolve(process.cwd(), '.env')
export const ENV_FILE = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'dev'}`)
