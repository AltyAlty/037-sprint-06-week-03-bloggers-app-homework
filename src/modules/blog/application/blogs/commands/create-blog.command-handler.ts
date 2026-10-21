import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../infrastructure/blogs/blogs.repository';
import { BlogOutputDTO } from '../../../api/blogs/output-dto/blog.output-dto';
import { Blog } from '../../../domain/blogs/blog.entity';
import { CreateBlogCommand } from './create-blog.command';

/*Обработчик команды для создания блога.*/
@CommandHandler(CreateBlogCommand)
export class CreateBlogCommandHandler implements ICommandHandler<CreateBlogCommand> {
  public constructor(private readonly blogsRepository: BlogsRepository) {}

  public async execute({ dto }: CreateBlogCommand): Promise<BlogOutputDTO> {
    /*Просим сущность "Blog" создать блог.*/
    const blog: Blog = Blog.create(dto);
    /*Просим репозиторий "BlogsRepository" сохранить блог в БД.*/
    await this.blogsRepository.save(blog);
    /*Преобразовываем блог из БД в подготовленный для отправки клиенту блог и возвращаем его.*/
    return BlogOutputDTO.mapFromBlogToBlogOutputDTO(blog);
  }
}
