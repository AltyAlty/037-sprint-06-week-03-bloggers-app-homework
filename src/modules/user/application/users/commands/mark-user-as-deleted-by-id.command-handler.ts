import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../../../blog/infrastructure/comments/comments.repository';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { User } from '../../../domain/users/users.entity';
import { MarkUserAsDeletedByIdCommand } from './mark-user-as-deleted-by-id.command';

/*Обработчик команды для soft удаления пользователя по ID.*/
@CommandHandler(MarkUserAsDeletedByIdCommand)
export class MarkUserAsDeletedByIdCommandHandler implements ICommandHandler<MarkUserAsDeletedByIdCommand> {
  public constructor(
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommentsRepository
  ) {}

  public async execute({ id }: MarkUserAsDeletedByIdCommand): Promise<void> {
    /*Просим репозиторий "UsersRepository" найти пользователя по ID в БД.*/
    const user: User | null = await this.usersRepository.findById(id);

    /*Если пользователь не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.UserNotFoundWhileDeleting,
        message: 'User to delete not found',
        field: 'code',
      });

    /*Если пользователь был найден, то просим репозиторий "UsersRepository" soft удалить пользователя по ID в БД.*/
    await this.usersRepository.markAsDeletedById(id);
    /*Просим репозиторий "CommentsRepository" soft удалить данные о лайках комментариев по ID пользователя в БД.*/
    await this.commentsRepository.markAllCommentLikeDataAsDeletedByUserId(id);
    /*Просим репозиторий "CommentsRepository" soft удалить комментарии по ID пользователя в БД.*/
    await this.commentsRepository.markAllAsDeletedByUserId(id);
  }
}
