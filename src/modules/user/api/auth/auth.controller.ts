import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthUserByLoginOrEmailInputDTO } from './input-dto/auth-user-by-login-or-email.input-dto';
import { ConfirmUserByCodeInputDTO } from './input-dto/confirm-user-by-code.input-dto';
import { RegisterUserInputDTO } from './input-dto/register-user.input-dto';
import { ResendConfirmationEmailInputDTO } from './input-dto/resend-confirmation-email.input-dto';
import { SendPasswordRecoveryCodeInputDTO } from './input-dto/send-password-recovery-code.input-dto';
import { SetNewPasswordByPasswordRecoveryCodeInputDTO } from './input-dto/set-new-password-by-password-recovery-code.input-dto';
import { AuthUserByLoginOrEmailOutputDTO } from './output-dto/auth-user-by-login-or-email.output-dto';
import { AuthUserDataOutputDTO } from './output-dto/auth-user-data.output-dto';
import { CreateNewAccessAndRefreshTokensOutputDTO } from './output-dto/create-new-access-and-refresh-tokens.output-dto';
import { AccessJwtAuthGuard } from '../../../../core/guards/access-jwt-auth/access-jwt-auth.guard';
import { UserAccessJwtAuthContextDTO } from '../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { IpAndUserAgentGuard } from '../../../../core/guards/ip-and-user-agent/ip-and-user-agent.guard';
import { UserLocalAuthContextDTO } from '../../../../core/guards/local-auth/dto/user-local-auth-context.dto';
import { LocalAuthGuard } from '../../../../core/guards/local-auth/local-auth.guard';
import { UserRefreshJwtAuthContextDTO } from '../../../../core/guards/refresh-jwt-auth/dto/user-refresh-jwt-auth-context.dto';
import { RefreshJwtAuthGuard } from '../../../../core/guards/refresh-jwt-auth/refresh-jwt-auth.guard';
import { RequestRateLimitingGuard } from '../../../../core/guards/request-rate-limiting/request-rate-limiting.guard';
import { SETTINGS } from '../../../../core/settings/settings';
import { AuthControllerSwaggerDecorators } from '../../../../core/swagger/decorators/user-module/auth-controller.swagger-decorators';
import { AuthUserCommand } from '../../application/auth/commands/auth-user.command';
import { ConfirmUserByCodeCommand } from '../../application/auth/commands/confirm-user-by-code.command';
import { CreateNewAccessAndRefreshTokensCommand } from '../../application/auth/commands/create-new-access-and-refresh-tokens.command';
import { RegisterUserCommand } from '../../application/auth/commands/register-user.command';
import { ResendConfirmationEmailCommand } from '../../application/auth/commands/resend-confirmation-email.command';
import { RevokeSessionCommand } from '../../application/auth/commands/revoke-session.command';
import { SendPasswordRecoveryCodeCommand } from '../../application/auth/commands/send-password-recovery-code.command';
import { UpdatePasswordByPasswordRecoveryCodeCommand } from '../../application/auth/commands/update-password-by-password-recovery-code.command';
import { GetAuthUserDataByAccessTokenQuery } from '../../application/auth/queries/get-auth-user-data-by-access-token.query';
import { UserAgentAndIpDTO } from './decorators/param-extraction/dto/user-agent-and-ip.dto';
import { ExtractIpAndUserAgentFromRequest } from './decorators/param-extraction/extract-ip-and-user-agent-from-request.param-decorator';
import { ExtractUserDataFromRequest } from './decorators/param-extraction/extract-user-data-from-request.param-decorator';

