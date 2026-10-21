import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EmailManager } from '../../../../../core/modules/notification/email-manager/email.manager';
import { UserRegisteredEvent } from './user-registered.event';

/*Обработчик события регистрации пользователя с целью отправки письма о подтверждении регистрации пользователя.*/
@EventsHandler(UserRegisteredEvent)
export class SendCompleteRegistrationEmailEventHandler implements IEventHandler<UserRegisteredEvent> {
  constructor(private readonly emailManager: EmailManager) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    try {
      await this.emailManager.sendCompleteRegistrationEmail(event.email, event.confirmationCode);
    } catch (error) {
      console.error('Failed to send a complete registration email: ', error);
    }
  }
}
