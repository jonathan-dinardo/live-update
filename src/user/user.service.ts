import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { plainToClass } from 'class-transformer';
import { UserDto } from './user.dto';

@Injectable()
export class UserService {
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  public async createUser(username: string, apikey: string, gateway: string): Promise<UserDto> {
    const user: UserEntity = new UserEntity();
    user.username = username;
    user.apikey = apikey;
    user.gateway = gateway;

    const userEntity = await this.userRepository.save(user);
    return plainToClass(UserDto, userEntity, {
      excludeExtraneousValues: true,
    });
  }

  public async getUserByKeyAndProvider(apiKey: string, provider: string): Promise<UserDto> {
    const userEntity = await this.userRepository
      .createQueryBuilder('users')
      .where('users.gateway = :gateway', { gateway: provider })
      .andWhere('users.apikey = :apikey', { apikey: apiKey })
      .andWhere('users.active = 1')
      .getOne();
    return plainToClass(UserDto, userEntity, {
      excludeExtraneousValues: true,
    });
  }

}
