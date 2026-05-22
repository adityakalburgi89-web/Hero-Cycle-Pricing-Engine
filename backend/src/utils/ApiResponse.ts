export class ApiResponse<T> {
  public statusCode: number;
  public success: boolean;
  public message: string;
  public data: T | null;

  constructor(statusCode: number, data: T | null, message: string = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}
