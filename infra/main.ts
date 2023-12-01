import { Construct } from "constructs";
import { App, TerraformOutput, TerraformStack, Token } from "cdktf";

import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { DataAwsAmi } from "@cdktf/provider-aws/lib/data-aws-ami";
import { Instance } from "@cdktf/provider-aws/lib/instance";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Provider definition
    new AwsProvider(this, "aws", {
      region: "ap-northeast-1",
      defaultTags: [
        {tags: {"ManagedBy": "CDKTF"}},
      ],
    });

    // EC2
    const amiImage = new DataAwsAmi(this, "ami", {
      filter: [
        {
          name: "architecture",
          values: ["x86_64"],
        },
        {
          name: "name",
          values: ["al2023-ami-2023*"],
        },
      ],
      mostRecent: true,
      owners: ["amazon"],
    });
    const ec2Instance = new Instance(this, "compute", {
      ami: Token.asString(amiImage.id),
      instanceType: "t2.micro",
      tags: {
        Name: "test-instance"
      }
    });

    // Output
    new TerraformOutput(this, "public_ip", {
      value: ec2Instance.publicIp,
    });
  }
}

const app = new App();
new MyStack(app, "infra");
app.synth();
