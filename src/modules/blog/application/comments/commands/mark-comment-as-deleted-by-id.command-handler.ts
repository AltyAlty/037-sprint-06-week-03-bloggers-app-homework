import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../../infrastructure/comments/comments.repository';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { Comment } from '../../../domain/comments/comment.entity';
import { MarkCommentAsDeletedByIdCommand } from './mark-comment-as-deleted-by-id.command';

/*Обработчик команды для soft удаления комментария по ID.*/
@CommandHandler(MarkCommentAsDeletedByIdCommand)
export class MarkCommentAsDeletedByIdCommandHandler implements ICommandHandler<MarkCommentAsDeletedByIdCommand> {
  public constructor(private readonly commentsRepository: CommentsRepository) {}

  public async execute({ id, userAccessJwtAuthContext }: MarkCommentAsDeletedByIdCommand): Promise<void> {
    /*Просим репозиторий "CommentsRepository" найти комментарий по ID в БД.*/
    const comment: Comment | null = await this.commentsRepository.findById(id);

    /*Если комментарий не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!comment)
      throw new DomainException({
        code: DomainExceptionCode.CommentNotFoundWhileDeleting,
        message: 'Comment to delete not found',
        field: 'id',
      });

    /*Если пользователь не является владельцем комментария, то выбрасываем исключение с информацией об этом.*/
    if (comment.userId !== userAccessJwtAuthContext.id)
      throw new DomainException({
        code: DomainExceptionCode.WrongCommentOwnerWhileDeleting,
        message: 'The user is not the owner of the comment to delete',
        field: 'id',
      });

    /*Если комментарий был найден и пользователь является его владельцем, то просим репозиторий "CommentsRepository"
    soft удалить данные о лайках комментария по ID комментария в БД.*/
    await this.commentsRepository.markAllCommentLikeDataAsDeletedByCommentId(id);
    /*Просим репозиторий "CommentsRepository" soft удалить комментарий по ID в БД.*/
    await this.commentsRepository.markAsDeletedById(id);
  }
}
