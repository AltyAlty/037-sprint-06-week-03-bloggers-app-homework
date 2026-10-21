import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../infrastructure/blogs/blogs.repository';
import { CommentsRepository } from '../../../infrastructure/comments/comments.repository';
import { PostsRepository } from '../../../infrastructure/posts/posts.repository';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { Blog } from '../../../domain/blogs/blog.entity';
import { Post } from '../../../domain/posts/post.entity';
import { MarkPostAsDeletedByBlogIdAndPostIdCommand } from './mark-post-as-deleted-by-blog-id-and-post-id.command';

/*Обработчик команды для soft удаления поста по ID блога и ID поста.*/
@CommandHandler(MarkPostAsDeletedByBlogIdAndPostIdCommand)
export class MarkPostAsDeletedByBlogIdAndPostIdCommandHandler implements ICommandHandler<MarkPostAsDeletedByBlogIdAndPostIdCommand> {
  public constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository
  ) {}

  public async execute({ id, blogId }: MarkPostAsDeletedByBlogIdAndPostIdCommand): Promise<void> {
    /*Просим репозиторий "BlogsRepository" найти блог по ID.*/
    const blog: Blog | null = await this.blogsRepository.findById(blogId);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.BlogNotFoundWhilePostDeleting,
        message: 'Blog to delete a post not found',
        field: 'blogId',
      });

    /*Если блог был найден, то просим репозиторий "PostsRepository" найти пост по ID в БД.*/
    const post: Post | null = await this.postsRepository.findById(id);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileDeleting,
        message: 'Post to delete not found',
        field: 'id',
      });

    /*Если пост был найден, то просим репозиторий "CommentsRepository" soft удалить данные о лайках комментария по ID
    поста в БД.*/
    await this.commentsRepository.markAllCommentLikeDataAsDeletedByPostId(id);
    /*Просим репозиторий "CommentsRepository" soft удалить комментарии по ID поста в БД.*/
    await this.commentsRepository.markAllAsDeletedByPostId(id);
    /*Просим репозиторий "PostsRepository" soft удалить данные о лайках поста по ID поста в БД.*/
    await this.postsRepository.markAllPostLikeDataAsDeletedByPostId(id);
    /*Просим репозиторий "PostsRepository" soft удалить пост по ID в БД.*/
    await this.postsRepository.markAsDeletedById(id);
  }
}
