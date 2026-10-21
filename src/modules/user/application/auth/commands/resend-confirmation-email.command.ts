import { Command } from '@nestjs/cqrs';
import { ResendConfirmationEmailDTO } from './dto/resend-confirmation-email.dto';

/*Команда для повторной отправки письма для подтверждения регистрации пользователя.*/
export class ResendConfirmationEmailCommand extends Command<void> {
  public constructor(public readonly dto: ResendConfirmationEmailDTO) {
    super();
  }
}
