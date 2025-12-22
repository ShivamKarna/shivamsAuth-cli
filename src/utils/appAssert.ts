import { AppError,AppErrorCode } from "./AppError.js";
import type{ httpStatusCode } from "./http.js";

export type AppAssertParams = <T>(
  condition: T,
  options: {
    statusCode: httpStatusCode,
    message: string,
    errorCode?: AppErrorCode
  }
) => asserts condition is NonNullable<T>;

const appAssert : AppAssertParams = (
condition,
options
)=>{
  if(!condition){
    throw new AppError(options.statusCode, options.message, options.errorCode);
  }
}

export  {appAssert};
