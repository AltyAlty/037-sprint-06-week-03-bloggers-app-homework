import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../infrastructure/blogs/blogs.repository';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { Blog } from '../../../domain/blogs/blog.entity';
import { UpdateBlogByIdCommand } from './update-blog-by-id.command';

/*Обработчик команды для изменения блога по ID.*/
@CommandHandler(UpdateBlogByIdCommand)
export class UpdateBlogByIdCommandHandler implements ICommandHandler<UpdateBlogByIdCommand> {
  public constructor(private readonly blogsRepository: BlogsRepository) {}

  public async execute({ dto }: UpdateBlogByIdCommand): Promise<void> {
    /*Просим репозиторий "BlogsRepository" найти блог по ID в БД.*/
    const blog: Blog | null = await this.blogsRepository.findById(dto.id);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.BlogNotFoundWhileUpdating,
        message: 'Blog to update not found',
        field: 'id',
      });

    /*Если блог был найден, то изменяем его.*/
    blog.update(dto);
    /*Просим репозиторий "BlogsRepository" сохранить измененный блог в БД.*/
    await this.blogsRepository.save(blog);
  }
}
