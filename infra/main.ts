import { App } from 'cdktf'

import { NetworkStack } from './lib/network'
import { EcrStack } from './lib/ecr'

const app = new App()
new NetworkStack(app, 'network', { region: 'ap-northeast-1' })
new EcrStack(app, 'ecr', { region: 'ap-northeast-1' })
app.synth()
