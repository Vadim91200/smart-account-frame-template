# AAFrame: Developer Tooling for Farcaster Frames Integration
## Usage 
we've developed a demo use case, but the aim of the project is to be adaptable: anyone can modify the address and network.
The main frame is https://smart-account-frame-template-projects.vercel.app

Or you can generate a frame for any address on base and arbitrum with the format https://smart-account-frame-template-projects.vercel.app/{network}/{reception_address}

## Overview
AAFrame is a cutting-edge developer tool designed to facilitate the seamless integration of Account Abstraction into Farcaster and Warpcast Frames. This tool enables developers to embed direct blockchain functionalities such as token sending, swapping, and NFT minting right within social media platforms. AAFrame is built for developers aiming to bridge the gap between blockchain technology and social media user experiences, making blockchain interactions intuitive and integrated within the Warpcast app ecosystem.

## Key Features
- **Effortless Account Abstraction**: Streamline the integration of blockchain capabilities into your social media applications with minimal setup.
- **Direct On-Feed Blockchain Interactions**: Enable users to perform blockchain transactions directly within their social media feeds, enhancing engagement and interaction.
- **Developer-Friendly Setup**: With just an image, an address, and a network, you can create engaging and functional frames for a wide range of blockchain activities.
- **Scalable and Future-Proof**: Designed with scalability in mind, AAFrame is ready for future expansions, including automatic generation of blockchain interaction codes and more advanced features for user transactions without traditional wallet dependencies.

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
