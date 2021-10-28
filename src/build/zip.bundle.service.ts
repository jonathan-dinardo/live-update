import { ManifestDto } from './manifest.dto';
import * as fs from 'fs';
import * as AdmZip from 'adm-zip';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as rimraf from 'rimraf';
@Injectable()
export class ZipBundleService {
  private readonly PRO_MANIFEST_FILE = 'pro-manifest.json';

  private readonly tempDir: string;
  constructor(private configService: ConfigService) {
    this.tempDir = this.configService.get('TEMP_DIR');
  }

  public bundleZip(buffer: Buffer): Promise<string> {
    const temp_dir = this.createTempDir();
    try {
      this.unzipFileToTemp(buffer, temp_dir);
      return this.createArchiveZipFile(temp_dir);
    } finally {
      rimraf(temp_dir, function () {});
    }
  }

  private unzipFileToTemp(buffer: Buffer, temp_dir: string) {
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    zipEntries.forEach(function (zipEntry) {
      if (!zipEntry.isDirectory) {
        const entryPath = zipEntry.entryName;
        const target = path.join(temp_dir, entryPath);
        const directory = path.dirname(target);
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory, { recursive: true });
        }
        const buffer = zipEntry.getData();
        fs.writeFileSync(target, buffer);
      }
    });
  }

  private createArchiveZipFile(tmpdir: string): Promise<string> {
    const zip = new AdmZip();
    const manifestFile = path.join(tmpdir, this.PRO_MANIFEST_FILE);
    const manifestDtoList = this.updateManifest(manifestFile);

    for (const manifestDto of manifestDtoList) {
      this.addFileToZip(tmpdir, manifestDto.href, zip);
    }
    this.addFileToZip(tmpdir, this.PRO_MANIFEST_FILE, zip);
    return this.saveZip(zip);
  }

  private updateManifest(manifestFile: string): ManifestDto[] {
    const resultAsJson = fs.readFileSync(manifestFile).toString();
    const entries: ManifestDto[] = JSON.parse(resultAsJson);
    const manifestEntries = entries.filter((f) => {
      return f.href.toLowerCase() !== 'index.html';
    });
    fs.writeFileSync(manifestFile, JSON.stringify(manifestEntries));
    return manifestEntries;
  }

  private createTempDir(): string {
    const temp_dir = path.join(this.tempDir, `___tmp${new Date().getTime()}`);
    if (!fs.existsSync(temp_dir)) {
      fs.mkdirSync(temp_dir, { recursive: true });
    }
    return temp_dir;
  }

  private addFileToZip(tmpdir: string, href: string, zip: AdmZip) {
    const fileAdd = path.resolve(tmpdir, href);
    zip.addFile(href, fs.readFileSync(fileAdd));
  }

  private saveZip(zip: AdmZip): Promise<string> {
    const targetZipFile = path.join(this.tempDir, `__zip${new Date().getDate()}.zip`);
    return new Promise<string>((success, error) => {
      zip.writeZip(targetZipFile, (callback) => {
        if (!callback) {
          success(targetZipFile);
        } else {
          error(targetZipFile);
        }
      });
    });
  }
}
