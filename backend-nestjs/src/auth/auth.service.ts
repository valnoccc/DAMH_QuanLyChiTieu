import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/auth.entity';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async register(createAuthDto: CreateAuthDto) {
    const { email, password, fullName } = createAuthDto;

    const existUser = await this.userRepository.findOne({ where: { email } });
    if (existUser) throw new BadRequestException('Email đã tồn tại!');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      full_name: fullName,
    });

    await this.userRepository.save(user);
    return { message: 'Đăng ký thành công' };
  }

  async login(loginDto: LoginAuthDto) {
    const user = await this.userRepository.findOne({ where: { email: loginDto.email } });
    if (!user) throw new UnauthorizedException('Email không chính xác');

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Mật khẩu không chính xác');

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, full_name: user.full_name }
    };
  }
}