import { Module } from '@nestjs/common';
import { LeadsModule } from '../leads/leads.module';
import { OutreachService } from './outreach.service';
import { OutreachResolver } from './outreach.resolver';

@Module({
  imports: [LeadsModule],
  providers: [OutreachService, OutreachResolver],
  exports: [OutreachService],
})
export class OutreachModule {}
