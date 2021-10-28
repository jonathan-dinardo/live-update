import * as fs from 'fs';
import * as rimraf from 'rimraf';

export function mkdir(targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  return targetDir;
}

export function emptyDir(targetDir: string) {
  if (!fs.existsSync(targetDir)) {
    rimraf.sync(targetDir);
  }
  mkdir(targetDir);
}
