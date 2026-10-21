import { Query } from '@nestjs/cqrs';
import { SecurityDeviceListOutputDTO } from '../../../api/security-devices/output-dto/security-device.output-dto';

/*Запрос для поиска пользовательских устройств по ID пользователя.*/
export class GetSecurityDeviceListByUserIdQuery extends Query<SecurityDeviceListOutputDTO> {
  public constructor(public readonly userId: string) {
    super();
  }
}
