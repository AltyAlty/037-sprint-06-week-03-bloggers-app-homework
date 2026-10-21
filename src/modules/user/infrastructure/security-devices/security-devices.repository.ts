import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityDevice } from '../../domain/security-devices/security-device.entity';

/*Репозиторий для пользовательских устройств.*/
@Injectable()
export class SecurityDevicesRepository {
  public constructor(
    @InjectRepository(SecurityDevice) private readonly securityDevicesRepository: Repository<SecurityDevice>
  ) {}

  /*Метод для сохранения пользовательского устройства в БД.*/
  public async save(securityDevice: SecurityDevice): Promise<void> {
    await this.securityDevicesRepository
      .createQueryBuilder()
      .insert()
      .into(SecurityDevice)
      .values(securityDevice)
      .orUpdate(['title', 'ip', 'last_active_date'], ['device_id'])
      .execute();
  }

  /*Метод для поиска пользовательского устройства по ID в БД.*/
  public async findById(id: string): Promise<SecurityDevice | null> {
    return await this.securityDevicesRepository
      .createQueryBuilder('securityDevice')
      .where('securityDevice.deviceId = :deviceId', { deviceId: id })
      .getOne();
  }

  /*Метод для hard удаления пользовательского устройства по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    await this.securityDevicesRepository
      .createQueryBuilder()
      .delete()
      .where('deviceId = :deviceId', { deviceId: id })
      .execute();
  }

  /*Метод для hard удаления всех пользовательских устройств, кроме текущего, по ID пользовательского устройства и ID
  пользователя в БД.*/
  public async deleteAllExceptCurrentOneBySecurityDeviceIdAndUserId(id: string, userId: string): Promise<void> {
    await this.securityDevicesRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .andWhere('deviceId != :deviceId', { deviceId: id })
      .execute();
  }
}
