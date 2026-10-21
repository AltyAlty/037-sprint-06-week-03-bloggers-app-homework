import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../../infrastructure/comments/comments.repository';
import { PostsRepository } from '../../../infrastructure/posts/posts.repository';
import { CommentOutputDTO } from '../../../api/comments/output-dto/comment.output-dto';
import { CommentLikeStatusOutputDTO } from '../../../api/comments/output-dto/comment-like-status.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { Comment } from '../../../domain/comments/comment.entity';
import { Post } from '../../../domain/posts/post.entity';
import { CreateCommentForPostCommand } from './create-comment-for-post.command';

/*Обработчик команды для создания комментария в посте.*/
@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostCommandHandler implements ICommandHandler<CreateCommentForPostCommand> {
  public constructor(
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository
  ) {}

  public async execute({ dto, userAccessJwtAuthContext }: CreateCommentForPostCommand): Promise<CommentOutputDTO> {
    /*Получаем ID поста.*/
    const postId: string = dto.postId;
    /*Просим репозиторий "PostsRepository" найти пост по ID.*/
    const post: Post | null = await this.postsRepository.findById(postId);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileCommentCreating,
        message: 'Post to create a comment not found',
        field: 'postId',
      });

    /*Если пост был найден, то просим сущность "Comment" создать комментарий.*/
    const comment: Comment = Comment.create({
      blogId: post.blogId,
      postId,
      userId: userAccessJwtAuthContext.id,
      content: dto.content,
    });

    /*Просим репозиторий "commentsRepository" сохранить комментарий в БД.*/
    await this.commentsRepository.save(comment);

    /*Преобразовываем комментарий из БД в подготовленный для отправки клиенту комментарий и возвращаем его.*/
    return CommentOutputDTO.mapFromCommentToCommentOutputDTO(
      comment,
      CommentLikeStatusOutputDTO.None,
      userAccessJwtAuthContext.login
    );
  }
}
