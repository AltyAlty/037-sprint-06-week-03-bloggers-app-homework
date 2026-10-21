import { Command } from '@nestjs/cqrs';
import { ConfirmUserByCodeDTO } from './dto/confirm-user-by-code.dto';

/*Команда для подтверждения регистрации пользователя по коду подтверждения регистрации пользователя.*/
export class ConfirmUserByCodeCommand extends Command<void> {
  public constructor(public readonly dto: ConfirmUserByCodeDTO) {
    super();
  }
}
