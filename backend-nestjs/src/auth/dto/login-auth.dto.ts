import { IsEmail, IsString } from 'class-validator';

export class LoginAuthDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;

    @IsString()
    password: string;
}