/*Контроллер для работы с аутентификацией и авторизацией.*/
@ApiTags(SETTINGS.AUTH_API_TAG)
@Controller(SETTINGS.AUTH_PREFIX)
export class AuthController {
  public constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  /*001. POST-запрос по регистрации пользователя.*/
  @AuthControllerSwaggerDecorators.registerUser
  @UseGuards(RequestRateLimitingGuard)
  @Post(SETTINGS.AUTH_REGISTER_USER_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async registerUser(@Body() body: RegisterUserInputDTO): Promise<void> {
    /*Просим шину "CommandBus" зарегистрировать пользователя.*/
    await this.commandBus.execute(new RegisterUserCommand(body));
  }

  /*002. POST-запрос по повторной отправке письма для подтверждения регистрации пользователя.*/
  @AuthControllerSwaggerDecorators.resendConfirmationEmail
  @UseGuards(RequestRateLimitingGuard)
  @Post(SETTINGS.AUTH_RESEND_CONFIRMATION_EMAIL_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async resendConfirmationEmail(@Body() body: ResendConfirmationEmailInputDTO): Promise<void> {
    /*Просим шину "CommandBus" повторно отправить письмо для подтверждения регистрации пользователя.*/
    await this.commandBus.execute(new ResendConfirmationEmailCommand(body));
  }

  /*003. POST-запрос по подтверждению регистрации пользователя по коду подтверждения регистрации пользователя.*/
  @AuthControllerSwaggerDecorators.confirmUserByCode
  @UseGuards(RequestRateLimitingGuard)
  @Post(SETTINGS.AUTH_CONFIRM_USER_BY_CODE_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async confirmUserByCode(@Body() body: ConfirmUserByCodeInputDTO): Promise<void> {
    /*Просим шину "CommandBus" подтвердить регистрацию пользователя по коду подтверждения регистрации пользователя.*/
    await this.commandBus.execute(new ConfirmUserByCodeCommand(body));
  }

  /*004. POST-запрос по отправке письма с кодом восстановления пароля пользователя.*/
  @AuthControllerSwaggerDecorators.sendPasswordRecoveryCode
  @UseGuards(RequestRateLimitingGuard)
  @Post(SETTINGS.AUTH_SEND_PASSWORD_RECOVERY_CODE_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async sendPasswordRecoveryCode(@Body() body: SendPasswordRecoveryCodeInputDTO): Promise<void> {
    /*Просим шину "CommandBus" отправить письмо с кодом восстановления пароля пользователя.*/
    await this.commandBus.execute(new SendPasswordRecoveryCodeCommand(body));
  }

  /*005. POST-запрос по установлению нового пароля пользователя по коду восстановления пароля пользователя.*/
  @AuthControllerSwaggerDecorators.updatePasswordByPasswordRecoveryCode
  @UseGuards(RequestRateLimitingGuard)
  @Post(SETTINGS.AUTH_UPDATE_PASSWORD_BY_PASSWORD_RECOVERY_CODE_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updatePasswordByPasswordRecoveryCode(
    @Body() body: SetNewPasswordByPasswordRecoveryCodeInputDTO
  ): Promise<void> {
    /*Просим шину "CommandBus" установить новый пароль пользователя по коду восстановления пароля пользователя.*/
    await this.commandBus.execute(new UpdatePasswordByPasswordRecoveryCodeCommand(body));
  }

  /*006. POST-запрос по аутентификации пользователя по логину или email и паролю.*/
  @AuthControllerSwaggerDecorators.authUserByLoginOrEmail
  @UseGuards(IpAndUserAgentGuard, RequestRateLimitingGuard, LocalAuthGuard)
  @Post(SETTINGS.AUTH_AUTHENTICATE_USER_BY_LOGIN_OR_EMAIL_PATH)
  @HttpCode(HttpStatus.OK)
  public async authUserByLoginOrEmail(
    @Body() body: AuthUserByLoginOrEmailInputDTO,
    @ExtractUserDataFromRequest() userLocalAuthContext: UserLocalAuthContextDTO,
    @ExtractIpAndUserAgentFromRequest() ipAndUserAgent: UserAgentAndIpDTO,
    @Res({ passthrough: true })
    res: Response
  ): Promise<AuthUserByLoginOrEmailOutputDTO> {
    /*Просим шину "CommandBus" аутентифицировать пользователя.*/
    const { accessToken, refreshToken }: { accessToken: string; refreshToken: string } = await this.commandBus.execute(
      new AuthUserCommand(userLocalAuthContext, ipAndUserAgent)
    );

    /*Отправляем RT клиенту через cookies, используя метод "res.cookie()" из Express.js.*/
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    /*Отправляем AT клиенту через тело ответа.*/
    return { accessToken };
  }

  /*007. POST-запрос по созданию новых AT и RT.*/
  @AuthControllerSwaggerDecorators.createNewAccessAndRefreshTokens
  @UseGuards(IpAndUserAgentGuard, RefreshJwtAuthGuard)
  @Post(SETTINGS.AUTH_CREATE_NEW_ACCESS_AND_REFRESH_TOKENS_PATH)
  @HttpCode(HttpStatus.OK)
  public async createNewAccessAndRefreshTokens(
    @ExtractUserDataFromRequest() userRefreshJwtAuthContext: UserRefreshJwtAuthContextDTO,
    @ExtractIpAndUserAgentFromRequest() ipAndUserAgent: UserAgentAndIpDTO,
    @Res({ passthrough: true })
    res: Response
  ): Promise<CreateNewAccessAndRefreshTokensOutputDTO> {
    /*Просим шину "CommandBus" создать новую пару AT и RT.*/
    const { accessToken, refreshToken }: { accessToken: string; refreshToken: string } = await this.commandBus.execute(
      new CreateNewAccessAndRefreshTokensCommand(userRefreshJwtAuthContext, ipAndUserAgent)
    );

    /*Отправляем RT клиенту через cookies, используя метод "res.cookie()" из Express.js.*/
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    /*Отправляем AT клиенту через тело ответа.*/
    return { accessToken };
  }

  /*008. POST-запрос по отзыву пользовательской сессии.*/
  @AuthControllerSwaggerDecorators.revokeSession
  @UseGuards(RefreshJwtAuthGuard)
  @Post(SETTINGS.AUTH_REVOKE_SESSION_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async revokeSession(
    @ExtractUserDataFromRequest() userRefreshJwtAuthContext: UserRefreshJwtAuthContextDTO
  ): Promise<void> {
    /*Просим шину "CommandBus" отозвать пользовательскую сессию.*/
    await this.commandBus.execute(new RevokeSessionCommand(userRefreshJwtAuthContext));
  }

  /*009. GET-запрос по получению данных пользователя по AT.*/
  @AuthControllerSwaggerDecorators.getAuthUserDataByAccessToken
  @UseGuards(AccessJwtAuthGuard)
  @Get(SETTINGS.AUTH_GET_AUTH_USER_DATA_BY_ACCESS_TOKEN_PATH)
  @HttpCode(HttpStatus.OK)
  public async getAuthUserDataByAccessToken(
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<AuthUserDataOutputDTO> {
    /*Просим шину "QueryBus" найти данные о пользователе по ID пользователя при предоставлении AT.*/
    return this.queryBus.execute(new GetAuthUserDataByAccessTokenQuery(userAccessJwtAuthContext.id));
  }
}
