import { Construct } from 'constructs'
import { TerraformStack } from 'cdktf'

import { AwsProvider } from '@cdktf/provider-aws/lib/provider'
import { EcrRepository } from '@cdktf/provider-aws/lib/ecr-repository'

interface EcrStackConfig {
  region: string
}
export class EcrStack extends TerraformStack {
  public readonly ecr: EcrRepository

  constructor(scope: Construct, id: string, config: EcrStackConfig) {
    super(scope, id)

    // variables
    const region = config.region

    /*--------------------------------
    /* Provider definition
    /*--------------------------------*/
    new AwsProvider(this, 'aws', {
      region: region,
      defaultTags: [{ tags: { ManagedBy: 'CDKTF' } }],
    })

    /*--------------------------------
    /* ECR
    /*--------------------------------*/
    this.ecr = new EcrRepository(this, 'wordpress', {
      imageScanningConfiguration: {
        scanOnPush: true,
      },
      imageTagMutability: 'MUTABLE',
      name: 'wordpress',
    })
  }
}
