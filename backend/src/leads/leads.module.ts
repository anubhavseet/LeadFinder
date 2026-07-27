import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lead, LeadSchema } from './models/lead.model';
import { LeadsService } from './leads.service';
import { LeadsResolver } from './leads.resolver';
import { EmailFinderService } from './email-finder.service';
import { SmsDispatcherService } from './sms-dispatcher.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
  ],
  providers: [LeadsService, LeadsResolver, EmailFinderService, SmsDispatcherService],
  exports: [LeadsService, EmailFinderService, SmsDispatcherService],
})
export class LeadsModule {}
