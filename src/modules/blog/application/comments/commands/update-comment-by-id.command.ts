import { Command } from '@nestjs/cqrs';
import { UserAccessJwtAuthContextDTO } from '../../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { UpdateCommentByIdDTO } from './dto/update-comment-by-id.dto';

/*Команда для изменения комментария по ID.*/
export class UpdateCommentByIdCommand extends Command<void> {
  public constructor(
    public readonly dto: UpdateCommentByIdDTO,
    public readonly userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ) {
    super();
  }
}
