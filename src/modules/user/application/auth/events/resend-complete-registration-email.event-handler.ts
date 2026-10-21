import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EmailManager } from '../../../../../core/modules/notification/email-manager/email.manager';
import { ResendingConfirmationEmailRequestedEvent } from './resending-confirmation-email-requested.event';

/*Обработчик события запроса повторной отправки письма для подтверждения регистрации пользователя с целью отправки
письма о подтверждении регистрации пользователя.*/
@EventsHandler(ResendingConfirmationEmailRequestedEvent)
export class ResendCompleteRegistrationEmailEventHandler implements IEventHandler<ResendingConfirmationEmailRequestedEvent> {
  constructor(private readonly emailManager: EmailManager) {}

  async handle(event: ResendingConfirmationEmailRequestedEvent): Promise<void> {
    try {
      await this.emailManager.sendCompleteRegistrationEmail(event.email, event.confirmationCode);
    } catch (error) {
      console.error('Failed to resend a complete registration email: ', error);
    }
  }
}
