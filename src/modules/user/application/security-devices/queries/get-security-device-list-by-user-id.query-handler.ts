import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SecurityDevicesQueryRepository } from '../../../infrastructure/security-devices/security-devices.query-repository';
import {
  SecurityDeviceListOutputDTO,
  SecurityDeviceOutputDTO,
} from '../../../api/security-devices/output-dto/security-device.output-dto';
import { SecurityDeviceList } from '../../../domain/security-devices/security-device.entity';
import { GetSecurityDeviceListByUserIdQuery } from './get-security-device-list-by-user-id.query';

/*Обработчик запроса для поиска пользовательских устройств по ID пользователя.*/
@QueryHandler(GetSecurityDeviceListByUserIdQuery)
export class GetSecurityDeviceListByUserIdQueryHandler implements IQueryHandler<GetSecurityDeviceListByUserIdQuery> {
  public constructor(private readonly securityDevicesQueryRepository: SecurityDevicesQueryRepository) {}

  public async execute({ userId }: GetSecurityDeviceListByUserIdQuery): Promise<SecurityDeviceListOutputDTO> {
    /*Просим query-репозиторий "SecurityDevicesQueryRepository" найти пользовательские устройства в БД.*/
    const securityDevices: SecurityDeviceList = await this.securityDevicesQueryRepository.findAllByUserId(userId);
    /*Преобразовываем пользовательские устройства из БД в подготовленные для отправки клиенту пользовательские
    устройства и возвращаем их.*/
    return SecurityDeviceOutputDTO.mapFromSecurityDeviceListToSecurityDeviceListOutputDTO(securityDevices);
  }
}
