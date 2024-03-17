# AAFrame: Developer Tooling for Farcaster Frames Integration
## Usage 
we've developed a demo use case, but the aim of the project is to be adaptable: anyone can modify the address and network.
The main frame is https://smart-account-frame-template-projects.vercel.app

Or you can generate a frame for any address on base and arbitrum with the format https://smart-account-frame-template-projects.vercel.app/{network}/{reception_address}

## Overview
AAFrame is a cutting-edge developer tool designed to facilitate the seamless integration of Account Abstraction into Farcaster and Warpcast Frames. This tool enables developers to embed direct blockchain functionalities such as token sending, swapping, and NFT minting right within social media platforms. AAFrame is built for developers aiming to bridge the gap between blockchain technology and social media user experiences, making blockchain interactions intuitive and integrated within the Warpcast app ecosystem.

## Key Features
- **Effortless Account Abstraction**: Streamline the integration of blockchain capabilities into a Farcaster Frame with the Safe 4337 Module.
- **Direct On-Feed Blockchain Interactions**: Enable users to perform blockchain transactions directly within their social media feeds, enhancing engagement and interaction.
- **Developer-Friendly Setup**: With just an image, an address, and a network, you can create engaging and functional frames for a wide range of blockchain activities.
- **Scalable and Future-Proof**: Designed with scalability in mind, AAFrame is ready for future expansions, including automatic generation of blockchain interaction codes and more advanced features for user transactions without traditional wallet dependencies.
- **One to rule them all**: With FarcasterID integration, our solution could abstract accounts and transaction on any frame using our service.

## Technologies Utilized
- **Blockchain Integration Modules**: Safe 4337 Module, Safe accounts v1.4.1, Safe SDK, and Protocol Kit.
- **Development Tools**: Pimlimco Paymaster client, ERC-4337, Smart Account, permissionless.js, and more.
- **Framework Support**: React components and TypeScript utilities from Onchain Kit, tailored for building immersive Frames.
- **Data Management**: MongoDB for efficient data handling, including FarcasterID and private key storage.

## Getting Started
To leverage AAFrame for your Farcaster Frames projects, follow these steps:

1. Gather your frame's image, blockchain address, and network information.
2. Refer to the `docs` directory for detailed AAFrame integration instructions.
3. Utilize the provided React components and TypeScript utilities for Frame development.
4. Test your Frame within Warpcast to ensure a flawless user experience.

## Account abstraction with Farcaster ID
**In the mongo branch**:

- **1.** We parse the FrameRequest by accessing it's trusted data thanks to a Farcaster Hub. We access it through getSSLHubRpcClient.
- **2.** We check the validity of the Request (signeb by user's farecaster account) and retrieve its Farecaster ID
- **3.** When user clicks en create / retrieve wallet, we check the mongodg database if an account match the Farecaster ID:
**Yes:** we get the matching keypair and feed the private key to a Smart Account
**No:** we create a keypair, store it in the mongodb collection then feed it to a Smart Account

*This can be found in lib/farcaster.ts*

- **4.** Using permissionless.js, we feed the private key into the privateKeyToSafeSmartAccount function
- **5.** If the account was already created we also feed the safe address
- **6.** We then prepare, sign and send the safe creation using the Safe 4337 Module

*This can be found in api/account/route.ts*

- **7.** We use the same process for the transaction in the transaction route.

**Thanks to this architechture, we can provide a Safe Smart Account to user without having to use an external wallet, and while keeping security thanks to the trusted signed messages from farcaster. We also don't need users to pay gas, therefore leveraging Paymasters thanks to the Safe 4337 Module**

### TODO
- Improve mongodb security (private key are stored directly on the db which could be dangerous)
- Abstract more the Frame Building to let other builders use our stack
- Fixing lack of optimization in Frames to improve flow
- Add an external wallet AAFrame to fund Safe Smart Accounts

## Contribute
AAFrame thrives on community contributions. We encourage you to contribute whether it's through new feature development, bug fixes, or improving documentation.

1. Fork the project repository.
2. Create a feature-specific branch.
3. Commit and push your changes.
4. Open a pull request for review.

## License
AAFrame is open-source software licensed under the [MIT License](LICENSE).

## Acknowledgments
This project was developed during a hackathon, and we extend our gratitude to all developers, contributors, and organizers involved. Special thanks to the Farcaster and Warpcast communities for their invaluable insights and support.
