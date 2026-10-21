import { Command } from '@nestjs/cqrs';
import { UserRefreshJwtAuthContextDTO } from '../../../../../core/guards/refresh-jwt-auth/dto/user-refresh-jwt-auth-context.dto';

/*Команда для отзыва пользовательской сессии.*/
export class RevokeSessionCommand extends Command<void> {
  public constructor(public readonly userRefreshJwtAuthContext: UserRefreshJwtAuthContextDTO) {
    super();
  }
}
