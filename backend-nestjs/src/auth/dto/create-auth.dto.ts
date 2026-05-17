import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class CreateAuthDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự' })
    password: string;

    @IsOptional()
    @IsString()
    fullName?: string;
}