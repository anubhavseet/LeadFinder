import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType({ description: 'Generated outreach pitch for a specific lead' })
export class OutreachPitch {
  @Field(() => String)
  leadId: string;

  @Field(() => String)
  businessName: string;

  @Field(() => String)
  serviceType: string;

  @Field(() => String)
  subject: string;

  @Field(() => String)
  body: string;

  @Field(() => [String])
  keyHighlights: string[];
}
