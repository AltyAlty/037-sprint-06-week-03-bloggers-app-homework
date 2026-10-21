/*Событие запроса отправки письма с кодом восстановления пароля пользователя.*/
export class PasswordRecoveryRequestedEvent {
  constructor(
    public readonly email: string,
    public readonly passwordRecoveryCode: string
  ) {}
}
