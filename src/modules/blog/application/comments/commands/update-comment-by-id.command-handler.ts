import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../../infrastructure/comments/comments.repository';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { Comment } from '../../../domain/comments/comment.entity';
import { UpdateCommentByIdCommand } from './update-comment-by-id.command';

/*Обработчик команды для изменения комментария по ID.*/
@CommandHandler(UpdateCommentByIdCommand)
export class UpdateCommentByIdCommandHandler implements ICommandHandler<UpdateCommentByIdCommand> {
  public constructor(private readonly commentsRepository: CommentsRepository) {}

  public async execute({ dto, userAccessJwtAuthContext }: UpdateCommentByIdCommand): Promise<void> {
    /*Просим репозиторий "CommentsRepository" найти комментарий по ID в БД.*/
    const comment: Comment | null = await this.commentsRepository.findById(dto.id);

    /*Если комментарий не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!comment)
      throw new DomainException({
        code: DomainExceptionCode.CommentNotFoundWhileUpdating,
        message: 'Comment to update not found',
        field: 'id',
      });

    /*Если пользователь не является владельцем комментария, то выбрасываем исключение с информацией об этом.*/
    if (comment.userId !== userAccessJwtAuthContext.id)
      throw new DomainException({
        code: DomainExceptionCode.WrongCommentOwnerWhileUpdating,
        message: 'The user is not the owner of the comment to update',
        field: 'id',
      });

    /*Если комментарий был найден и пользователь является его владельцем, то просим изменяем его.*/
    comment.update(dto);
    /*Просим репозиторий "commentsRepository" сохранить измененный комментарий в БД.*/
    await this.commentsRepository.save(comment);
  }
}
