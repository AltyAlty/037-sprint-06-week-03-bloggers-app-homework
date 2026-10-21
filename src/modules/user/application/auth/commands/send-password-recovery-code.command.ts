import { Command } from '@nestjs/cqrs';
import { SendPasswordRecoveryCodeDTO } from './dto/send-password-recovery-code.dto';

/*Команда для отправки письма с кодом восстановления пароля пользователя.*/
export class SendPasswordRecoveryCodeCommand extends Command<void> {
  public constructor(public readonly dto: SendPasswordRecoveryCodeDTO) {
    super();
  }
}
