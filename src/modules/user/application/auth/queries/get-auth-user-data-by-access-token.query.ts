import { Query } from '@nestjs/cqrs';
import { AuthUserDataOutputDTO } from '../../../api/auth/output-dto/auth-user-data.output-dto';

/*Запрос для получения данных о пользователе по ID пользователя при предоставлении AT.*/
export class GetAuthUserDataByAccessTokenQuery extends Query<AuthUserDataOutputDTO> {
  public constructor(public readonly id: string) {
    super();
  }
}
