import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/4f761653-75df-4724-8245-3492ee79f545',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.ts:7',message:'Bootstrap started',data:{envCheck:{supabaseUrl:!!process.env.SUPABASE_URL,jwtSecret:!!process.env.JWT_SECRET}},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  try {
    const app = await NestFactory.create(AppModule);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4f761653-75df-4724-8245-3492ee79f545',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.ts:11',message:'AppModule created successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

  // CORS 설정
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Cookie Parser
  app.use(cookieParser());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('MIDAS 한의원 API')
    .setDescription('MIDAS 한의원 홈페이지 API 문서')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 토큰을 입력하세요',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

    const port = process.env.PORT || 3001;
    const host = '0.0.0.0'; // Fly.io에서 모든 인터페이스에서 수신 대기
    await app.listen(port, host);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4f761653-75df-4724-8245-3492ee79f545',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.ts:28',message:'Server started successfully',data:{port},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger API Docs: http://localhost:${port}/api`);
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4f761653-75df-4724-8245-3492ee79f545',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.ts:32',message:'Bootstrap error',data:{errorMessage:error?.message,errorStack:error?.stack,errorName:error?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    console.error('Failed to start application:', error);
    throw error;
  }
}
bootstrap().catch((error) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/4f761653-75df-4724-8245-3492ee79f545',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.ts:40',message:'Bootstrap catch error',data:{errorMessage:error?.message,errorStack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  console.error('Unhandled error:', error);
  process.exit(1);
});
