import { Command } from '@nestjs/cqrs';
import { RegisterUserDTO } from './dto/register-user.dto';

/*Команда для регистрации пользователя.*/
export class RegisterUserCommand extends Command<void> {
  public constructor(public readonly dto: RegisterUserDTO) {
    super();
  }
}
