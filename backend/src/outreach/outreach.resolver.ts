import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { OutreachService } from './outreach.service';
import { OutreachPitch } from './models/pitch.model';

@Resolver(() => OutreachPitch)
export class OutreachResolver {
  constructor(private readonly outreachService: OutreachService) {}

  @Mutation(() => OutreachPitch, { name: 'generatePitch', description: 'Generate tailored freelancing cold outreach pitch for a lead' })
  async generatePitch(
    @Args('leadId', { type: () => ID }) leadId: string,
    @Args('serviceType', { type: () => String, nullable: true }) serviceType?: string,
  ): Promise<OutreachPitch> {
    return this.outreachService.generatePitch(leadId, serviceType);
  }
}
