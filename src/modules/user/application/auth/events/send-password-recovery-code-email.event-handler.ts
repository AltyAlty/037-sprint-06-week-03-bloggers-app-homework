import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EmailManager } from '../../../../../core/modules/notification/email-manager/email.manager';
import { PasswordRecoveryRequestedEvent } from './password-recovery-requested.event';

/*Обработчик события регистрации пользователя с целью отправки письма с кодом восстановления пароля пользователя.*/
@EventsHandler(PasswordRecoveryRequestedEvent)
export class SendPasswordRecoveryCodeEmailEventHandler implements IEventHandler<PasswordRecoveryRequestedEvent> {
  constructor(private readonly emailManager: EmailManager) {}

  async handle(event: PasswordRecoveryRequestedEvent): Promise<void> {
    try {
      await this.emailManager.sendCompleteRegistrationEmail(event.email, event.passwordRecoveryCode);
    } catch (error) {
      console.error('Failed to send a recovery password email: ', error);
    }
  }
}
