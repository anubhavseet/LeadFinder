import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { LeadsModule } from './leads/leads.module';
import { OutreachModule } from './outreach/outreach.module';
import { AuthModule } from './auth/auth.module';

// Load .env file if available
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
} catch (e) {
  // dotenv package not installed or optional
}

const mongoUri = process.env.MONGODB_URI || 'mongodb://root:password123@localhost:27017/';

@Module({
  imports: [
    MongooseModule.forRoot(mongoUri),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req, res }) => ({ req, res }),
    }),
    AuthModule,
    LeadsModule,
    OutreachModule,
  ],
})
export class AppModule { }
