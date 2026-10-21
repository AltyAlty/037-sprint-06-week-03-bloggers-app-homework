import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../../infrastructure/comments/comments.query-repository';
import { CommentOutputDTO } from '../../../api/comments/output-dto/comment.output-dto';
import { CommentLikeStatusOutputDTO } from '../../../api/comments/output-dto/comment-like-status.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { Comment } from '../../../domain/comments/comment.entity';
import { CommentLikeData } from '../../../domain/comments/comment-like-data.entity';
import { GetCommentByIdQuery } from './get-comment-by-id.query';

/*Обработчик запроса для поиска поста по ID.*/
@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdQueryHandler implements IQueryHandler<GetCommentByIdQuery> {
  public constructor(private readonly commentsQueryRepository: CommentsQueryRepository) {}

  public async execute({ id, userId }: GetCommentByIdQuery): Promise<CommentOutputDTO> {
    /*Просим query-репозиторий "CommentsQueryRepository" найти комментарий по ID в БД.*/
    const comment: Comment | null = await this.commentsQueryRepository.findById(id);

    /*Если комментарий не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!comment)
      throw new DomainException({
        code: DomainExceptionCode.CommentNotFound,
        message: 'Comment not found',
        field: 'id',
      });

    /*Если комментарий был найден, то формируем статус лайка комментария.*/
    let likeStatus: CommentLikeStatusOutputDTO = CommentLikeStatusOutputDTO.None;

    /*Если в запросе был указан AT.*/
    if (userId) {
      /*Просим query-репозиторий "CommentsQueryRepository" найти данные о лайке комментария в БД.*/
      const commentLikeData: CommentLikeData | null =
        await this.commentsQueryRepository.findCommentLikeDataByCommentIdAndUserId(id, userId);

      /*Если данные о лайке комментария были найдены, то получаем статус лайка.*/
      if (commentLikeData) likeStatus = commentLikeData.likeStatus as unknown as CommentLikeStatusOutputDTO;
    }

    /*Преобразовываем комментарий из БД в подготовленный для отправки клиенту комментарий и возвращаем его.*/
    return CommentOutputDTO.mapFromCommentToCommentOutputDTO(comment, likeStatus, comment.user.login);
  }
}
