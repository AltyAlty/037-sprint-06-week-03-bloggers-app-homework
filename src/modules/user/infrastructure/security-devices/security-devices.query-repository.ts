import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityDevice, SecurityDeviceList } from '../../domain/security-devices/security-device.entity';

/*Query-репозиторий для пользовательских устройств.*/
@Injectable()
export class SecurityDevicesQueryRepository {
  public constructor(
    @InjectRepository(SecurityDevice) private readonly securityDevicesRepository: Repository<SecurityDevice>
  ) {}

  /*Метод для поиска пользовательских устройств по ID пользователя в БД.*/
  public async findAllByUserId(userId: string): Promise<SecurityDeviceList> {
    return await this.securityDevicesRepository
      .createQueryBuilder('securityDevice')
      .where('securityDevice.userId = :userId', { userId })
      .getMany();
  }
}
