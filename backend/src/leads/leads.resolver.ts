import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { LeadsService } from './leads.service';
import { EmailFinderService } from './email-finder.service';
import { Lead } from './models/lead.model';
import { SyncLeadsInput, UpdateLeadStatusInput } from './dto/sync-leads.input';
import { LeadFilterInput, PaginationInput } from './dto/lead-filter.input';
import { LeadStats, PaginatedLeads, SyncLeadsResult } from './dto/lead-stats.object';

@Resolver(() => Lead)
export class LeadsResolver {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly emailFinderService: EmailFinderService,
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
}
