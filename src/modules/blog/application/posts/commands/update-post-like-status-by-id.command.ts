import { Command } from '@nestjs/cqrs';
import { UserAccessJwtAuthContextDTO } from '../../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { UpdatePostLikeStatusByIdDTO } from './dto/update-post-like-status-by-id.dto';

/*Команда для изменения статуса лайка поста по ID поста.*/
export class UpdatePostLikeStatusByIdCommand extends Command<void> {
  public constructor(
    public readonly dto: UpdatePostLikeStatusByIdDTO,
    public readonly userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ) {
    super();
  }
}
