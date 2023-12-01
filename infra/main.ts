import { Construct } from "constructs";
import { App, TerraformOutput, TerraformStack } from "cdktf";

import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { Instance } from "@cdktf/provider-aws/lib/instance";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Provider definition
    new AwsProvider(this, "aws", {
      region: "ap-northeast-1",
    });

    // EC2
    const ec2Instance = new Instance(this, "compute", {
      ami: "ami-012261b9035f8f938",
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
