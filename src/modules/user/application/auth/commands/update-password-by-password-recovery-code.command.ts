import { Command } from '@nestjs/cqrs';
import { UpdatePasswordByPasswordRecoveryCodeDTO } from './dto/update-password-by-password-recovery-code.dto';

/*Команда для изменения пароля пользователя по коду восстановления пароля пользователя.*/
export class UpdatePasswordByPasswordRecoveryCodeCommand extends Command<void> {
  public constructor(public readonly dto: UpdatePasswordByPasswordRecoveryCodeDTO) {
    super();
  }
}
