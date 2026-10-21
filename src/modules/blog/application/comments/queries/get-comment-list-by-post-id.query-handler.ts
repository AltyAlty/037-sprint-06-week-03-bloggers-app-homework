import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../../infrastructure/comments/comments.query-repository';
import { PostsQueryRepository } from '../../../infrastructure/posts/posts.query-repository';
import { PaginationMetaDataOutputDTO } from '../../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { CommentListOutputDTO, CommentOutputDTO } from '../../../api/comments/output-dto/comment.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { CommentList } from '../../../domain/comments/comment.entity';
import { Post } from '../../../domain/posts/post.entity';
import { GetCommentListByPostIdQuery } from './get-comment-list-by-post-id.query';

/*Обработчик запроса для поиска комментариев по ID поста.*/
@QueryHandler(GetCommentListByPostIdQuery)
export class GetCommentListByPostIdQueryHandler implements IQueryHandler<GetCommentListByPostIdQuery> {
  public constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository
  ) {}

  public async execute({
    postId,
    dto,
    userId,
  }: GetCommentListByPostIdQuery): Promise<PaginationMetaDataOutputDTO<CommentListOutputDTO>> {
    /*Просим query-репозиторий "PostsQueryRepository" найти пост по ID в БД.*/
    const post: Post | null = await this.postsQueryRepository.findById(postId);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileCommentSearching,
        message: 'Post to find comments not found',
        field: 'id',
      });

    /*Если пост был найден, то просим query-репозиторий "CommentsQueryRepository" найти комментарии по ID поста в БД.*/
    const { items, totalCount }: { items: CommentList; totalCount: number } =
      await this.commentsQueryRepository.findAllByPostId(postId, dto);

    /*Преобразовываем комментарии из БД в подготовленные для отправки клиенту комментарии.*/
    const commentListOutput: CommentListOutputDTO = await CommentOutputDTO.mapFromCommentListToCommentListOutputDTO(
      items,
      this.commentsQueryRepository,
      userId
    );

    /*Преобразовываем подготовленные для отправки клиенту комментарии в подготовленные для отправки клиенту с
    пагинацией комментарии и возвращаем их.*/
    return PaginationMetaDataOutputDTO.mapToOutputDTO({
      page: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount: totalCount,
      items: commentListOutput,
    });
  }
}
