import { Expose } from 'class-transformer';

export class ManifestDto {
  @Expose()
  href: string;
  @Expose()
  size: number;
  @Expose()
  integrity: string;
}
