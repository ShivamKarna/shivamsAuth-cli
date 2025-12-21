import type{ httpStatusCode } from "./http.js";


export enum AppErrorCode {
  TokenExpired = "TOKEN_EXPIRED",
  InvalidCredentials="INVALID_CREDENTIALS"
}

class AppError extends Error{
  constructor(
    public statusCode : httpStatusCode,
    public message : string,
    public errorCode?:AppErrorCode
  ){
    super(message)
  }
}


export {AppError}
