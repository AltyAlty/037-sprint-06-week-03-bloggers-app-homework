import { Command } from '@nestjs/cqrs';
import { UserAccessJwtAuthContextDTO } from '../../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';

/*Команда для soft удаления комментария по ID.*/
export class MarkCommentAsDeletedByIdCommand extends Command<void> {
  public constructor(
    public readonly id: string,
    public readonly userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ) {
    super();
  }
}
