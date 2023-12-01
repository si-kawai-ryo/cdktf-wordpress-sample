import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";

import { AwsProvider } from "./.gen/providers/aws/provider";
import { Vpc } from "./.gen/providers/aws/vpc";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Provider definition
    new AwsProvider(this, "AWS", {
      region: "ap-northeast-1",
    });

    // VPC
    new Vpc(this, "vpc", {
      cidrBlock: "10.0.0.0/16",
    });
  }
}

const app = new App();
new MyStack(app, "infra");
app.synth();
