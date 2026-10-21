import { Command } from '@nestjs/cqrs';
import { UserRefreshJwtAuthContextDTO } from '../../../../../core/guards/refresh-jwt-auth/dto/user-refresh-jwt-auth-context.dto';

/*Команда для отзыва пользовательской сессии по ID пользовательского устройства.*/
export class RevokeSessionBySecurityDeviceIdCommand extends Command<void> {
  public constructor(
    public readonly deviceId: string,
    public readonly userRefreshJwtAuthContext: UserRefreshJwtAuthContextDTO
  ) {
    super();
  }
}
