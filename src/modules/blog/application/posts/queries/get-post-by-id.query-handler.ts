import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../../infrastructure/posts/posts.query-repository';
import { NewestPostLikeListOutputDTO } from '../../../api/posts/output-dto/newest-post-like.output-dto';
import { PostOutputDTO } from '../../../api/posts/output-dto/post.output-dto';
import { PostLikeStatusOutputDTO } from '../../../api/posts/output-dto/post-like-status.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../../core/exceptions/domain/domain.exception';
import { Post } from '../../../domain/posts/post.entity';
import { PostLikeData } from '../../../domain/posts/post-like-data.entity';
import { GetPostByIdQuery } from './get-post-by-id.query';

/*Обработчик запроса для поиска поста по ID.*/
@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<GetPostByIdQuery> {
  public constructor(private readonly postsQueryRepository: PostsQueryRepository) {}

  public async execute({ id, userId }: GetPostByIdQuery): Promise<PostOutputDTO> {
    /*Просим query-репозиторий "PostsQueryRepository" найти пост по ID в БД.*/
    const post: Post | null = await this.postsQueryRepository.findById(id);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({ code: DomainExceptionCode.PostNotFound, message: 'Post not found', field: 'id' });

    /*Если пост был найден, то формируем статус лайка поста.*/
    let likeStatus: PostLikeStatusOutputDTO = PostLikeStatusOutputDTO.None;

    /*Если в запросе был указан AT.*/
    if (userId) {
      /*Просим query-репозиторий "PostsQueryRepository" найти данные о лайке поста в БД.*/
      const postLikeData: PostLikeData | null = await this.postsQueryRepository.findPostLikeDataByPostIdAndUserId(
        id,
        userId
      );

      /*Если данные о лайке поста были найдены, то получаем статус лайка.*/
      if (postLikeData) likeStatus = postLikeData.likeStatus as unknown as PostLikeStatusOutputDTO;
    }

    /*Просим query-репозиторий "PostsQueryRepository" найти данные о трех последних лайках поста по ID поста в БД.*/
    const newestLikes: NewestPostLikeListOutputDTO = await this.postsQueryRepository.findLastThreePostLikesByPostId(id);
    /*Преобразовываем пост из БД в подготовленный для отправки клиенту пост и возвращаем его.*/
    return PostOutputDTO.mapFromPostToPostOutputDTO(post, post.blog.name, likeStatus, newestLikes);
  }
}
