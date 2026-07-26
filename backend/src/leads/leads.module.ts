import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lead, LeadSchema } from './models/lead.model';
import { LeadsService } from './leads.service';
import { LeadsResolver } from './leads.resolver';
import { EmailFinderService } from './email-finder.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
  ],
  providers: [LeadsService, LeadsResolver, EmailFinderService],
  exports: [LeadsService, EmailFinderService],
})
export class LeadsModule {}
