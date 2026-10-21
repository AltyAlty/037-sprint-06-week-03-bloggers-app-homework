import { Command } from '@nestjs/cqrs';
import { CommentOutputDTO } from '../../../api/comments/output-dto/comment.output-dto';
import { UserAccessJwtAuthContextDTO } from '../../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { CreateCommentForPostDTO } from './dto/create-comment-for-post.dto';

/*Команда для создания комментария в посте.*/
export class CreateCommentForPostCommand extends Command<CommentOutputDTO> {
  public constructor(
    public readonly dto: CreateCommentForPostDTO,
    public readonly userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ) {
    super();
  }
}
