import { Controller, Delete, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { SecurityDeviceListOutputDTO } from './output-dto/security-device.output-dto';
import { UserRefreshJwtAuthContextDTO } from '../../../../core/guards/refresh-jwt-auth/dto/user-refresh-jwt-auth-context.dto';
import { RefreshJwtAuthGuard } from '../../../../core/guards/refresh-jwt-auth/refresh-jwt-auth.guard';
import { SETTINGS } from '../../../../core/settings/settings';
import { SecurityDevicesControllerSwaggerDecorators } from '../../../../core/swagger/decorators/user-module/security-devices-controller.swagger-decorators';
import { RevokeAllSessionsExceptCurrentOneCommand } from '../../application/auth/commands/revoke-all-sessions-except-current-one.command';
import { RevokeSessionBySecurityDeviceIdCommand } from '../../application/auth/commands/revoke-session-by-security-device-id.command';
import { GetSecurityDeviceListByUserIdQuery } from '../../application/security-devices/queries/get-security-device-list-by-user-id.query';
import { ExtractUserDataFromRequest } from '../auth/decorators/param-extraction/extract-user-data-from-request.param-decorator';

/*Контроллер для пользовательских устройств.*/
@ApiTags(SETTINGS.SECURITY_DEVICES_API_TAG)
@ApiCookieAuth('refreshToken')
@UseGuards(RefreshJwtAuthGuard)
@Controller(SETTINGS.SECURITY_DEVICES_PREFIX)
export class SecurityDevicesController {
  public constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  /*001. GET-запрос по получению пользовательских устройств по ID пользователя.*/
  @SecurityDevicesControllerSwaggerDecorators.getSecurityDeviceListByUserId
  @Get(SETTINGS.SECURITY_DEVICES_GET_SECURITY_DEVICE_LIST_BY_USER_ID_PATH)
  @HttpCode(HttpStatus.OK)
  public getSecurityDeviceListByUserId(
    @ExtractUserDataFromRequest() userRefreshJwtAuthContext: UserRefreshJwtAuthContextDTO
  ): Promise<SecurityDeviceListOutputDTO> {
    /*Просим шину "QueryBus" найти пользовательские устройства по ID пользователя.*/
    return this.queryBus.execute(new GetSecurityDeviceListByUserIdQuery(userRefreshJwtAuthContext.id));
  }

  /*002. DELETE-запрос по отзыву пользовательской сессии по ID пользовательского устройства, используя URI-параметры.*/
  @SecurityDevicesControllerSwaggerDecorators.revokeSessionBySecurityDeviceId
  @Delete(SETTINGS.SECURITY_DEVICES_REVOKE_SESSION_BY_SECURITY_DEVICE_ID_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async revokeSessionBySecurityDeviceId(
    @Param('id') id: string,
    @ExtractUserDataFromRequest() userRefreshJwtAuthContext: UserRefreshJwtAuthContextDTO
  ): Promise<void> {
    /*Просим шину "CommandBus" отозвать пользовательскую сессию по ID пользовательского устройства.*/
    await this.commandBus.execute(new RevokeSessionBySecurityDeviceIdCommand(id, userRefreshJwtAuthContext));
  }

  /*003. DELETE-запрос по отзыву всех пользовательских сессий, кроме текущей.*/
  @SecurityDevicesControllerSwaggerDecorators.revokeAllSessionsExceptCurrentOne
  @Delete(SETTINGS.SECURITY_DEVICES_REVOKE_ALL_SESSIONS_EXCEPT_CURRENT_ONE_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async revokeAllSessionsExceptCurrentOne(
    @ExtractUserDataFromRequest() userRefreshJwtAuthContext: UserRefreshJwtAuthContextDTO
  ): Promise<void> {
    /*Просим шину "CommandBus" отозвать все пользовательские сессии, кроме текущей.*/
    await this.commandBus.execute(new RevokeAllSessionsExceptCurrentOneCommand(userRefreshJwtAuthContext));
  }
}
