/*Событие запроса повторной отправки письма для подтверждения регистрации пользователя.*/
export class ResendingConfirmationEmailRequestedEvent {
  constructor(
    public readonly email: string,
    public readonly confirmationCode: string
  ) {}
}
