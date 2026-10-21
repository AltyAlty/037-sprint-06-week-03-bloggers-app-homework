import { Command } from '@nestjs/cqrs';
import { UserAccessJwtAuthContextDTO } from '../../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { UpdateCommentLikeStatusByIdDTO } from './dto/update-comment-like-status-by-id.dto';

/*Команда для изменения статуса лайка комментария по ID комментария.*/
export class UpdateCommentLikeStatusByIdCommand extends Command<void> {
  public constructor(
    public readonly dto: UpdateCommentLikeStatusByIdDTO,
    public readonly userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ) {
    super();
  }
}
