import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../infrastructure/blogs/blogs.repository';
import { PostsRepository } from '../../../infrastructure/posts/posts.repository';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { Blog } from '../../../domain/blogs/blog.entity';
import { Post } from '../../../domain/posts/post.entity';
import { UpdatePostByBlogIdAndPostIdCommand } from './update-post-by-blog-id-and-post-id.command';

/*Обработчик команды для изменения поста по ID блога и ID поста.*/
@CommandHandler(UpdatePostByBlogIdAndPostIdCommand)
export class UpdatePostByBlogIdAndPostIdCommandHandler implements ICommandHandler<UpdatePostByBlogIdAndPostIdCommand> {
  public constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository
  ) {}

  public async execute({ dto }: UpdatePostByBlogIdAndPostIdCommand): Promise<void> {
    /*Получаем ID блога, в котором находится пост.*/
    const blogId: string = dto.blogId;
    /*Просим репозиторий "BlogsRepository" найти блог по ID.*/
    const blog: Blog | null = await this.blogsRepository.findById(blogId);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.BlogNotFoundWhilePostUpdating,
        message: 'Blog to update post not found',
        field: 'blogId',
      });

    /*Если блог был найден, то просим репозиторий "PostsRepository" найти пост по ID в БД.*/
    const post: Post | null = await this.postsRepository.findById(dto.id);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileUpdating,
        message: 'Post to update not found',
        field: 'id',
      });

    /*Если пост был найден, то просим изменяем его.*/
    post.update(dto);
    /*Просим репозиторий "postsRepository" сохранить измененный пост в БД.*/
    await this.postsRepository.save(post);
  }
}
