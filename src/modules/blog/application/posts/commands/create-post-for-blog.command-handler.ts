import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../infrastructure/blogs/blogs.repository';
import { PostsRepository } from '../../../infrastructure/posts/posts.repository';
import { PostOutputDTO } from '../../../api/posts/output-dto/post.output-dto';
import { PostLikeStatusOutputDTO } from '../../../api/posts/output-dto/post-like-status.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { Blog } from '../../../domain/blogs/blog.entity';
import { Post } from '../../../domain/posts/post.entity';
import { CreatePostForBlogCommand } from './create-post-for-blog.command';

/*Обработчик команды для создания поста в блоге.*/
@CommandHandler(CreatePostForBlogCommand)
export class CreatePostForBlogCommandHandler implements ICommandHandler<CreatePostForBlogCommand> {
  public constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository
  ) {}

  public async execute({ dto }: CreatePostForBlogCommand): Promise<PostOutputDTO> {
    /*Получаем ID блога.*/
    const blogId: string = dto.blogId;
    /*Просим репозиторий "BlogsRepository" найти блог по ID.*/
    const blog: Blog | null = await this.blogsRepository.findById(blogId);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.BlogNotFoundWhilePostCreating,
        message: 'Blog to create a post not found',
        field: 'blogId',
      });

    /*Если блог был найден, то просим сущность "Post" создать пост.*/
    const post: Post = Post.create({ ...dto, blogId });
    /*Просим репозиторий "postsRepository" сохранить пост в БД.*/
    await this.postsRepository.save(post);
    /*Преобразовываем пост из БД в подготовленный для отправки клиенту пост и возвращаем его.*/
    return PostOutputDTO.mapFromPostToPostOutputDTO(post, blog.name, PostLikeStatusOutputDTO.None, []);
  }
}
