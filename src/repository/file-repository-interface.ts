export interface FileRepositoryInterface {
  getResource(appId: string, channel: string, href: string): string;
  publishBundle(
    appId: string,
    channel: string,
    buildId: string,
    buffer: Buffer,
  );
  setActiveBuild(appId: string, channel: string, buildId: string);
  deleteBuild(appId: string, channel: string, buildId: string);
}
