import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../infrastructure/blogs/blogs.repository';
import { CommentsRepository } from '../../../infrastructure/comments/comments.repository';
import { PostsRepository } from '../../../infrastructure/posts/posts.repository';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { Blog } from '../../../domain/blogs/blog.entity';
import { MarkBlogAsDeletedByIdCommand } from './mark-blog-as-deleted-by-id.command';

/*Обработчик команды для soft удаления блога по ID.*/
@CommandHandler(MarkBlogAsDeletedByIdCommand)
export class MarkBlogAsDeletedByIdCommandHandler implements ICommandHandler<MarkBlogAsDeletedByIdCommand> {
  public constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository
  ) {}

  public async execute({ id }: MarkBlogAsDeletedByIdCommand): Promise<void> {
    /*Просим репозиторий "BlogsRepository" найти блог по ID в БД.*/
    const blog: Blog | null = await this.blogsRepository.findById(id);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.BlogNotFoundWhileDeleting,
        message: 'Blog to delete not found',
        field: 'id',
      });

    /*Если блог был найден, то просим репозиторий "CommentsRepository" soft удалить данные о лайках комментария по ID
    блога в БД.*/
    await this.commentsRepository.markAllCommentLikeDataAsDeletedByBlogId(id);
    /*Просим репозиторий "CommentsRepository" soft удалить комментарии по ID блога в БД.*/
    await this.commentsRepository.markAllAsDeletedByBlogId(id);
    /*Просим репозиторий "PostsRepository" soft удалить данные о лайках постов по ID блога в БД.*/
    await this.postsRepository.markAllPostLikeDataAsDeletedByBlogId(id);
    /*Просим репозиторий "PostsRepository" soft удалить посты по ID блога в БД.*/
    await this.postsRepository.markAllAsDeletedByBlogId(id);
    /*Просим репозиторий "BlogsRepository" soft удалить блог по ID в БД.*/
    await this.blogsRepository.markAsDeletedById(id);
  }
}
