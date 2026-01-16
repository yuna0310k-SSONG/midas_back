import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Global()
@Module({
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: (configService: ConfigService): SupabaseClient => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4f761653-75df-4724-8245-3492ee79f545',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.module.ts:10',message:'Creating Supabase client',data:{hasUrl:!!configService.get('SUPABASE_URL'),hasKey:!!configService.get('SUPABASE_SERVICE_ROLE_KEY')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        const supabaseKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseKey) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4f761653-75df-4724-8245-3492ee79f545',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.module.ts:15',message:'Supabase config missing',data:{supabaseUrl:!!supabaseUrl,supabaseKey:!!supabaseKey},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          throw new Error('Supabase URL and Service Role Key must be provided');
        }

        try {
          const client = createClient(supabaseUrl, supabaseKey);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4f761653-75df-4724-8245-3492ee79f545',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.module.ts:22',message:'Supabase client created',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          return client;
        } catch (error) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4f761653-75df-4724-8245-3492ee79f545',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.module.ts:26',message:'Supabase client creation failed',data:{errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          throw error;
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: ['SUPABASE_CLIENT'],
})
export class SupabaseModule {}
