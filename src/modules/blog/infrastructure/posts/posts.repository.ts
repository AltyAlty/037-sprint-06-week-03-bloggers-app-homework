import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../domain/posts/post.entity';
import { PostLikeData } from '../../domain/posts/post-like-data.entity';

/*Репозиторий для постов.*/
@Injectable()
export class PostsRepository {
  public constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @InjectRepository(PostLikeData) private postLikesDataRepository: Repository<PostLikeData>
  ) {}

  /*Метод для сохранения поста в БД.*/
  public async save(post: Post): Promise<void> {
    await this.postsRepository
      .createQueryBuilder()
      .insert()
      .into(Post)
      .values(post)
      .orUpdate(['title', 'short_description', 'content', 'likes_count', 'dislikes_count'], ['id'])
      .execute();
  }

  /*Метод для сохранения данных о лайке поста в БД.*/
  public async savePostLikeData(postLikeData: PostLikeData): Promise<void> {
    await this.postLikesDataRepository
      .createQueryBuilder()
      .insert()
      .into(PostLikeData)
      .values(postLikeData)
      .orUpdate(['like_status', 'added_at'], ['id'])
      .execute();
  }

  /*Метод для поиска поста по ID в БД.*/
  public async findById(id: string): Promise<Post | null> {
    return await this.postsRepository.createQueryBuilder('post').where('post.id = :id', { id }).getOne();
  }

  /*Метод для поиска данных о лайке поста по ID поста и ID пользователя в БД.*/
  public async findPostLikeDataByPostIdAndUserId(postId: string, userId: string): Promise<PostLikeData | null> {
    return await this.postLikesDataRepository
      .createQueryBuilder('postLikeData')
      .where('postLikeData.postId = :postId', { postId })
      .andWhere('postLikeData.userId = :userId', { userId })
      .getOne();
  }

  /*Метод для soft удаления поста по ID в БД.*/
  public async markAsDeletedById(id: string): Promise<void> {
    await this.postsRepository.createQueryBuilder().softDelete().where('id = :id', { id }).execute();
  }

  /*Метод для hard удаления поста по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    await this.postsRepository.createQueryBuilder().delete().where('id = :id', { id }).execute();
  }

  /*Метод для soft удаления постов по ID блога в БД.*/
  public async markAllAsDeletedByBlogId(blogId: string): Promise<void> {
    await this.postsRepository.createQueryBuilder().softDelete().where('blogId = :blogId', { blogId }).execute();
  }

  /*Метод для hard удаления постов по ID блога в БД.*/
  public async deleteAllByBlogId(blogId: string): Promise<void> {
    await this.postsRepository.createQueryBuilder().delete().where('blogId = :blogId', { blogId }).execute();
  }

  /*Метод для soft удаления данных о лайке поста по ID поста и ID пользователя в БД.*/
  public async markPostLikeDataAsDeletedByPostIdAndUserId(postId: string, userId: string): Promise<void> {
    await this.postLikesDataRepository
      .createQueryBuilder()
      .softDelete()
      .where('postId = :postId', { postId })
      .andWhere('userId = :userId', { userId })
      .execute();
  }

  /*Метод для hard удаления данных о лайке поста по ID поста и ID пользователя в БД.*/
  public async deletePostLikeDataByPostIdAndUserId(postId: string, userId: string): Promise<void> {
    await this.postLikesDataRepository
      .createQueryBuilder()
      .delete()
      .where('postId = :postId', { postId })
      .andWhere('userId = :userId', { userId })
      .execute();
  }

  /*Метод для soft удаления данных о лайках поста по ID поста в БД.*/
  public async markAllPostLikeDataAsDeletedByPostId(postId: string): Promise<void> {
    await this.postLikesDataRepository
      .createQueryBuilder()
      .softDelete()
      .where('postId = :postId', { postId })
      .execute();
  }

  /*Метод для hard удаления данных о лайках поста по ID поста в БД.*/
  public async deleteAllPostLikeDataByPostId(postId: string): Promise<void> {
    await this.postLikesDataRepository.createQueryBuilder().delete().where('postId = :postId', { postId }).execute();
  }

  /*Метод для soft удаления данных о лайках постов по ID блога в БД.*/
  public async markAllPostLikeDataAsDeletedByBlogId(blogId: string): Promise<void> {
    await this.postLikesDataRepository
      .createQueryBuilder()
      .softDelete()
      .where('blogId = :blogId', { blogId })
      .execute();
  }

  /*Метод для hard удаления данных о лайках постов по ID блога в БД.*/
  public async deleteAllPostLikeDataByBlogId(blogId: string): Promise<void> {
    await this.postLikesDataRepository.createQueryBuilder().delete().where('blogId = :blogId', { blogId }).execute();
  }
}
