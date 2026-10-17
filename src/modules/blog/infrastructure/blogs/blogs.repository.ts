import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../../domain/blogs/blog.entity';

/*Репозиторий для блогов.*/
@Injectable()
export class BlogsRepository {
  public constructor(@InjectRepository(Blog) private blogsRepository: Repository<Blog>) {}

  /*Метод для сохранения блога в БД.*/
  public async save(blog: Blog): Promise<void> {
    await this.blogsRepository
      .createQueryBuilder()
      .insert()
      .into(Blog)
      .values(blog)
      .orUpdate(['name', 'description', 'website_url'], ['id'])
      .execute();
  }

  /*Метод для поиска блога по ID в БД.*/
  public async findById(id: string): Promise<Blog | null> {
    return await this.blogsRepository.createQueryBuilder('blog').where('blog.id = :id', { id }).getOne();
  }

  /*Метод для soft удаления блога по ID в БД.*/
  public async markAsDeletedById(id: string): Promise<void> {
    await this.blogsRepository.createQueryBuilder().softDelete().where('id = :id', { id }).execute();
  }

  /*Метод для hard удаления блога по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    await this.blogsRepository.createQueryBuilder().delete().where('id = :id', { id }).execute();
  }
}
