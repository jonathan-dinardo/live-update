import { HttpException, HttpStatus } from '@nestjs/common';

export function checkExists(result, entityName: string, id: string) {
  if (!result) {
    throw new HttpException(
      `${entityName} id ${id} not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}

export function badRequest(message: string) {
  throw new HttpException(`${message}`, HttpStatus.BAD_REQUEST);
}
export function extractApplicationId(url: string) {
  const regex = /\/apps\/(\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b)/;
  let m;
  let result = null;
  if ((m = regex.exec(url)) !== null) {
    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
      if (groupIndex === 1) {
        result = match;
      }
    });
  }
  return result;
}
