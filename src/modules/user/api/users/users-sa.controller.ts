import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { CreateUserInputDTO } from './input-dto/create-user.input-dto';
import { GetUserListQueryInputDTO } from './input-dto/query/get-user-list-query.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { UserListOutputDTO, UserOutputDTO } from './output-dto/user.output-dto';
import { BasicAuthGuard } from '../../../../core/guards/basic-auth/basic-auth.guard';
import { SETTINGS } from '../../../../core/settings/settings';
import { UsersSaControllerSwaggerDecorators } from '../../../../core/swagger/decorators/user-module/users-sa-controller.swagger-decorators';
import { CreateConfirmedUserCommand } from '../../application/users/commands/create-confirmed-user.command';
import { MarkUserAsDeletedByIdCommand } from '../../application/users/commands/mark-user-as-deleted-by-id.command';
import { GetUserListQuery } from '../../application/users/queries/get-user-list.query';

/*SA-контроллер для пользователей.*/
@ApiTags(SETTINGS.USERS_SA_API_TAG)
@ApiBasicAuth()
@UseGuards(BasicAuthGuard)
@Controller(SETTINGS.USERS_SA_PREFIX)
export class UsersSaController {
  public constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  /*001. POST-запрос по созданию подтвержденного пользователя.*/
  @UsersSaControllerSwaggerDecorators.createConfirmedUser
  @Post(SETTINGS.USERS_SA_CREATE_CONFIRMED_USER_PATH)
  @HttpCode(HttpStatus.CREATED)
  public async createConfirmedUser(@Body() body: CreateUserInputDTO): Promise<UserOutputDTO> {
    /*Просим шину "CommandBus" создать подтвержденного пользователя.*/
    return this.commandBus.execute(new CreateConfirmedUserCommand(body));
  }

  /*002. GET-запрос по поиску пользователей с пагинацией, используя query-параметры.*/
  @UsersSaControllerSwaggerDecorators.getUserList
  @Get(SETTINGS.USERS_SA_GET_USER_LIST_PATH)
  @HttpCode(HttpStatus.OK)
  public async getUserList(
    @Query() query: GetUserListQueryInputDTO
  ): Promise<PaginationMetaDataOutputDTO<UserListOutputDTO>> {
    /*Просим шину "QueryBus" найти пользователей.*/
    return this.queryBus.execute(new GetUserListQuery(query));
  }

  /*003. DELETE-запрос по удалению пользователя по ID, используя URI-параметры.*/
  @UsersSaControllerSwaggerDecorators.deleteUserById
  @Delete(SETTINGS.USERS_SA_DELETE_USER_BY_ID_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteUserById(@Param('id') id: string): Promise<void> {
    /*Просим шину "CommandBus" soft удалить пользователя по ID.*/
    await this.commandBus.execute(new MarkUserAsDeletedByIdCommand(id));
  }
}
