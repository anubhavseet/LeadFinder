import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { LeadsService } from './leads.service';
import { EmailFinderService } from './email-finder.service';
import { SmsDispatcherService } from './sms-dispatcher.service';
import { Lead } from './models/lead.model';
import { SyncLeadsInput, UpdateLeadStatusInput } from './dto/sync-leads.input';
import { LeadFilterInput, PaginationInput } from './dto/lead-filter.input';
import { LeadStats, PaginatedLeads, SyncLeadsResult } from './dto/lead-stats.object';

@Resolver(() => Lead)
export class LeadsResolver {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly emailFinderService: EmailFinderService,
    private readonly smsDispatcherService: SmsDispatcherService,
  ) {}

  @Query(() => PaginatedLeads, { name: 'leads', description: 'Fetch leads with filters and pagination' })
  async getLeads(
    @Args('filter', { type: () => LeadFilterInput, nullable: true }) filter?: LeadFilterInput,
    @Args('pagination', { type: () => PaginationInput, nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedLeads> {
    return this.leadsService.findAll(filter, pagination);
  }

  @Query(() => Lead, { name: 'lead', nullable: true, description: 'Fetch single lead by ID' })
  async getLead(@Args('id', { type: () => ID }) id: string): Promise<Lead> {
    return this.leadsService.findOne(id);
  }

  @Query(() => LeadStats, { name: 'leadStats', description: 'Get analytics summary of all scraped leads' })
  async getLeadStats(): Promise<LeadStats> {
    return this.leadsService.getStats();
  }

  @Mutation(() => SyncLeadsResult, { name: 'syncLeads', description: 'Batch upload scraped leads from Chrome Extension' })
  async syncLeads(@Args('input') input: SyncLeadsInput): Promise<SyncLeadsResult> {
    return this.leadsService.syncScrapedLeads(input);
  }

  @Mutation(() => Lead, { name: 'updateLeadStatus', description: 'Update CRM lead status and notes' })
  async updateLeadStatus(@Args('input') input: UpdateLeadStatusInput): Promise<Lead> {
    return this.leadsService.updateStatus(input);
  }

  @Mutation(() => Boolean, { name: 'deleteLead', description: 'Delete a lead by ID' })
  async deleteLead(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.leadsService.deleteLead(id);
  }

  @Mutation(() => Lead, { name: 'findEmailForLead', description: 'Search OSINT web sources to discover email for a lead' })
  async findEmailForLead(@Args('id', { type: () => ID }) id: string): Promise<Lead> {
    return this.emailFinderService.findEmailForLead(id);
  }

  @Mutation(() => Lead, { name: 'updateLeadEmail', description: 'Update lead email and source' })
  async updateLeadEmail(
    @Args('id', { type: () => ID }) id: string,
    @Args('email') email: string,
    @Args('emailSource', { nullable: true }) emailSource?: string,
  ): Promise<Lead> {
    return this.leadsService.updateEmail(id, email, emailSource);
  }

  @Mutation(() => Lead, { name: 'sendSmsPitchForLead', description: 'Automated backend Email-to-SMS gateway pitch dispatch to lead' })
  async sendSmsPitchForLead(@Args('id', { type: () => ID }) id: string): Promise<Lead> {
    return this.smsDispatcherService.sendSmsPitchForLead(id);
  }

  @Mutation(() => SyncLeadsResult, { name: 'batchSendSmsPitches', description: 'Batch dispatch SMS pitches to multiple selected leads' })
  async batchSendSmsPitches(
    @Args('leadIds', { type: () => [ID] }) leadIds: string[],
  ): Promise<SyncLeadsResult> {
    const res = await this.smsDispatcherService.batchSendSmsPitches(leadIds);
    return {
      addedCount: 0,
      updatedCount: res.successCount,
      totalProcessed: res.processed,
    };
  }
}
