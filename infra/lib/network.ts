import { Construct } from "constructs";
import { TerraformStack, Token } from "cdktf";

import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { VpcEndpoint } from "@cdktf/provider-aws/lib/vpc-endpoint";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Vpc } from "../.gen/modules/vpc";

interface NetworkStackConfig {
  region: string,
};

export class NetworkStack extends TerraformStack {
  constructor(scope: Construct, id: string, config: NetworkStackConfig) {
    super(scope, id);

    // variables
    const region = config.region;

    /*--------------------------------
    /* Provider definition
    /*--------------------------------*/
    new AwsProvider(this, "aws", {
      region: region,
      defaultTags: [
        {tags: {"ManagedBy": "CDKTF"}},
      ],
    });

    /*--------------------------------
    /* VPC
    /*--------------------------------*/
    const vpc = new Vpc(this, "vpc", {
      name: "vpc-multi-az",
      cidr: "10.0.0.0/16",

      azs: [`${region}a`, `${region}c`, `${region}d`],
      privateSubnets: ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"],
      publicSubnets: ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"],
      databaseSubnetNames: ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"],

      enableNatGateway: false,
      enableDnsSupport: true,
    })

    /*--------------------------------
    /* SecurityGroup for VPC Endpoint
    /*--------------------------------*/
    const securitygroup = new SecurityGroup(this, "security-group-vpce", {
      vpcId: Token.asString(vpc.vpcIdOutput),
      name: "vpcendpoint",
      description: "for vpc endpoint security group",

      ingress: [
        {
          fromPort: 443,
          toPort: 443,
          protocol: "tcp",
          cidrBlocks: ["0.0.0.0/0"]
        }
      ],
      egress: [
        {
          fromPort: 0,
          toPort: 0,
          protocol: "-1",
          cidrBlocks: ["0.0.0.0/0"]
        }
      ]
    })


    /*--------------------------------
    /* VPC Endpoint
    /*--------------------------------*/
    // ECR
    new VpcEndpoint(this, "ecrdkr", {
      vpcId: Token.asString(vpc.vpcIdOutput),
      serviceName: `com.amazonaws.${region}.ecr.dkr`,
      vpcEndpointType: "Interface",

      securityGroupIds: [Token.asString(securitygroup.id)],

      privateDnsEnabled: true,

      tags: {
        Name: `${vpc.vpcIdOutput}-ecrdkr-endpoint`
      }
    });
    new VpcEndpoint(this, "ecrapi", {
      vpcId: Token.asString(vpc.vpcIdOutput),
      serviceName: `com.amazonaws.${region}.ecr.api`,
      vpcEndpointType: "Interface",

      securityGroupIds: [Token.asString(securitygroup.id)],

      privateDnsEnabled: true,

      tags: {
        Name: `${vpc.vpcIdOutput}-ecrapi-endpoint`
      }
    });

    // S3 Endpoint
    new VpcEndpoint(this, "s3", {
      vpcId: Token.asString(vpc.vpcIdOutput),
      serviceName: `com.amazonaws.${region}.s3`,

      tags: {
        Name: `${vpc.vpcIdOutput}-s3-endpoint`
      }
    });

    // CloudWatch Logs
    new VpcEndpoint(this, "logs", {
      vpcId: Token.asString(vpc.vpcIdOutput),
      serviceName: `com.amazonaws.${region}.logs`,
      vpcEndpointType: "Interface",

      securityGroupIds: [Token.asString(securitygroup.id)],

      privateDnsEnabled: true,

      tags: {
        Name: `${vpc.vpcIdOutput}-logs-endpoint`
      }
    });

    // ECS Exec
    new VpcEndpoint(this, "ssmmessages", {
      vpcId: Token.asString(vpc.vpcIdOutput),
      serviceName: `com.amazonaws.${region}.ssmmessages`,
      vpcEndpointType: "Interface",

      securityGroupIds: [Token.asString(securitygroup.id)],

      privateDnsEnabled: true,

      tags: {
        Name: `${vpc.vpcIdOutput}-ssmmessages-endpoint`
      }
    });

    // KMS
    new VpcEndpoint(this, "kms", {
      vpcId: Token.asString(vpc.vpcIdOutput),
      serviceName: `com.amazonaws.${region}.kms`,
      vpcEndpointType: "Interface",

      securityGroupIds: [Token.asString(securitygroup.id)],

      privateDnsEnabled: true,

      tags: {
        Name: `${vpc.vpcIdOutput}-kms-endpoint`
      }
    });
  }
}
