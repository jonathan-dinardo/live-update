import { getConnection, Repository, SelectQueryBuilder } from 'typeorm';
import { ApplicationEntity } from './application.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationDto } from './application.dto';
import { plainToClass } from 'class-transformer';
import { ApplicationSearchDto } from './application.search.dto';
import { UserDto } from '../user/user.dto';
import { UserApplicationEntity } from '../user-application/user-application.entity';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class ApplicationService {
  @InjectRepository(ApplicationEntity)
  private readonly applicationRepository: Repository<ApplicationEntity>;

  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  async insert(userDto: UserDto, application: ApplicationDto): Promise<ApplicationDto> {
    return await getConnection().transaction(async (tx) => {
      const applicationEntity = plainToClass(ApplicationEntity, application);
      const applicationEntityResult = await tx.save(ApplicationEntity, applicationEntity);
      const userEntity = new UserEntity();
      userEntity.id = userDto.id;
      const userApplicationEntity: UserApplicationEntity = new UserApplicationEntity();
      userApplicationEntity.application = applicationEntityResult;
      userApplicationEntity.user = userEntity;
      await tx.save(UserApplicationEntity, userApplicationEntity);
      return plainToClass(ApplicationDto, applicationEntityResult, {
        excludeExtraneousValues: true,
      });
    });
  }

  async update(application: ApplicationDto): Promise<ApplicationDto> {
    const result = await this.applicationRepository
      .createQueryBuilder()
      .update(ApplicationEntity)
      .set({ name: application.name })
      .where('id = :id', { id: application.id })
      .andWhere('deletedAt is null')
      .execute();
    return result.affected > 0 ? this.findOne(application.id) : null;
  }

  async search(applicationSearchDto: ApplicationSearchDto): Promise<ApplicationDto[]> {
    let queryBuilder: SelectQueryBuilder<ApplicationEntity>;
    queryBuilder = await this.applicationRepository
      .createQueryBuilder('application')
      .innerJoin('application.userApplications', 'userApplications')
      .innerJoin('userApplications.user', 'user')
      .where('user.id = :userId', { userId: applicationSearchDto.userId });

    if (applicationSearchDto.name) {
      queryBuilder = queryBuilder.andWhere('application.name =:name', {
        name: applicationSearchDto.name,
      });
    }
    if (applicationSearchDto.text) {
      queryBuilder = queryBuilder.andWhere('application.name like (:text)', {
        text: `%${applicationSearchDto.text}%`,
      });
    }
    const result = await queryBuilder.addOrderBy('application.created_at', 'DESC').getMany();
    return plainToClass(ApplicationDto, result, {
      excludeExtraneousValues: true,
    });
  }

  async delete(id: string): Promise<boolean> {
    const element = await this.applicationRepository.findOne(id);
    element && (await this.applicationRepository.softDelete(id));
    return Promise.resolve(!!element);
  }

  async findOne(id: string): Promise<ApplicationDto> {
    const result = await this.applicationRepository.findOne(id);
    return plainToClass(ApplicationDto, result, {
      excludeExtraneousValues: true,
    });
  }
  public async isOwner(userId: string, applicationId: string): Promise<boolean> {
    return (
      (await this.userRepository
        .createQueryBuilder('users')
        .innerJoin('users.userApplications', 'userApplications')
        .innerJoin('userApplications.application', 'application')
        .where('users.id = :userId', { userId: userId })
        .andWhere('application.id = :applicationId', {
          applicationId: applicationId,
        })
        .getCount()) > 0
    );
  }
}
