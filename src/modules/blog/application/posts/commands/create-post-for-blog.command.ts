import { Command } from '@nestjs/cqrs';
import { PostOutputDTO } from '../../../api/posts/output-dto/post.output-dto';
import { CreatePostForBlogDTO } from './dto/create-post-for-blog.dto';

/*Команда для создания поста в блоге.*/
export class CreatePostForBlogCommand extends Command<PostOutputDTO> {
  public constructor(public readonly dto: CreatePostForBlogDTO) {
    super();
  }
}
