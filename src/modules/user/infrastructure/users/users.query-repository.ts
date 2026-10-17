import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { SortDirectionInputDTO } from '../../../../core/pagination/input-dto/sort-direction.input-dto';
import { GetUserListQueryInputDTO } from '../../api/users/input-dto/query/get-user-list-query.input-dto';
import { User, UserList } from '../../domain/users/users.entity';

/*Query-репозиторий для пользователей.*/
@Injectable()
export class UsersQueryRepository {
  public constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  /*Метод для поиска пользователя по ID в БД.*/
  public async findById(id: string): Promise<User | null> {
    return await this.usersRepository.createQueryBuilder('u').where('u.id = :id', { id }).getOne();
  }

  /*Метод для поиска пользователей в БД.*/
  public async findAll(dto: GetUserListQueryInputDTO): Promise<{ items: UserList; totalCount: number }> {
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip: number = dto.calculateSkip();
    /*Создаем список допустимых полей для сортировки в целях защиты от SQL-инъекций, так как имена полей в клаузу
    "ORDER BY" нельзя передавать параметрами через $1, поскольку СУБД считает параметры строго значениями данных.*/
    const allowedSortFields: Record<string, keyof User> = { login: 'login', email: 'email', createdAt: 'createdAt' };
    /*Если пришедшее значение "dto.sortBy" нет в ключах словаря, то выбирается безопасный вариант "createdAt".*/
    const sortField: keyof User = allowedSortFields[dto.sortBy] ?? 'createdAt';
    /*Маппим направления сортировки в ключевые слова PostgreSQL.*/
    const sortDirection: 'ASC' | 'DESC' = dto.sortDirection === SortDirectionInputDTO.Asc ? 'ASC' : 'DESC';
    /*Создаем экземпляр класса "QueryBuilder".*/
    const queryBuilder: SelectQueryBuilder<User> = this.usersRepository.createQueryBuilder('u');

    /*Динамически добавляем условие для клаузы "WHERE":
    1. Если были указаны условия для поиска по логину и email, то проверяем:
    1.1 Что значение по полю "login" подходит к условию для поиска по логину, либо что значение по полю "originalEmail"
    подходит к условию для поиска по email.
    1.2 На soft удаление.
    2. Если было указано условие для поиска по логину, то проверяем:
    2.1 Что значение по полю "login" подходит к условию для поиска по логину.
    2.2 На soft удаление.
    3. Если было указано условие для поиска по email, то проверяем:
    3.1 Что значение по полю "originalEmail" подходит к условию для поиска по email.
    3.2 На soft удаление.
    4. Если не было указано условий для поиска по логину и email, то проверяем только на soft удаление.*/
    if (dto.searchLoginTerm && dto.searchEmailTerm) {
      queryBuilder.where(
        new Brackets(subQb => {
          subQb
            .where('u.login ILIKE :searchLogin', { searchLogin: `%${this._escapeLike(dto.searchLoginTerm!)}%` })
            .orWhere('u.originalEmail ILIKE :searchEmail', {
              searchEmail: `%${this._escapeLike(dto.searchEmailTerm!)}%`,
            });
        })
      );
    } else if (dto.searchLoginTerm) {
      queryBuilder.where('u.login ILIKE :searchLogin', { searchLogin: `%${this._escapeLike(dto.searchLoginTerm)}%` });
    } else if (dto.searchEmailTerm) {
      queryBuilder.where('u.originalEmail ILIKE :searchEmail', {
        searchEmail: `%${this._escapeLike(dto.searchEmailTerm)}%`,
      });
    }

    /*Добавляем сортировку.*/
    queryBuilder.orderBy(`u.${sortField}`, sortDirection).addOrderBy('u.id', 'ASC');
    /*Добавляем пагинацию и выполняем запрос.*/
    queryBuilder.skip(skip).take(dto.pageSize);
    /*Последовательно выполняем запрос данных и подсчет общего количества элементов.*/
    const [items, totalCount]: [User[], number] = await queryBuilder.getManyAndCount();
    /*Возвращаем данные по пользователям.*/
    return { items, totalCount };
  }

  /*Создаем метод, который ставит символ "\" перед символами "\", "%" и "_" в строке. Это нужно, так как в SQL-операторе
  "ILIKE" символы "%" и "_" являются командами поиска, а символ "\" является символом экранирования по умолчанию в
  PostgreSQL, и если пользователь введет любой из них в строке поиска, то БД воспримет их как команды, а не как обычные
  символы, что сломает логику поиска.*/
  private _escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, '\\$&');
  }
}
