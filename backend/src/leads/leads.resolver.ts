import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { EmailFinderService } from './email-finder.service';
import { SmsDispatcherService } from './sms-dispatcher.service';
import { Lead } from './models/lead.model';
import { SyncLeadsInput, UpdateLeadStatusInput, SaveScraperConfigInput } from './dto/sync-leads.input';
import { LeadFilterInput, PaginationInput } from './dto/lead-filter.input';
import { LeadStats, PaginatedLeads, SyncLeadsResult, ScraperConfig } from './dto/lead-stats.object';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/models/user.model';

@Resolver(() => Lead)
export class LeadsResolver {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly emailFinderService: EmailFinderService,
    private readonly smsDispatcherService: SmsDispatcherService,
  ) {}

  @Query(() => PaginatedLeads, { name: 'leads', description: 'Fetch leads with filters and pagination' })
  @UseGuards(GqlAuthGuard)
  async getLeads(
    @CurrentUser() user: User,
    @Args('filter', { type: () => LeadFilterInput, nullable: true }) filter?: LeadFilterInput,
    @Args('pagination', { type: () => PaginationInput, nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedLeads> {
    const userId = user?.id || (user as any)?._id?.toString();
    return this.leadsService.findAll(filter, pagination, userId);
  }

  @Query(() => Lead, { name: 'lead', nullable: true, description: 'Fetch single lead by ID' })
  @UseGuards(GqlAuthGuard)
  async getLead(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Lead> {
    const userId = user?.id || (user as any)?._id?.toString();
    return this.leadsService.findOne(id, userId);
  }

  @Query(() => LeadStats, { name: 'leadStats', description: 'Get analytics summary of all scraped leads' })
  @UseGuards(GqlAuthGuard)
  async getLeadStats(@CurrentUser() user: User): Promise<LeadStats> {
    const userId = user?.id || (user as any)?._id?.toString();
    return this.leadsService.getStats(userId);
  }

  @Mutation(() => SyncLeadsResult, { name: 'syncLeads', description: 'Batch upload scraped leads from Chrome Extension' })
  @UseGuards(GqlAuthGuard)
  async syncLeads(
    @CurrentUser() user: User,
    @Args('input') input: SyncLeadsInput,
  ): Promise<SyncLeadsResult> {
    const userId = user?.id || (user as any)?._id?.toString();
    return this.leadsService.syncScrapedLeads(input, userId);
  }

  @Mutation(() => SyncLeadsResult, { name: 'verifyDatabaseWebsites', description: 'Audit and verify all database leads missing websites via OSINT' })
  @UseGuards(GqlAuthGuard)
  async verifyDatabaseWebsites(): Promise<SyncLeadsResult> {
    const res = await this.leadsService.verifyAndCleanDatabaseWebsites();
    return {
      addedCount: 0,
      updatedCount: res.updatedCount,
      totalProcessed: res.checked,
    };
  }

  @Mutation(() => Lead, { name: 'updateLeadStatus', description: 'Update CRM lead status and notes' })
  @UseGuards(GqlAuthGuard)
  async updateLeadStatus(
    @CurrentUser() user: User,
    @Args('input') input: UpdateLeadStatusInput,
  ): Promise<Lead> {
    const userId = user?.id || (user as any)?._id?.toString();
    return this.leadsService.updateStatus(input, userId);
  }

  @Mutation(() => Boolean, { name: 'deleteLead', description: 'Delete a lead by ID' })
  @UseGuards(GqlAuthGuard)
  async deleteLead(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    const userId = user?.id || (user as any)?._id?.toString();
    return this.leadsService.deleteLead(id, userId);
  }

  @Mutation(() => Int, { name: 'deleteLeads', description: 'Batch delete multiple leads by ID array' })
  @UseGuards(GqlAuthGuard)
  async deleteLeads(
    @CurrentUser() user: User,
    @Args('ids', { type: () => [ID] }) ids: string[],
  ): Promise<number> {
    const userId = user?.id || (user as any)?._id?.toString();
    return this.leadsService.deleteLeads(ids, userId);
  }

  @Mutation(() => Lead, { name: 'findEmailForLead', description: 'Search OSINT web sources to discover email for a lead' })
  @UseGuards(GqlAuthGuard)
  async findEmailForLead(@Args('id', { type: () => ID }) id: string): Promise<Lead> {
    return this.emailFinderService.findEmailForLead(id);
  }

  @Mutation(() => Lead, { name: 'updateLeadEmail', description: 'Update lead email and source' })
  @UseGuards(GqlAuthGuard)
  async updateLeadEmail(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('email') email: string,
    @Args('emailSource', { nullable: true }) emailSource?: string,
  ): Promise<Lead> {
    const userId = user?.id || (user as any)?._id?.toString();
    return this.leadsService.updateEmail(id, email, emailSource, userId);
  }

  @Mutation(() => Lead, { name: 'sendSmsPitchForLead', description: 'Automated backend Email-to-SMS gateway pitch dispatch to lead' })
  @UseGuards(GqlAuthGuard)
  async sendSmsPitchForLead(@Args('id', { type: () => ID }) id: string): Promise<Lead> {
    return this.smsDispatcherService.sendSmsPitchForLead(id);
  }

  @Mutation(() => SyncLeadsResult, { name: 'batchSendSmsPitches', description: 'Batch dispatch SMS pitches to multiple selected leads' })
  @UseGuards(GqlAuthGuard)
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

  @Query(() => ScraperConfig, { name: 'scraperConfig', description: 'Get global scraper configuration for bookmarklet and extension' })
  getScraperConfig(): ScraperConfig {
    return this.leadsService.getScraperConfig();
  }

  @Mutation(() => ScraperConfig, { name: 'saveScraperConfig', description: 'Save global scraper configuration across tabs and sessions' })
  @UseGuards(GqlAuthGuard)
  saveScraperConfig(@Args('input') input: SaveScraperConfigInput): ScraperConfig {
    return this.leadsService.saveScraperConfig(input);
  }
}

