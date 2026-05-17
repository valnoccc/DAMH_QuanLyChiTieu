import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';

@Injectable()
export class ReceiptsService {
  private aiEngineUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.aiEngineUrl = this.configService.get<string>('AI_ENGINE_URL') || 'http://localhost:8000';
  }

  async scanReceipt(fileBuffer: Buffer, mimetype: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: 'receipt.jpg',
        contentType: mimetype,
      });

      const response = await firstValueFrom(
        this.httpService.post(`${this.aiEngineUrl}/predict`, formData, {
          headers: formData.getHeaders(),
          timeout: 30000,
        }),
      );

      return response.data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new HttpException(
          'AI Engine chưa khởi động. Vui lòng chạy ai-engine trước.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new HttpException(
        error.response?.data?.message || 'Lỗi khi xử lý hóa đơn',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
