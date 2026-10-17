import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, WhereExpressionBuilder } from 'typeorm';
import { normalizeEmail } from '../../../../core/utils/email/normalize-email.util';
import { User } from '../../domain/users/users.entity';

/*Репозиторий для пользователей.*/
@Injectable()
export class UsersRepository {
  public constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  /*Метод для сохранения пользователя в БД.*/
  public async save(user: User): Promise<void> {
    await this.usersRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(user)
      .orUpdate(['password_hash', 'is_confirmed'], ['id'])
      .execute();
  }

  /*Метод для поиска пользователя по ID в БД.*/
  public async findById(id: string): Promise<User | null> {
    /*"user" является зарезервированным словом в PostgreSQL, поэтому используем алиас "u".*/
    return await this.usersRepository.createQueryBuilder('u').where('u.id = :id', { id }).getOne();
  }

  /*Метод для поиска пользователя по логину в БД.*/
  public async findByLogin(login: string): Promise<User | null> {
    return await this.usersRepository.createQueryBuilder('u').where('u.login ILIKE :login', { login }).getOne();
  }

  /*Метод для поиска пользователя по email в БД.*/
  public async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail: string = normalizeEmail(email);
    return await this.usersRepository
      .createQueryBuilder('u')
      .where('u.email ILIKE :email', { email: normalizedEmail })
      .getOne();
  }

  /*Метод для поиска пользователя по логину или email в БД.*/
  public async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const normalizedEmail: string = normalizeEmail(loginOrEmail);

    /*Использование "Brackets" заставит выполнить такой SQL запрос:
    WHERE (u.email ILIKE $1 OR u.login ILIKE $2) AND u."deletedAt" IS NULL.
    Без "Brackets", из-за того, что в SQL оператор "AND" имеет более высокий приоритет, чем оператор "OR", выполнялся бы
    такой SQL запрос: WHERE u.email ILIKE $1 OR (u.login ILIKE $2 AND u."deletedAt" IS NULL).*/
    return await this.usersRepository
      .createQueryBuilder('u')
      .where(
        new Brackets((queryBuilder: WhereExpressionBuilder): void => {
          queryBuilder
            .where('u.email ILIKE :email', { email: normalizedEmail })
            .orWhere('u.login ILIKE :login', { login: loginOrEmail });
        })
      )
      .getOne();
  }

  /*Метод для soft удаления пользователя по ID в БД.*/
  public async markAsDeletedById(id: string): Promise<void> {
    await this.usersRepository.createQueryBuilder().softDelete().where('id = :id', { id }).execute();
  }

  /*Метод для hard удаления пользователя по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    await this.usersRepository.createQueryBuilder().delete().where('id = :id', { id }).execute();
  }
}
